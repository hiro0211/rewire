"""Per-user behaviour for a cohort: when, how often, and what they used.

Two queries, one row-shape each:
  1. a summary per device (first/last seen, active days, sessions)
  2. a breakdown per device (screens and feature events, with counts)

They are merged in Python so the derived numbers (recency, frequency) stay pure
functions of the rows and are testable without BigQuery.
"""
from dataclasses import dataclass
from datetime import date
from typing import Any, Dict, List, Tuple

from google.cloud import bigquery

from scripts.analytics.bigquery_client import EVENTS_TABLE, USER_KEY_COLUMN, run_query
from scripts.analytics.bq_cohort import Cohort


#: Feature events worth reporting, with their Japanese labels. An event missing
#: from here is invisible in the dashboard, so keep it in step with
#: `constants/analyticsEvents.ts`.
FEATURE_EVENTS: Dict[str, str] = {
    "breathing_started": "呼吸法 開始",
    "breathing_completed": "呼吸法 完了",
    "reflection_opened": "リフレクション 開始",
    "reflection_completed": "リフレクション 完了",
    "panic_button_tapped": "パニックボタン",
    "lesson_started": "レッスン 開始",
    "lesson_completed": "レッスン 完了",
    "quick_action_tapped": "クイックアクション",
    "achievements_opened": "実績画面",
    "relapse_recorded": "再発記録",
    "recovery_trigger_selected": "トリガー選択",
}

#: How many screens / features to keep per user.
TOP_N = 8


@dataclass(frozen=True)
class UserActivity:
    """One user's usage profile."""

    device_id: str
    first_seen: date
    last_seen: date
    active_days: int
    sessions: int
    #: Recency — days between ``last_seen`` and the reference date.
    days_since_last_seen: int
    #: Frequency — sessions per day *on days they showed up*, so a user who
    #: opens the app hard for 3 days is not flattened by 30 days of silence.
    sessions_per_active_day: float
    top_screens: List[Tuple[str, int]]
    top_features: List[Tuple[str, int]]


_SUMMARY_SQL = f"""
SELECT
  {USER_KEY_COLUMN} AS device_id,
  PARSE_DATE('%Y%m%d', MIN(event_date)) AS first_seen,
  PARSE_DATE('%Y%m%d', MAX(event_date)) AS last_seen,
  COUNT(DISTINCT event_date) AS active_days,
  COUNT(DISTINCT (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) AS sessions
FROM {EVENTS_TABLE}
WHERE {USER_KEY_COLUMN} IN UNNEST(@device_ids)
GROUP BY device_id
"""

# `firebase_screen` holds our own pathnames; `firebase_screen_class` is polluted
# with Firebase's auto-collected iOS values (RNSScreen, UIViewController,
# RCTFabricModalHostViewController). Measured 2026-08-08: 714 of 1814
# screen_view rows carry firebase_screen, and every top value is a pathname.
# The LIKE '/%' filter drops anything that is not one of our routes.
_BREAKDOWN_SQL = f"""
WITH screens AS (
  SELECT
    {USER_KEY_COLUMN} AS device_id,
    'screen' AS kind,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'firebase_screen') AS name
  FROM {EVENTS_TABLE}
  WHERE event_name = 'screen_view'
    AND {USER_KEY_COLUMN} IN UNNEST(@device_ids)
),
features AS (
  SELECT {USER_KEY_COLUMN} AS device_id, 'feature' AS kind, event_name AS name
  FROM {EVENTS_TABLE}
  WHERE event_name IN ({", ".join(repr(e) for e in FEATURE_EVENTS)})
    AND {USER_KEY_COLUMN} IN UNNEST(@device_ids)
)
SELECT device_id, kind, name, COUNT(*) AS n
FROM (
  SELECT * FROM screens WHERE name LIKE '/%'
  UNION ALL
  SELECT * FROM features
)
GROUP BY device_id, kind, name
ORDER BY device_id, n DESC
"""


def _group_breakdown(rows: List[Dict[str, Any]]) -> Dict[str, Dict[str, List[Tuple[str, int]]]]:
    """Index breakdown rows by device, then by kind, ordered by count desc."""
    grouped: Dict[str, Dict[str, List[Tuple[str, int]]]] = {}
    for row in sorted(rows, key=lambda r: -r["n"]):
        by_kind = grouped.setdefault(row["device_id"], {"screen": [], "feature": []})
        by_kind[row["kind"]].append((row["name"], row["n"]))
    return grouped


def fetch_user_activity(
    client: bigquery.Client, cohort: Cohort, today: date
) -> List[UserActivity]:
    """Build a usage profile per cohort member, most recently active first.

    Args:
        today: reference date for recency. Passed in rather than read from the
            clock so results are reproducible and tests are not date-dependent.

    An empty cohort short-circuits: `IN UNNEST([])` would be a wasted query, and
    with 2 purchasers today an empty cohort is a routine outcome.
    """
    if not cohort.device_ids:
        return []

    params = [
        bigquery.ArrayQueryParameter("device_ids", "STRING", cohort.device_ids)
    ]
    summaries = run_query(client, _SUMMARY_SQL, params=params)
    breakdown = _group_breakdown(run_query(client, _BREAKDOWN_SQL, params=params))

    activity = [
        UserActivity(
            device_id=row["device_id"],
            first_seen=row["first_seen"],
            last_seen=row["last_seen"],
            active_days=row["active_days"],
            sessions=row["sessions"],
            days_since_last_seen=(today - row["last_seen"]).days,
            sessions_per_active_day=(
                row["sessions"] / row["active_days"] if row["active_days"] else 0.0
            ),
            top_screens=breakdown.get(row["device_id"], {}).get("screen", [])[:TOP_N],
            top_features=breakdown.get(row["device_id"], {}).get("feature", [])[:TOP_N],
        )
        for row in summaries
    ]
    return sorted(activity, key=lambda a: a.last_seen, reverse=True)
