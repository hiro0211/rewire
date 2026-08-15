"""How much people actually use the app: session length and screen dwell time.

`engagement_time_msec` is the only field that measures attention rather than
presence, and nothing in the stack was reading it — 876 rows totalling 24.5
hours sat unused (measured 2026-08-08). It rides exclusively on
`user_engagement` events, which Firebase emits when the app goes to background
or switches screens.

Every duration is reported as median *and* mean. The measured distribution is
brutally skewed — mean session 1,194s against a median of 104s, because a phone
left on a screen keeps accruing wall-clock time — so a mean on its own would
claim the average user spends twenty minutes per visit.
"""
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence

from google.cloud import bigquery

from scripts.analytics.bigquery_client import EVENTS_TABLE, USER_KEY_COLUMN, run_query
from scripts.analytics.bq_sql import param_string


def median(values: Sequence[float]) -> float:
    """Middle value, averaging the two middle ones for an even count."""
    if not values:
        return 0.0
    ordered = sorted(values)
    mid = len(ordered) // 2
    if len(ordered) % 2:
        return float(ordered[mid])
    return (ordered[mid - 1] + ordered[mid]) / 2


def _mean(values: Sequence[float]) -> float:
    return sum(values) / len(values) if values else 0.0


@dataclass(frozen=True)
class SessionStats:
    """Session shape across the whole population."""

    sessions: int
    devices: int
    #: Wall-clock: first to last event in the session.
    median_wall_sec: float
    mean_wall_sec: float
    #: Attention: summed `engagement_time_msec`.
    median_engaged_sec: float
    mean_engaged_sec: float
    median_screens: float
    mean_screens: float


@dataclass(frozen=True)
class ScreenDwell:
    """Time spent on one screen."""

    screen: str
    total_sec: float
    views: int
    devices: int

    @property
    def mean_sec_per_view(self) -> float:
        return self.total_sec / self.views if self.views else 0.0


@dataclass(frozen=True)
class DwellCoverage:
    """How much of the measured attention time could be tied to a real route.

    Measured 2026-08-08: 23.42h of 24.5h (95.6%) of `engagement_time_msec` was
    stamped with `RNSScreen` — react-native-screens' native container — because
    Firebase's automatic screen reporting fires after our own `logScreenView`
    and overwrites the "current screen" with an iOS internal class name. Only
    0.7% landed on an actual route.

    Publishing a screen-dwell table without this number invites reading a 0.7%
    sample as the whole picture. Disabling automatic screen reporting
    (`FirebaseAutomaticScreenReportingEnabled=false`, shipped 2026-08-08) is
    what makes the table meaningful; until that build reaches users, this share
    stays near zero and the table should be labelled unreadable.
    """

    attributed_msec: int
    total_msec: int

    @property
    def share(self) -> float:
        return self.attributed_msec / self.total_msec if self.total_msec else 0.0

    @property
    def is_reliable(self) -> bool:
        """Whether enough time is attributed for the ranking to mean anything."""
        return self.share >= _RELIABLE_COVERAGE


#: Below this share of attributed time, the screen ranking is a sample of
#: whichever screens happened to avoid the swizzle, not a ranking.
_RELIABLE_COVERAGE = 0.5


def compute_dwell_coverage(attributed_msec: int, total_msec: int) -> DwellCoverage:
    return DwellCoverage(attributed_msec=attributed_msec, total_msec=total_msec)


def compute_session_stats(rows: Sequence[Dict[str, Any]]) -> SessionStats:
    """Summarise per-session rows into medians and means.

    Args:
        rows: one per session — ``{device_id, wall_sec, engaged_sec, screens}``.
    """
    if not rows:
        return SessionStats(0, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0)

    wall = [r["wall_sec"] for r in rows]
    engaged = [r["engaged_sec"] for r in rows]
    screens = [r["screens"] for r in rows]
    return SessionStats(
        sessions=len(rows),
        devices=len({r["device_id"] for r in rows}),
        median_wall_sec=median(wall),
        mean_wall_sec=_mean(wall),
        median_engaged_sec=median(engaged),
        mean_engaged_sec=_mean(engaged),
        median_screens=median(screens),
        mean_screens=_mean(screens),
    )


def compute_screen_dwell(rows: Sequence[Dict[str, Any]]) -> List[ScreenDwell]:
    """Rank screens by total attention time, longest first.

    Ordered by time rather than view count: a screen opened 50 times for a
    second each is a transit corridor, while one opened twice for a minute is
    where the product actually happens.

    Rows without a screen name are dropped — those are the auto-collected
    `screen_view` leftovers (RNSScreen, UIViewController) that carry no route.
    """
    return sorted(
        (
            ScreenDwell(
                screen=row["screen"],
                total_sec=row["engaged_msec"] / 1000,
                views=row["views"],
                devices=row["devices"],
            )
            for row in rows
            if row.get("screen")
        ),
        key=lambda d: d.total_sec,
        reverse=True,
    )


# --- Queries ----------------------------------------------------------------

_SESSION_SQL = f"""
WITH sessions AS (
  SELECT
    {USER_KEY_COLUMN} AS device_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    (MAX(event_timestamp) - MIN(event_timestamp)) / 1e6 AS wall_sec,
    SUM(IFNULL(
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec'),
      0
    )) / 1000 AS engaged_sec,
    COUNTIF(event_name = 'screen_view') AS screens
  FROM {EVENTS_TABLE}
  GROUP BY device_id, session_id
)
SELECT device_id, wall_sec, engaged_sec, screens
FROM sessions
WHERE session_id IS NOT NULL
"""

# Attention is attributed to whichever screen was current when the
# `user_engagement` event fired. Only `firebase_screen` is used, never
# `firebase_screen_class`: the latter is polluted with iOS internals
# (RNSScreen, UIViewController) from Firebase's automatic screen reporting.
_DWELL_SQL = f"""
SELECT
  {param_string('firebase_screen')} AS screen,
  SUM(IFNULL(
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec'),
    0
  )) AS engaged_msec,
  COUNT(*) AS views,
  COUNT(DISTINCT {USER_KEY_COLUMN}) AS devices
FROM {EVENTS_TABLE}
WHERE event_name = 'user_engagement'
GROUP BY screen
HAVING screen IS NOT NULL
"""


def fetch_session_stats(client: bigquery.Client) -> SessionStats:
    """Session length and depth across all devices."""
    return compute_session_stats(run_query(client, _SESSION_SQL))


_COVERAGE_SQL = f"""
SELECT
  SUM(IF({param_string('firebase_screen')} IS NOT NULL, msec, 0)) AS attributed_msec,
  SUM(msec) AS total_msec
FROM (
  SELECT
    event_params,
    IFNULL(
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec'),
      0
    ) AS msec
  FROM {EVENTS_TABLE}
  WHERE event_name = 'user_engagement'
)
"""


def fetch_screen_dwell(
    client: bigquery.Client, limit: Optional[int] = None
) -> List[ScreenDwell]:
    """Screens ranked by total attention time.

    Pair this with `fetch_dwell_coverage` — the ranking is only readable when
    most of the attention time actually carries a route name.
    """
    dwell = compute_screen_dwell(run_query(client, _DWELL_SQL))
    return dwell[:limit] if limit else dwell


def fetch_dwell_coverage(client: bigquery.Client) -> DwellCoverage:
    """What share of attention time is tied to a real route."""
    rows = run_query(client, _COVERAGE_SQL)
    if not rows:
        return DwellCoverage(0, 0)
    return DwellCoverage(
        attributed_msec=int(rows[0]["attributed_msec"] or 0),
        total_msec=int(rows[0]["total_msec"] or 0),
    )
