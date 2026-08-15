"""Which feature, used in the first week, goes with coming back.

The product question behind "improve retention" is not "what is our retention"
— the daily report already answers that — but "what should we push people
toward". This module compares, per feature, the return rate of devices that
used it in their first week against those that did not.

⚠️ This is correlation, and at the current base it is barely even that. With 39
eligible devices, most features have two or three users. Every number here is
therefore gated behind `MIN_GROUP_SIZE`: below it the module reports the counts
and refuses to compute a rate, because "100% of the 2 people who tried
breathing came back" is the kind of finding that redirects a roadmap for no
reason. Read a reportable lift as a hypothesis to test, not as a cause.
"""
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence

from google.cloud import bigquery

from scripts.analytics.bigquery_client import EVENTS_TABLE, USER_KEY_COLUMN, run_query
from scripts.analytics.bq_sql import INSTALL_DATE
from scripts.analytics.bq_user_activity import FEATURE_EVENTS

#: Both arms of the comparison need at least this many devices. Set against the
#: measured base (39 eligible devices): low enough that something can qualify,
#: high enough that a single person cannot move a rate by 50 points.
MIN_GROUP_SIZE = 10

#: "Used it early" window, in days from install.
FIRST_WEEK_DAYS = 7

#: "Came back" means active on any day after install day.
RETURN_AFTER_DAYS = 1


@dataclass(frozen=True)
class FeatureLift:
    """One feature's association with returning."""

    event_name: str
    label: str
    used_devices: int
    used_retained: int
    unused_devices: int
    unused_retained: int

    @property
    def is_reportable(self) -> bool:
        """Whether both arms are big enough for the rates to mean anything."""
        return (
            self.used_devices >= MIN_GROUP_SIZE
            and self.unused_devices >= MIN_GROUP_SIZE
        )

    @property
    def used_rate(self) -> Optional[float]:
        if not self.is_reportable:
            return None
        return self.used_retained / self.used_devices

    @property
    def unused_rate(self) -> Optional[float]:
        if not self.is_reportable:
            return None
        return self.unused_retained / self.unused_devices

    @property
    def lift(self) -> Optional[float]:
        """Difference in percentage points, not a ratio.

        A ratio turns 1/10 vs 5/10 into "5x", which sounds like a finding and
        is four people. The difference stays legible at small n.
        """
        if self.used_rate is None or self.unused_rate is None:
            return None
        return self.used_rate - self.unused_rate


def compute_feature_lifts(
    rows: Sequence[Dict[str, Any]]
) -> List[FeatureLift]:
    """Turn per-feature contingency rows into lifts, most promising first.

    Reportable features are sorted by lift and placed above the ones held back
    for sample size, so a readable result is never buried under a list of
    "サンプル不足" rows.
    """
    lifts = [
        FeatureLift(
            event_name=row["event_name"],
            label=FEATURE_EVENTS.get(row["event_name"], row["event_name"]),
            used_devices=row["used_devices"],
            used_retained=row["used_retained"],
            unused_devices=row["unused_devices"],
            unused_retained=row["unused_retained"],
        )
        for row in rows
    ]
    return sorted(
        lifts,
        key=lambda x: (x.is_reportable, x.lift if x.lift is not None else 0.0),
        reverse=True,
    )


#: Label for the pooled "did they use anything at all" comparison.
ANY_FEATURE = "__any_feature__"
ANY_FEATURE_LABEL = "いずれかの機能を利用"


def build_any_feature_lift(row: Dict[str, Any]) -> FeatureLift:
    """The pooled comparison: used *any* feature in week 1, or none at all.

    Worth having separately because per-feature groups are tiny while the union
    is not. Measured 2026-08-08, every individual feature had 1-4 users and
    reported nothing, but the pattern underneath was stark: of the devices that
    touched any feature, all came back; of those that touched none, almost none
    did. Pooling is the only way that shape can ever clear the sample guard.
    """
    return FeatureLift(
        event_name=ANY_FEATURE,
        label=ANY_FEATURE_LABEL,
        used_devices=row["used_devices"],
        used_retained=row["used_retained"],
        unused_devices=row["unused_devices"],
        unused_retained=row["unused_retained"],
    )


# --- Query ------------------------------------------------------------------

# Same eligibility rule as bq_retention: devices whose install predates the
# export have no first-week data, so they cannot be classified either way.
_LIFT_SQL = f"""
WITH devices AS (
  SELECT {USER_KEY_COLUMN} AS device_id, MIN({INSTALL_DATE}) AS install_date
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
  WHERE DATE_DIFF(PARSE_DATE('%Y%m%d', ev.event_date), e.install_date, DAY) >= {RETURN_AFTER_DAYS}
),
used AS (
  SELECT DISTINCT ev.event_name, e.device_id
  FROM eligible e
  JOIN {EVENTS_TABLE} ev ON ev.{USER_KEY_COLUMN} = e.device_id
  WHERE ev.event_name IN ({", ".join(repr(x) for x in FEATURE_EVENTS)})
    AND DATE_DIFF(PARSE_DATE('%Y%m%d', ev.event_date), e.install_date, DAY)
        BETWEEN 0 AND {FIRST_WEEK_DAYS}
),
features AS (
  SELECT name AS event_name FROM UNNEST([
    {", ".join(repr(x) for x in FEATURE_EVENTS)}
  ]) AS name
),
matrix AS (
  SELECT f.event_name,
         e.device_id,
         u.device_id IS NOT NULL AS used_it,
         r.device_id IS NOT NULL AS came_back
  FROM features f
  CROSS JOIN eligible e
  LEFT JOIN used u ON u.event_name = f.event_name AND u.device_id = e.device_id
  LEFT JOIN returned r ON r.device_id = e.device_id
)
SELECT
  event_name,
  COUNTIF(used_it) AS used_devices,
  COUNTIF(used_it AND came_back) AS used_retained,
  COUNTIF(NOT used_it) AS unused_devices,
  COUNTIF(NOT used_it AND came_back) AS unused_retained
FROM matrix
GROUP BY event_name
"""


_ANY_FEATURE_SQL = f"""
WITH devices AS (
  SELECT {USER_KEY_COLUMN} AS device_id, MIN({INSTALL_DATE}) AS install_date
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
  WHERE DATE_DIFF(PARSE_DATE('%Y%m%d', ev.event_date), e.install_date, DAY) >= {RETURN_AFTER_DAYS}
),
used AS (
  SELECT DISTINCT e.device_id
  FROM eligible e
  JOIN {EVENTS_TABLE} ev ON ev.{USER_KEY_COLUMN} = e.device_id
  WHERE ev.event_name IN ({", ".join(repr(x) for x in FEATURE_EVENTS)})
    AND DATE_DIFF(PARSE_DATE('%Y%m%d', ev.event_date), e.install_date, DAY)
        BETWEEN 0 AND {FIRST_WEEK_DAYS}
)
SELECT
  COUNTIF(u.device_id IS NOT NULL) AS used_devices,
  COUNTIF(u.device_id IS NOT NULL AND r.device_id IS NOT NULL) AS used_retained,
  COUNTIF(u.device_id IS NULL) AS unused_devices,
  COUNTIF(u.device_id IS NULL AND r.device_id IS NOT NULL) AS unused_retained
FROM eligible e
LEFT JOIN used u USING (device_id)
LEFT JOIN returned r USING (device_id)
"""


def _params(export_start):
    return [bigquery.ScalarQueryParameter("export_start", "DATE", export_start)]


def fetch_feature_lifts(
    client: bigquery.Client, export_start
) -> List[FeatureLift]:
    """Per-feature return-rate comparison for first-week usage."""
    return compute_feature_lifts(
        run_query(client, _LIFT_SQL, params=_params(export_start))
    )


def fetch_any_feature_lift(
    client: bigquery.Client, export_start
) -> Optional[FeatureLift]:
    """The pooled used-anything vs used-nothing comparison."""
    rows = run_query(client, _ANY_FEATURE_SQL, params=_params(export_start))
    return build_any_feature_lift(rows[0]) if rows else None
