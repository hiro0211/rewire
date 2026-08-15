"""Content-blocker abandonment: how long porn blocking actually lasts.

The product promise is that switching the blocker on helps someone stop. This
module measures whether it holds:

  - **挫折率** — of the devices that turned blocking on, how many switched it
    back off.
  - **持続時間の分布** — how many hours they lasted before trying to undo it.
    The "under an hour" band is kept separate because turning it off almost
    immediately is a different failure from lasting a week and slipping.
  - **ゲートの引き止め率** — the disable flow puts three guided breaths in the
    way. `cancelled / requested` is how often that actually stops someone,
    which is the only direct evidence the gate earns its place.

⚠️ These events ship with 2.4.0. Until that build reaches users every query
here returns nothing. `has_data` exists so the dashboard can say "まだ計測され
ていない" instead of rendering a confident 0% abandonment rate.
"""
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence, Tuple

from google.cloud import bigquery

from scripts.analytics.bigquery_client import EVENTS_TABLE, USER_KEY_COLUMN, run_query
from scripts.analytics.bq_sql import param_number

#: Hour bands for "how long did blocking last before they tried to undo it".
#: (label, low, high) with an inclusive low and inclusive high; None = open.
HOLDOUT_BANDS: Tuple[Tuple[str, int, Optional[int]], ...] = (
    ("1時間未満", 0, 0),
    ("1〜6時間", 1, 5),
    ("6〜24時間", 6, 23),
    ("1〜3日", 24, 71),
    ("3〜7日", 72, 167),
    ("7日以上", 168, None),
)

_BLOCKER_EVENTS = (
    "blocker_enabled",
    "blocker_disable_requested",
    "blocker_disable_confirmed",
    "blocker_disable_cancelled",
)


@dataclass(frozen=True)
class BlockerFunnel:
    """Devices at each stage of the blocker lifecycle."""

    enabled_devices: int
    disable_requested_devices: int
    disable_confirmed_devices: int
    disable_cancelled_devices: int

    @property
    def has_data(self) -> bool:
        """Whether anyone has enabled the blocker on a build that reports it."""
        return self.enabled_devices > 0

    @property
    def abandonment_rate(self) -> Optional[float]:
        """Share of blocker users who switched it back off."""
        if not self.enabled_devices:
            return None
        return self.disable_confirmed_devices / self.enabled_devices

    @property
    def gate_save_rate(self) -> Optional[float]:
        """Share of disable attempts the breathing gate talked out of it.

        Counts need not add up: a user can hit the gate and then background the
        app, sending neither confirm nor cancel. Missing data is normal here,
        so the ratio is taken as-is rather than validated.
        """
        if not self.disable_requested_devices:
            return None
        return self.disable_cancelled_devices / self.disable_requested_devices


@dataclass(frozen=True)
class HoldoutBucket:
    label: str
    devices: int
    share: float


def compute_holdout_buckets(
    rows: Sequence[Dict[str, Any]]
) -> List[HoldoutBucket]:
    """Group ``{hours_enabled, devices}`` rows into holdout bands.

    Rows with no ``hours_enabled`` are skipped: the app omits the param when it
    has no record of when blocking started, and treating that as 0 would
    inflate the "gave up immediately" band with unknowns.
    """
    known = [r for r in rows if r.get("hours_enabled") is not None]
    total = sum(r["devices"] for r in known)
    if not total:
        return []

    return [
        HoldoutBucket(
            label=label,
            devices=(
                devices := sum(
                    r["devices"]
                    for r in known
                    if r["hours_enabled"] >= low
                    and (high is None or r["hours_enabled"] <= high)
                )
            ),
            share=devices / total,
        )
        for label, low, high in HOLDOUT_BANDS
    ]


# --- Queries ----------------------------------------------------------------

_FUNNEL_SQL = f"""
SELECT event_name, COUNT(DISTINCT {USER_KEY_COLUMN}) AS devices
FROM {EVENTS_TABLE}
WHERE event_name IN ({", ".join(repr(e) for e in _BLOCKER_EVENTS)})
GROUP BY event_name
"""

# Grouped by device so one person disabling five times does not dominate the
# distribution; their *first* give-up is what the band is about.
_HOLDOUT_SQL = f"""
WITH first_disable AS (
  SELECT {USER_KEY_COLUMN} AS device_id,
         MIN({param_number('hours_enabled')}) AS hours_enabled
  FROM {EVENTS_TABLE}
  WHERE event_name = 'blocker_disable_confirmed'
  GROUP BY device_id
)
SELECT hours_enabled, COUNT(*) AS devices
FROM first_disable
GROUP BY hours_enabled
ORDER BY hours_enabled
"""


def fetch_blocker_funnel(client: bigquery.Client) -> BlockerFunnel:
    """Device counts at each blocker stage."""
    counts = {
        row["event_name"]: row["devices"] for row in run_query(client, _FUNNEL_SQL)
    }
    return BlockerFunnel(
        enabled_devices=counts.get("blocker_enabled", 0),
        disable_requested_devices=counts.get("blocker_disable_requested", 0),
        disable_confirmed_devices=counts.get("blocker_disable_confirmed", 0),
        disable_cancelled_devices=counts.get("blocker_disable_cancelled", 0),
    )


def fetch_holdout_buckets(client: bigquery.Client) -> List[HoldoutBucket]:
    """How long blocking lasted, per device, before the first switch-off."""
    return compute_holdout_buckets(run_query(client, _HOLDOUT_SQL))
