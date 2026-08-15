"""When people use the app: day of week, hour of day, and per-feature timing.

This is the axis the analytics stack had no query for at all. It matters more
here than in most apps: Rewire exists for urges, and an urge has a time of day.
If the panic button is a 2am behaviour, a 9am reminder is aimed at nobody.

Everything is in the reporting timezone (JST). `event_timestamp` is UTC
microseconds, so reading it raw would move Japanese late-night usage into the
afternoon — the conversion lives in `bq_sql.EVENT_HOUR_JST`.
"""
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence, Tuple

from google.cloud import bigquery

from scripts.analytics.bigquery_client import EVENTS_TABLE, USER_KEY_COLUMN, run_query
from scripts.analytics.bq_sql import EVENT_HOUR_JST, EVENT_WEEKDAY_JST
from scripts.analytics.bq_user_activity import FEATURE_EVENTS

HOURS: Tuple[int, ...] = tuple(range(24))

#: Index 0 is Sunday, matching BigQuery's `DAYOFWEEK` (1=Sunday) minus one.
#: Getting this off by one silently relabels every row of the heatmap.
WEEKDAY_LABELS: Tuple[str, ...] = ("日", "月", "火", "水", "木", "金", "土")

#: Saturday and Sunday, as indices into the grid.
_WEEKEND_INDICES = (0, 6)

#: 22:00–04:59. The window where an urge is most likely and least supervised.
_NIGHT_HOURS = frozenset({22, 23, 0, 1, 2, 3, 4})

#: Events that carry no user intent — they fire on every screen and would
#: dominate a heatmap meant to show deliberate use.
_AMBIENT_EVENTS = ("user_engagement", "screen_view", "session_start", "first_open")


@dataclass(frozen=True)
class HeatmapCell:
    weekday_label: str
    hour: int
    events: int


@dataclass(frozen=True)
class WeekSplit:
    """Weekday vs weekend, normalised per day so the two are comparable."""

    weekday_events: int
    weekend_events: int

    @property
    def weekday_per_day(self) -> float:
        return self.weekday_events / 5 if self.weekday_events else 0.0

    @property
    def weekend_per_day(self) -> float:
        return self.weekend_events / 2 if self.weekend_events else 0.0


@dataclass(frozen=True)
class FeatureTimeProfile:
    """One feature's shape across the day."""

    event_name: str
    label: str
    total: int
    devices: int
    peak_hour: int
    #: Share of uses falling in 22:00–04:59.
    night_share: float
    by_hour: Tuple[int, ...]


def build_heatmap(rows: Sequence[Dict[str, Any]]) -> List[List[int]]:
    """A 7×24 grid of event counts, row 0 = Sunday, column 0 = midnight.

    Always full-size: an hour nobody used reads as 0 rather than vanishing,
    because a gap in a heatmap is indistinguishable from missing data.
    Weekday values outside 1–7 are dropped rather than raising — one odd row
    should not take down the whole report.
    """
    grid = [[0] * 24 for _ in range(7)]
    for row in rows:
        weekday, hour = row["weekday"], row["hour"]
        if not (1 <= weekday <= 7) or not (0 <= hour <= 23):
            continue
        grid[weekday - 1][hour] += row["events"]
    return grid


def busiest_cell(grid: Sequence[Sequence[int]]) -> Optional[HeatmapCell]:
    """The single busiest weekday/hour, or None when nothing was recorded."""
    best: Optional[HeatmapCell] = None
    for day_index, row in enumerate(grid):
        for hour, events in enumerate(row):
            if events and (best is None or events > best.events):
                best = HeatmapCell(WEEKDAY_LABELS[day_index], hour, events)
    return best


def split_weekday_weekend(grid: Sequence[Sequence[int]]) -> WeekSplit:
    """Totals for Mon–Fri and Sat–Sun.

    The per-day properties matter more than the totals: weekdays have 5 days to
    the weekend's 2, so raw totals make weekdays win even when each individual
    weekend day is busier.
    """
    weekend = sum(sum(grid[i]) for i in _WEEKEND_INDICES)
    weekday = sum(sum(row) for i, row in enumerate(grid) if i not in _WEEKEND_INDICES)
    return WeekSplit(weekday_events=weekday, weekend_events=weekend)


def compute_feature_profiles(
    rows: Sequence[Dict[str, Any]]
) -> List[FeatureTimeProfile]:
    """Group ``{event_name, hour, events, devices}`` rows into per-feature shapes.

    Ordered by total uses so the features with enough data to read come first.
    """
    grouped: Dict[str, Dict[str, Any]] = {}
    for row in rows:
        entry = grouped.setdefault(
            row["event_name"], {"by_hour": [0] * 24, "devices": 0}
        )
        if 0 <= row["hour"] <= 23:
            entry["by_hour"][row["hour"]] += row["events"]
        entry["devices"] = max(entry["devices"], row["devices"])

    profiles = []
    for name, entry in grouped.items():
        by_hour = entry["by_hour"]
        total = sum(by_hour)
        if not total:
            continue
        night = sum(by_hour[h] for h in _NIGHT_HOURS)
        profiles.append(
            FeatureTimeProfile(
                event_name=name,
                label=FEATURE_EVENTS.get(name, name),
                total=total,
                devices=entry["devices"],
                peak_hour=by_hour.index(max(by_hour)),
                night_share=night / total,
                by_hour=tuple(by_hour),
            )
        )
    return sorted(profiles, key=lambda p: p.total, reverse=True)


# --- Queries ----------------------------------------------------------------

# `user_engagement` and `screen_view` are excluded: they fire constantly and
# would bury the deliberate actions this grid exists to show. Measured
# 2026-08-08, they are 2,690 of 4,273 rows.
_HEATMAP_SQL = f"""
SELECT {EVENT_WEEKDAY_JST} AS weekday,
       {EVENT_HOUR_JST} AS hour,
       COUNT(*) AS events,
       COUNT(DISTINCT {USER_KEY_COLUMN}) AS devices
FROM {EVENTS_TABLE}
WHERE event_name NOT IN ({", ".join(repr(e) for e in _AMBIENT_EVENTS)})
GROUP BY weekday, hour
"""

_FEATURE_SQL = f"""
SELECT event_name,
       {EVENT_HOUR_JST} AS hour,
       COUNT(*) AS events,
       COUNT(DISTINCT {USER_KEY_COLUMN}) AS devices
FROM {EVENTS_TABLE}
WHERE event_name IN ({", ".join(repr(e) for e in FEATURE_EVENTS)})
GROUP BY event_name, hour
"""


def fetch_heatmap(client: bigquery.Client) -> List[List[int]]:
    """The 7×24 usage grid, JST."""
    return build_heatmap(run_query(client, _HEATMAP_SQL))


def fetch_feature_profiles(client: bigquery.Client) -> List[FeatureTimeProfile]:
    """Per-feature time-of-day shapes, busiest feature first."""
    return compute_feature_profiles(run_query(client, _FEATURE_SQL))
