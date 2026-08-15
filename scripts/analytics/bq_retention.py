"""Install-date cohort retention: who comes back, and on which day they stop.

The daily report already carries GA4's D1/D7/D30, but those are aggregates —
they cannot be crossed with anything. Reading it from the raw export is what
makes "the people who used breathing in week 1 retain at X" answerable, and it
is what surfaces the shape behind the headline: measured 2026-08-08, 38 of 47
devices had a lifespan of 0 days.

Two rules this module enforces, because breaking either produces a number that
looks fine and is wrong:

  1. **Cohorts are keyed on install date, from the export.** Using "first date
     we saw the device" instead would place the 8 devices that installed before
     the export started (measured) at a day 0 that is really day 40, wrecking
     every offset for them.
  2. **An offset that has not happened yet is None, never 0.** A cohort created
     yesterday has not had a chance to return on D7.
"""
from dataclasses import dataclass, field
from datetime import date
from typing import Any, Dict, List, Optional, Sequence, Tuple

from google.cloud import bigquery

from scripts.analytics.bigquery_client import EVENTS_TABLE, USER_KEY_COLUMN, run_query
from scripts.analytics.bq_sql import INSTALL_DATE

#: Standard reporting points. D14/D30 will be immature for most cohorts while
#: the export is young — that is correct, and shows as "—" rather than 0%.
DEFAULT_OFFSETS: Tuple[int, ...] = (1, 3, 7, 14, 30)


@dataclass(frozen=True)
class RetentionCohort:
    """Everyone who installed on one day, and how many came back when."""

    cohort_date: date
    size: int
    #: offset → devices active that many days later; None when not yet mature.
    retained: Dict[int, Optional[int]] = field(default_factory=dict)

    def rate(self, offset: int) -> Optional[float]:
        """Share of the cohort active at ``offset``, or None if unknowable."""
        count = self.retained.get(offset)
        if count is None or self.size <= 0:
            return None
        return count / self.size


@dataclass(frozen=True)
class OffsetSummary:
    """One offset rolled up across every cohort old enough to report it."""

    offset: int
    retained: int
    total: int
    #: Cohorts excluded for being too young. Shown so a small `total` reads as
    #: "not enough time has passed" rather than "not enough users".
    immature_cohorts: int

    @property
    def rate(self) -> Optional[float]:
        return self.retained / self.total if self.total else None


@dataclass(frozen=True)
class LifespanBucket:
    """How long devices stay around, in bands."""

    label: str
    devices: int
    share: float


def is_offset_mature(cohort_date: date, offset: int, today: date) -> bool:
    """Whether day ``offset`` for this cohort has fully passed.

    Strictly greater-than: if the offset lands on today, the day is still in
    progress and counting it would show a dip that is really just the clock.
    """
    return (today - cohort_date).days > offset


def compute_retention_curve(
    sizes: Sequence[Dict[str, Any]],
    activity: Sequence[Dict[str, Any]],
    today: date,
    offsets: Sequence[int] = DEFAULT_OFFSETS,
) -> List[RetentionCohort]:
    """Pivot ``(cohort_date, day_offset, devices)`` rows into cohorts.

    Args:
        sizes: one row per cohort, ``{cohort_date, devices}``. The denominator
            comes from here rather than from offset 0, because a device that
            installs near midnight can have its first event on the next
            calendar day and would otherwise vanish from its own cohort.
        activity: ``{cohort_date, day_offset, devices}``.
        today: reference date, passed in so results are reproducible.
    """
    counts: Dict[date, Dict[int, int]] = {}
    for row in activity:
        counts.setdefault(row["cohort_date"], {})[row["day_offset"]] = row["devices"]

    cohorts = [
        RetentionCohort(
            cohort_date=row["cohort_date"],
            size=row["devices"],
            retained={
                offset: (
                    counts.get(row["cohort_date"], {}).get(offset, 0)
                    if is_offset_mature(row["cohort_date"], offset, today)
                    else None
                )
                for offset in offsets
            },
        )
        for row in sizes
    ]
    return sorted(cohorts, key=lambda c: c.cohort_date, reverse=True)


def summarise_offset(
    cohorts: Sequence[RetentionCohort], offset: int
) -> OffsetSummary:
    """Roll one offset up across cohorts, counting only the mature ones.

    At 47 devices no single cohort says anything; the pooled number is the only
    one worth reading. Immature cohorts are excluded rather than treated as
    zeros, and counted separately so the caller can say why the base is small.
    """
    retained = total = immature = 0
    for cohort in cohorts:
        if cohort.retained.get(offset) is None:
            immature += 1
            continue
        retained += cohort.retained[offset] or 0
        total += cohort.size
    return OffsetSummary(
        offset=offset, retained=retained, total=total, immature_cohorts=immature
    )


#: Bands for the lifespan histogram. Chosen against the measured distribution
#: (38 devices at 0 days, a handful at 2-5, a thin tail to 17) so the one band
#: that matters is not averaged away into "0-7 days".
_LIFESPAN_BANDS: Tuple[Tuple[str, int, Optional[int]], ...] = (
    ("0日（初日のみ）", 0, 0),
    ("1〜2日", 1, 2),
    ("3〜6日", 3, 6),
    ("7〜13日", 7, 13),
    ("14日以上", 14, None),
)


def compute_lifespan_buckets(
    rows: Sequence[Dict[str, Any]]
) -> List[LifespanBucket]:
    """Group ``{lifespan_days, devices}`` rows into readable bands.

    Every band is emitted even when empty: an absent "14日以上" row reads as
    "no data", while an explicit 0 reads as "nobody lasts two weeks", which is
    the actual finding.
    """
    total = sum(row["devices"] for row in rows)
    if not total:
        return []

    buckets = []
    for label, low, high in _LIFESPAN_BANDS:
        devices = sum(
            row["devices"]
            for row in rows
            if row["lifespan_days"] >= low
            and (high is None or row["lifespan_days"] <= high)
        )
        buckets.append(
            LifespanBucket(label=label, devices=devices, share=devices / total)
        )
    return buckets


# --- Queries ----------------------------------------------------------------

# Devices are admitted to a cohort only if they installed on or after the
# export start date. The 8 devices (measured) whose install predates the export
# have no day-0 data at all; including them would put a 40-day-old user in
# today's cohort and drag every rate down for a reason that is not real.
_COHORT_SIZE_SQL = f"""
WITH devices AS (
  SELECT {USER_KEY_COLUMN} AS device_id, MIN({INSTALL_DATE}) AS cohort_date
  FROM {EVENTS_TABLE}
  GROUP BY device_id
)
SELECT cohort_date, COUNT(*) AS devices
FROM devices
WHERE cohort_date >= @export_start
GROUP BY cohort_date
ORDER BY cohort_date
"""

_ACTIVITY_SQL = f"""
WITH devices AS (
  SELECT {USER_KEY_COLUMN} AS device_id, MIN({INSTALL_DATE}) AS cohort_date
  FROM {EVENTS_TABLE}
  GROUP BY device_id
),
active AS (
  SELECT DISTINCT {USER_KEY_COLUMN} AS device_id,
         PARSE_DATE('%Y%m%d', event_date) AS active_date
  FROM {EVENTS_TABLE}
)
SELECT d.cohort_date AS cohort_date,
       DATE_DIFF(a.active_date, d.cohort_date, DAY) AS day_offset,
       COUNT(DISTINCT d.device_id) AS devices
FROM devices d
JOIN active a USING (device_id)
WHERE d.cohort_date >= @export_start
  AND DATE_DIFF(a.active_date, d.cohort_date, DAY) >= 0
GROUP BY cohort_date, day_offset
"""

_LIFESPAN_SQL = f"""
WITH span AS (
  SELECT {USER_KEY_COLUMN} AS device_id,
         MIN({INSTALL_DATE}) AS cohort_date,
         DATE_DIFF(
           MAX(PARSE_DATE('%Y%m%d', event_date)),
           MIN(PARSE_DATE('%Y%m%d', event_date)),
           DAY
         ) AS lifespan_days
  FROM {EVENTS_TABLE}
  GROUP BY device_id
)
SELECT lifespan_days, COUNT(*) AS devices
FROM span
WHERE cohort_date >= @export_start
GROUP BY lifespan_days
ORDER BY lifespan_days
"""


def _export_start_param(export_start: date):
    return [bigquery.ScalarQueryParameter("export_start", "DATE", export_start)]


def fetch_retention(
    client: bigquery.Client,
    export_start: date,
    today: date,
    offsets: Sequence[int] = DEFAULT_OFFSETS,
) -> List[RetentionCohort]:
    """Cohort retention for every install date at or after ``export_start``."""
    params = _export_start_param(export_start)
    return compute_retention_curve(
        sizes=run_query(client, _COHORT_SIZE_SQL, params=params),
        activity=run_query(client, _ACTIVITY_SQL, params=params),
        today=today,
        offsets=offsets,
    )


def fetch_lifespan(
    client: bigquery.Client, export_start: date
) -> List[LifespanBucket]:
    """Distribution of first-seen-to-last-seen spans, in bands."""
    return compute_lifespan_buckets(
        run_query(client, _LIFESPAN_SQL, params=_export_start_param(export_start))
    )
