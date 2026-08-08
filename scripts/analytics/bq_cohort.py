"""Who to analyse: a cohort is "the devices that ever fired event X".

hiro's question is about people who got past the hard paywall, so the default
cohort is defined by `pro_purchase_completed`.

That cohort is 2 devices as of 2026-08-08. Two is enough to read individual
behaviour but far too few to conclude anything statistical, so
`ONBOARDING_COMPLETER` (29 devices) exists to widen the base without touching
any query — swap the definition, not the SQL.
"""
from dataclasses import dataclass, field
from typing import Dict, List

from google.cloud import bigquery

from scripts.analytics.bigquery_client import EVENTS_TABLE, USER_KEY_COLUMN, run_query


@dataclass(frozen=True)
class CohortDefinition:
    """A cohort described by the single event that admits a device to it."""

    key: str
    label: str
    event: str


PURCHASER = CohortDefinition(
    key="purchaser", label="課金完了者", event="pro_purchase_completed"
)
ONBOARDING_COMPLETER = CohortDefinition(
    key="onboarded", label="オンボ完了者", event="onboarding_complete"
)

#: Keyed for `--cohort` on the CLI.
COHORTS: Dict[str, CohortDefinition] = {
    c.key: c for c in (PURCHASER, ONBOARDING_COMPLETER)
}


@dataclass(frozen=True)
class Cohort:
    """A resolved cohort: the definition's label plus its actual members."""

    key: str
    label: str
    device_ids: List[str] = field(default_factory=list)

    @property
    def size(self) -> int:
        return len(self.device_ids)

    def contains(self, device_id: str) -> bool:
        return device_id in self.device_ids


_COHORT_SQL = f"""
SELECT DISTINCT {USER_KEY_COLUMN} AS device_id
FROM {EVENTS_TABLE}
WHERE event_name = @event
ORDER BY device_id
"""


def fetch_cohort(client: bigquery.Client, definition: CohortDefinition) -> Cohort:
    """Resolve ``definition`` into the devices that belong to it.

    An empty cohort is a normal result, not an error — with 2 purchasers today,
    a date-filtered view will often find none.
    """
    rows = run_query(
        client,
        _COHORT_SQL,
        params=[bigquery.ScalarQueryParameter("event", "STRING", definition.event)],
    )
    return Cohort(
        key=definition.key,
        label=definition.label,
        device_ids=[row["device_id"] for row in rows],
    )
