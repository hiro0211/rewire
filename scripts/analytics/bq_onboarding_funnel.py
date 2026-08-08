"""Onboarding drop-off funnel from the `onboarding_step_viewed` event.

Answers "who got how far, and where do people fall out". The event carries
`step_index` (int) and `step_type` (string) and is fired by
`hooks/onboarding/useOnboardingStepTracking.ts` — already live in production.

Reach is counted as "devices whose furthest step is at or past this one", not
"devices that logged this exact step". A dropped session can lose individual
step events, which would otherwise punch holes mid-funnel and invent drop-offs
that never happened.
"""
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from google.cloud import bigquery

from scripts.analytics.bigquery_client import EVENTS_TABLE, USER_KEY_COLUMN, run_query


@dataclass(frozen=True)
class FunnelStep:
    """One onboarding step and how many devices reached it."""

    step_index: int
    step_type: str
    devices: int
    #: Devices lost between the previous step and this one. Never negative.
    dropped: int
    #: ``dropped`` over the *previous* step's reach — not over the whole funnel,
    #: so late steps stay comparable with early ones.
    drop_rate: float


_FUNNEL_SQL = f"""
WITH steps AS (
  SELECT
    {USER_KEY_COLUMN} AS device_id,
    -- step_index lands in `double_value`, not `int_value`: the React Native
    -- Firebase SDK ships every JS number as a double. Measured on the live
    -- export — 944/944 rows in double_value, 0 in int_value. Reading only
    -- int_value silently yields an empty funnel. int_value is kept in the
    -- COALESCE so a future native integer still works.
    CAST(COALESCE(
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'step_index'),
      CAST((SELECT value.double_value FROM UNNEST(event_params) WHERE key = 'step_index') AS INT64)
    ) AS INT64) AS step_index,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'step_type') AS step_type
  FROM {EVENTS_TABLE}
  WHERE event_name = 'onboarding_step_viewed'
),
furthest AS (
  SELECT device_id, MAX(step_index) AS max_step
  FROM steps
  WHERE step_index IS NOT NULL
  GROUP BY device_id
),
labels AS (
  SELECT step_index, ANY_VALUE(step_type) AS step_type
  FROM steps
  WHERE step_index IS NOT NULL
  GROUP BY step_index
)
SELECT
  l.step_index AS step_index,
  l.step_type AS step_type,
  COUNT(DISTINCT f.device_id) AS devices
FROM labels l
LEFT JOIN furthest f ON f.max_step >= l.step_index
GROUP BY step_index, step_type
ORDER BY step_index
"""


# The stages after the last onboarding screen, in the order a user meets them.
# Measured 2026-08-08: onboarding itself barely leaks (30 of 35 devices reach the
# final step), so the drop hiro is looking for lives here, not in the step list.
CONVERSION_STAGES = [
    ("onboarding_complete", "オンボ完了"),
    ("benefits_screen_viewed", "ベネフィット画面"),
    ("paywall_viewed", "ペイウォール表示"),
    ("purchase_initiated", "購入開始"),
    ("pro_purchase_completed", "購入完了"),
]

_CONVERSION_SQL = f"""
SELECT event_name, COUNT(DISTINCT {USER_KEY_COLUMN}) AS devices
FROM {EVENTS_TABLE}
WHERE event_name IN ({", ".join(repr(e) for e, _ in CONVERSION_STAGES)})
GROUP BY event_name
"""


def compute_drop_offs(rows: List[Dict[str, Any]]) -> List[FunnelStep]:
    """Turn raw ``(step_index, step_type, devices)`` rows into funnel steps.

    Pure function — no BigQuery involved, so the drop maths is testable on its
    own. Rows may arrive in any order; they are sorted by ``step_index``.
    """
    ordered = sorted(rows, key=lambda r: r["step_index"])
    steps: List[FunnelStep] = []
    previous: Optional[int] = None

    for row in ordered:
        devices = row["devices"]
        # max(0, ...) because a later step can out-count an earlier one when a
        # session drops step events; that is missing data, not negative churn.
        dropped = 0 if previous is None else max(0, previous - devices)
        drop_rate = dropped / previous if previous else 0.0
        steps.append(
            FunnelStep(
                step_index=row["step_index"],
                step_type=row["step_type"],
                devices=devices,
                dropped=dropped,
                drop_rate=drop_rate,
            )
        )
        previous = devices

    return steps


def biggest_drop(steps: List[FunnelStep]) -> Optional[FunnelStep]:
    """The step that loses the largest *share* of the devices that reached it.

    Rate rather than raw count: early steps always shed more people in absolute
    terms simply because more people are there.

    Returns None when the funnel has fewer than two steps (nothing to compare).
    """
    candidates = steps[1:]
    if not candidates:
        return None
    return max(candidates, key=lambda s: s.drop_rate)


def fetch_funnel(client: bigquery.Client) -> List[FunnelStep]:
    """Run the funnel query and return steps with drop-offs filled in."""
    return compute_drop_offs(run_query(client, _FUNNEL_SQL))


def fetch_conversion_funnel(client: bigquery.Client) -> List[FunnelStep]:
    """Onboarding-complete → paywall → purchase, as one ordered funnel.

    An event nobody fired returns no row at all; that becomes 0 rather than a
    missing stage, so the funnel keeps its shape and the gap stays visible.
    """
    counts = {row["event_name"]: row["devices"] for row in run_query(client, _CONVERSION_SQL)}
    return compute_drop_offs([
        {"step_index": i, "step_type": label, "devices": counts.get(event, 0)}
        for i, (event, label) in enumerate(CONVERSION_STAGES)
    ])
