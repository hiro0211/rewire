"""What the data cannot tell you: gaps, provisional days, excluded devices.

Every number this stack produces has a caveat attached, and until now those
caveats were hand-written strings in the renderer. `dashboard_html.py` still
carries "2026-08-03 のテーブルが存在しないため…" as a literal — true when it was
written, and quietly false the next time a different day goes missing.

The point of computing them is that a stale caveat is worse than none: it tells
the reader the data has been checked when it has not.
"""
from dataclasses import dataclass
from datetime import date, timedelta
from typing import Any, Dict, List, Optional, Sequence

from google.cloud import bigquery

from scripts.analytics.bigquery_client import EVENTS_TABLE, USER_KEY_COLUMN, run_query
from scripts.analytics.bq_sql import INSTALL_DATE

#: GA4 keeps updating a daily table with late-arriving events for up to three
#: days after the fact, so the most recent three days are never final.
#: https://support.google.com/analytics/answer/9358801
PROVISIONAL_DAYS = 3


@dataclass(frozen=True)
class DataQuality:
    """The health of the export behind a given report."""

    first_date: date
    last_date: date
    missing_dates: List[date]
    today: date
    #: Every device seen in the export.
    total_devices: int
    #: Devices eligible for cohort analysis (installed on/after the export began).
    eligible_devices: int

    @property
    def days_covered(self) -> int:
        """Days that actually have a table, gaps excluded."""
        span = (self.last_date - self.first_date).days + 1
        return span - len(self.missing_dates)

    @property
    def excluded_devices(self) -> int:
        """Devices dropped from cohort analysis for installing pre-export."""
        return self.total_devices - self.eligible_devices

    @property
    def has_gaps(self) -> bool:
        return bool(self.missing_dates)

    @property
    def provisional_from(self) -> date:
        return provisional_from(self.today)


def find_missing_dates(dates: Sequence[date]) -> List[date]:
    """Days with no table, between the first and last day that do have one.

    Bounded by the observed range on purpose: before the export was linked and
    after today are not gaps, and reporting them would bury the real ones.
    """
    if not dates:
        return []
    present = set(dates)
    first, last = min(present), max(present)
    return [
        first + timedelta(days=offset)
        for offset in range((last - first).days + 1)
        if first + timedelta(days=offset) not in present
    ]


def provisional_from(today: date) -> date:
    """The earliest date whose numbers may still change."""
    return today - timedelta(days=PROVISIONAL_DAYS - 1)


_DATES_SQL = f"""
SELECT DISTINCT PARSE_DATE('%Y%m%d', event_date) AS event_day
FROM {EVENTS_TABLE}
ORDER BY event_day
"""

_DEVICES_SQL = f"""
WITH devices AS (
  SELECT {USER_KEY_COLUMN} AS device_id, MIN({INSTALL_DATE}) AS install_date
  FROM {EVENTS_TABLE}
  GROUP BY device_id
)
SELECT COUNT(*) AS total_devices,
       COUNTIF(install_date >= @export_start) AS eligible_devices
FROM devices
"""


def fetch_data_quality(
    client: bigquery.Client, export_start: date, today: date
) -> Optional[DataQuality]:
    """Inspect the export. Returns None when it holds no data at all."""
    days = [row["event_day"] for row in run_query(client, _DATES_SQL)]
    if not days:
        return None

    counts: Dict[str, Any] = run_query(
        client,
        _DEVICES_SQL,
        params=[bigquery.ScalarQueryParameter("export_start", "DATE", export_start)],
    )[0]

    return DataQuality(
        first_date=min(days),
        last_date=max(days),
        missing_dates=find_missing_dates(days),
        today=today,
        total_devices=counts["total_devices"],
        eligible_devices=counts["eligible_devices"],
    )
