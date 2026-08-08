"""Thin query runner for the Rewire GA4 BigQuery export.

Responsibility: authenticate, run one SQL string, hand back plain dicts.
This module deliberately knows nothing about what any query *means* — the
analysis modules (`bq_onboarding_funnel`, `bq_cohort`, `bq_user_activity`)
own that, so a schema change touches one analysis file rather than this one.

Auth uses the same service-account JSON as the GA4 client
(`AnalyticsConfig.google_application_credentials`); no second credential.
"""
from typing import Any, Dict, List, Optional, Sequence

from google.cloud import bigquery
from google.oauth2 import service_account


PROJECT_ID = "rewire-4a491"
DATASET_ID = "analytics_526015389"

# Wildcard over the daily `events_YYYYMMDD` tables. Backtick-quoted because the
# project id contains a hyphen.
EVENTS_TABLE = f"`{PROJECT_ID}.{DATASET_ID}.events_*`"

# Why device-scoped and not `user_id`: GA4's `user_id` column is NULL on every
# row exported so far. `setUserId` (hooks/tracking/useAnalyticsUserId.ts) landed
# in commit 0b5e625 and has not shipped — production is still 2.3.0. Until 2.4.0
# rolls out, `user_pseudo_id` is the only key with data in it.
#
# Trade-off: it resets on reinstall and cannot join a user across devices.
# Flip this single constant once 2.4.0 has reached most installs.
USER_KEY_COLUMN = "user_pseudo_id"

# Blaze billing is now active on rewire-4a491, so a runaway wildcard scan costs
# real money. BigQuery aborts the job rather than billing past this ceiling.
# Current full-history scans are ~0.25 MB, so 1 GB is ~4000x headroom.
DEFAULT_MAX_BYTES_BILLED = 1_000_000_000

BIGQUERY_SCOPE = "https://www.googleapis.com/auth/bigquery"


def build_client(credentials_path: str) -> bigquery.Client:
    """Build a BigQuery client from a service-account JSON path.

    Raises:
        ValueError: when ``credentials_path`` is empty.
    """
    if not credentials_path:
        raise ValueError("credentials_path is required")
    credentials = service_account.Credentials.from_service_account_file(
        credentials_path, scopes=[BIGQUERY_SCOPE]
    )
    return bigquery.Client(project=PROJECT_ID, credentials=credentials)


def run_query(
    client: bigquery.Client,
    sql: str,
    params: Optional[Sequence[bigquery.ScalarQueryParameter]] = None,
    max_bytes_billed: int = DEFAULT_MAX_BYTES_BILLED,
) -> List[Dict[str, Any]]:
    """Run ``sql`` and return its rows as plain dicts.

    Args:
        client: a configured BigQuery client.
        sql: the query text. Use query parameters rather than string
            interpolation for any caller-supplied value.
        params: query parameters bound to ``sql``.
        max_bytes_billed: hard ceiling; the job fails instead of over-billing.
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=list(params or []),
        maximum_bytes_billed=max_bytes_billed,
    )
    return [dict(row) for row in client.query(sql, job_config=job_config).result()]
