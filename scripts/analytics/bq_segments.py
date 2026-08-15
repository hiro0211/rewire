"""Who the users are: acquisition channel, language/country, and plan.

Two measured facts (2026-08-08) that no report was surfacing:

  - Installs split between Apple Search (20 devices) and direct (27). Channel
    is the one lever with a budget attached, and it was invisible.
  - More than half of all users are outside Japan — Canada 7, Australia 6,
    US 10 (6 of them zh-hans), plus UAE and Qatar — on an app localised only
    for JA and EN. `locale_preference` was tracked; `geo.country` never was.

Rates are gated behind `MIN_SEGMENT_DEVICES` for the same reason as
`bq_feature_retention`: a two-device segment produces confident-looking
percentages that are one person changing their mind.
"""
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence

from google.cloud import bigquery

from scripts.analytics.bigquery_client import EVENTS_TABLE, USER_KEY_COLUMN, run_query
from scripts.analytics.bq_sql import INSTALL_DATE, user_property_string

#: Below this many devices, report the count but not the rate.
MIN_SEGMENT_DEVICES = 5

_UNKNOWN = "(不明)"


@dataclass(frozen=True)
class Segment:
    """One slice of the population and how well it comes back."""

    key: str
    devices: int
    returned: int
    #: Share of all devices in this breakdown.
    share: float

    @property
    def return_rate(self) -> Optional[float]:
        """Share that came back after install day, or None if too small."""
        if self.devices < MIN_SEGMENT_DEVICES:
            return None
        return self.returned / self.devices


def compute_segments(rows: Sequence[Dict[str, Any]]) -> List[Segment]:
    """Turn ``{segment, devices, returned}`` rows into segments, largest first.

    A NULL key becomes "(不明)" rather than being dropped, so the segment
    totals still add up to the population — a breakdown that silently omits
    rows invites the reader to compare against the wrong denominator.
    """
    usable = [row for row in rows if row["devices"]]
    total = sum(row["devices"] for row in usable)
    if not total:
        return []

    return sorted(
        (
            Segment(
                key=row["segment"] or _UNKNOWN,
                devices=row["devices"],
                returned=row["returned"],
                share=row["devices"] / total,
            )
            for row in usable
        ),
        key=lambda s: s.devices,
        reverse=True,
    )


# --- Queries ----------------------------------------------------------------

# One shape, three groupings. `returned` reuses the same definition as
# bq_feature_retention: active on any day after install day.
def _segment_sql(dimension: str) -> str:
    return f"""
WITH devices AS (
  SELECT {USER_KEY_COLUMN} AS device_id,
         MIN({INSTALL_DATE}) AS install_date,
         ANY_VALUE({dimension}) AS segment
  FROM {EVENTS_TABLE}
  GROUP BY device_id
),
eligible AS (
  SELECT * FROM devices WHERE install_date >= @export_start
),
returned AS (
  SELECT DISTINCT e.device_id
  FROM eligible e
  JOIN {EVENTS_TABLE} ev ON ev.{USER_KEY_COLUMN} = e.device_id
  WHERE DATE_DIFF(PARSE_DATE('%Y%m%d', ev.event_date), e.install_date, DAY) >= 1
)
SELECT e.segment AS segment,
       COUNT(*) AS devices,
       COUNTIF(r.device_id IS NOT NULL) AS returned
FROM eligible e
LEFT JOIN returned r USING (device_id)
GROUP BY segment
"""


#: `traffic_source.source` is the user-scoped first-acquisition source, which is
#: the one that answers "where did this install come from" — unlike
#: `collected_traffic_source`, which is per-event.
CHANNEL_SQL = _segment_sql("traffic_source.source")

#: Country rather than `device.language`: language tells you what they read,
#: country tells you which store and which market.
COUNTRY_SQL = _segment_sql("geo.country")

LANGUAGE_SQL = _segment_sql("device.language")

PLAN_SQL = _segment_sql(user_property_string("goal_days"))


def _params(export_start):
    return [bigquery.ScalarQueryParameter("export_start", "DATE", export_start)]


def fetch_segments(
    client: bigquery.Client, sql: str, export_start
) -> List[Segment]:
    """Run one segment breakdown."""
    return compute_segments(run_query(client, sql, params=_params(export_start)))
