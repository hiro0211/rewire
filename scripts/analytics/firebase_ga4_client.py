"""Firebase Analytics (GA4) Data API client.

Fetches the snapshot data required for the daily report:

  1. Basic activity metrics over 7 days (active_users, new_users, sessions, ...).
  2. Per-event counts limited to Rewire's instrumented events
     (see REWIRE_KEY_EVENTS for the allowlist mirrored from logEvent call sites).
  3. Top-10 screens by page views with engagement duration.

Auth: credentials JSON at GOOGLE_APPLICATION_CREDENTIALS. Either form works:
  - Service Account JSON — the SA must be a Viewer on the target GA4 Property.
  - User OAuth ADC (from `gcloud auth application-default login`) — usable when
    GA4 access via a Service Account is blocked (e.g. Google's April 2026 bug
    rejecting newly-created SAs). The signed-in Google account must have
    GA4 property access on its own.

Standard GA4 reports have a 24-48h latency, so the caller is responsible for
supplying ``target_date`` (typically yesterday's date in the local timezone).
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Dict, Iterable, List, Tuple

from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    Cohort,
    CohortSpec,
    CohortsRange,
    DateRange,
    Dimension,
    Filter,
    FilterExpression,
    Metric,
    OrderBy,
    RunReportRequest,
)
from google.auth import load_credentials_from_file

GA4_READ_SCOPE = "https://www.googleapis.com/auth/analytics.readonly"


# Events instrumented via `analyticsClient.logEvent(...)` in the Rewire RN app.
# Mirrors the call sites under app/, components/, features/, hooks/.
REWIRE_KEY_EVENTS: Tuple[str, ...] = (
    "paywall_viewed",
    "pro_purchase_completed",
    "benefits_screen_viewed",
    "benefits_cta_tapped",
    "onboarding_step_viewed",
    "onboarding_complete",
    "breathing_started",
    "breathing_completed",
    "panic_button_tapped",
    "panic_screen_viewed",
    "safari_demo_tapped",
    "safari_demo_skipped",
    "recovery_trigger_selected",
    "share_tapped",
    "review_prompt_shown",
    "review_prompt_rated",
    "survey_prompt_accepted",
    "survey_completed",
    "post_purchase_step_viewed",
    "post_purchase_onboarding_skipped",
)

# Day offsets at which we report cohort retention (D1 / D7 / D30 convention).
RETENTION_OFFSETS: Tuple[int, ...] = (1, 7, 30)


def _require(value: str, name: str) -> None:
    if not value:
        raise ValueError(f"{name} is required")


def _to_int(raw: str) -> int:
    try:
        return int(float(raw))
    except (ValueError, TypeError):
        return 0


def _to_float(raw: str) -> float:
    try:
        return float(raw)
    except (ValueError, TypeError):
        return 0.0


def _gtm_date_string(d: date) -> str:
    """GA4 Data API expects YYYY-MM-DD strings in DateRange."""
    return d.isoformat()


def _ga4_date_token_to_date(token: str) -> date:
    """GA4 date dimension returns YYYYMMDD without separators."""
    return date(int(token[:4]), int(token[4:6]), int(token[6:8]))


def _build_basics_request(property_id: str, target_date: date) -> RunReportRequest:
    start = target_date - timedelta(days=6)
    return RunReportRequest(
        property=f"properties/{property_id}",
        date_ranges=[DateRange(
            start_date=_gtm_date_string(start),
            end_date=_gtm_date_string(target_date),
        )],
        dimensions=[Dimension(name="date")],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="newUsers"),
            Metric(name="sessions"),
            Metric(name="averageSessionDuration"),
            Metric(name="screenPageViews"),
        ],
        order_bys=[OrderBy(dimension=OrderBy.DimensionOrderBy(dimension_name="date"))],
    )


def _build_events_request(
    property_id: str,
    target_date: date,
    event_names: Iterable[str],
) -> RunReportRequest:
    return RunReportRequest(
        property=f"properties/{property_id}",
        date_ranges=[DateRange(
            start_date=_gtm_date_string(target_date),
            end_date=_gtm_date_string(target_date),
        )],
        dimensions=[Dimension(name="eventName")],
        metrics=[
            Metric(name="eventCount"),
            Metric(name="totalUsers"),
        ],
        dimension_filter=FilterExpression(
            filter=Filter(
                field_name="eventName",
                in_list_filter=Filter.InListFilter(values=list(event_names)),
            )
        ),
    )


def _build_screens_request(property_id: str, target_date: date) -> RunReportRequest:
    return RunReportRequest(
        property=f"properties/{property_id}",
        date_ranges=[DateRange(
            start_date=_gtm_date_string(target_date),
            end_date=_gtm_date_string(target_date),
        )],
        dimensions=[Dimension(name="unifiedScreenName")],
        metrics=[
            Metric(name="screenPageViews"),
            Metric(name="userEngagementDuration"),
        ],
        order_bys=[OrderBy(
            metric=OrderBy.MetricOrderBy(metric_name="screenPageViews"),
            desc=True,
        )],
        limit=10,
    )


def _parse_basics(response, target_date: date) -> dict:
    by_date: Dict[date, dict] = {}
    for row in response.rows:
        d = _ga4_date_token_to_date(row.dimension_values[0].value)
        by_date[d] = {
            "active_users": _to_int(row.metric_values[0].value),
            "new_users": _to_int(row.metric_values[1].value),
            "sessions": _to_int(row.metric_values[2].value),
            "avg_session_duration_seconds": _to_float(row.metric_values[3].value),
            "screen_page_views": _to_int(row.metric_values[4].value),
        }

    today_row = by_date.get(target_date, {})
    prior_rows = [v for d, v in by_date.items() if d != target_date]

    def _avg(key: str) -> float:
        if not prior_rows:
            return 0.0
        return round(sum(r.get(key, 0) for r in prior_rows) / len(prior_rows), 2)

    return {
        "active_users": {
            "yesterday": today_row.get("active_users", 0),
            "prior_week_avg": _avg("active_users"),
        },
        "new_users": {
            "yesterday": today_row.get("new_users", 0),
            "prior_week_avg": _avg("new_users"),
        },
        "sessions": {
            "yesterday": today_row.get("sessions", 0),
            "prior_week_avg": _avg("sessions"),
        },
        "avg_session_duration_seconds": today_row.get("avg_session_duration_seconds", 0.0),
        "screen_page_views": today_row.get("screen_page_views", 0),
    }


def _parse_events(response) -> Dict[str, dict]:
    result: Dict[str, dict] = {}
    for row in response.rows:
        event_name = row.dimension_values[0].value
        result[event_name] = {
            "count": _to_int(row.metric_values[0].value),
            "users": _to_int(row.metric_values[1].value),
        }
    return result


def _parse_screens(response) -> List[dict]:
    screens: List[dict] = []
    for row in response.rows:
        screens.append({
            "name": row.dimension_values[0].value,
            "views": _to_int(row.metric_values[0].value),
            "engagement_seconds": _to_int(row.metric_values[1].value),
        })
    return screens


def fetch_ga4_snapshot(
    property_id: str,
    credentials_path: str,
    target_date: date,
    rewire_event_names: Iterable[str] = REWIRE_KEY_EVENTS,
) -> dict:
    """Return a 3-section snapshot of GA4 activity for ``target_date``.

    Sections:
        basics — activity totals + 6-day prior-week averages.
        events — per-event counts for the allowlisted Rewire events.
        top_screens — top 10 screens by views with engagement duration.

    Raises:
        ValueError: when ``property_id`` or ``credentials_path`` is empty.
        RuntimeError: when the underlying GA4 Data API call fails.
    """
    _require(property_id, "property_id")
    _require(credentials_path, "credentials_path")

    try:
        credentials, _ = load_credentials_from_file(
            credentials_path, scopes=[GA4_READ_SCOPE]
        )
        client = BetaAnalyticsDataClient(credentials=credentials)

        basics_resp = client.run_report(
            request=_build_basics_request(property_id, target_date)
        )
        events_resp = client.run_report(
            request=_build_events_request(property_id, target_date, rewire_event_names)
        )
        screens_resp = client.run_report(
            request=_build_screens_request(property_id, target_date)
        )
    except Exception as exc:  # The GA4 SDK raises google.api_core errors here.
        raise RuntimeError(f"GA4 fetch failed: {exc}") from exc

    return {
        "basics": _parse_basics(basics_resp, target_date),
        "events": _parse_events(events_resp),
        "top_screens": _parse_screens(screens_resp),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }


def _format_delta(today: float, baseline: float) -> str:
    if baseline == 0:
        return "no prior data"
    delta = (today - baseline) / baseline * 100
    if abs(delta) < 1:
        return "flat vs 7d avg"
    sign = "+" if delta > 0 else ""
    return f"{sign}{delta:.1f}% vs 7d avg"


def summarize_ga4(snapshot: dict) -> Dict[str, str]:
    """Render the snapshot into compact, prompt-friendly strings.

    Mirrors `revenuecat_client.summarize_overview` in shape so the
    report-generator can blend both summaries uniformly.
    """
    summary: Dict[str, str] = {}
    basics = snapshot.get("basics", {})

    active = basics.get("active_users") or {}
    if active.get("yesterday") is not None and active.get("prior_week_avg") is not None:
        summary["active_users"] = (
            f"{active['yesterday']} ({_format_delta(active['yesterday'], active['prior_week_avg'])})"
        )

    new = basics.get("new_users") or {}
    if new.get("yesterday") is not None and new.get("prior_week_avg") is not None:
        summary["new_users"] = (
            f"{new['yesterday']} ({_format_delta(new['yesterday'], new['prior_week_avg'])})"
        )

    events = snapshot.get("events", {})
    paywall = events.get("paywall_viewed") or {}
    purchases = events.get("pro_purchase_completed") or {}
    if paywall.get("count", 0) > 0 and purchases.get("count") is not None:
        cvr = purchases["count"] / paywall["count"] * 100
        summary["paywall_cvr"] = f"{cvr:.1f}%"

    breathing_start = events.get("breathing_started") or {}
    breathing_done = events.get("breathing_completed") or {}
    if breathing_start.get("count", 0) > 0:
        rate = breathing_done.get("count", 0) / breathing_start["count"] * 100
        summary["breathing_completion_rate"] = f"{rate:.1f}%"

    return summary


# ---------------------------------------------------------------------------
# Cohort retention (D1 / D7 / D30)
#
# Kept independent of `fetch_ga4_snapshot`: retention uses a CohortSpec report
# (a different shape) and must fail on its own so a flaky cohort call never
# takes down the basics/events table. GA4 derives retention automatically from
# `first_open` / `session_start`, so this needs no in-app instrumentation —
# it measures "opened-the-app" retention, not engaged (core-action) retention.
# ---------------------------------------------------------------------------


def _run_single_report(credentials_path: str, request: RunReportRequest, label: str):
    """Load credentials, build a client, and run one report — wrapping any
    GA4 SDK failure as a RuntimeError tagged with ``label`` for diagnosis."""
    try:
        credentials, _ = load_credentials_from_file(
            credentials_path, scopes=[GA4_READ_SCOPE]
        )
        client = BetaAnalyticsDataClient(credentials=credentials)
        return client.run_report(request=request)
    except Exception as exc:  # google.api_core errors surface here.
        raise RuntimeError(f"GA4 {label} fetch failed: {exc}") from exc


def _build_retention_request(
    property_id: str,
    end_date: date,
    cohort_window_days: int,
    max_offset: int,
) -> RunReportRequest:
    """One aggregated daily cohort of users who first opened within the window.

    `cohortActiveUsers` at nthDay=0 is the cohort size; at nthDay=N it is how
    many returned N days later. Retention(N) = active(N) / active(0).
    """
    start = end_date - timedelta(days=cohort_window_days)
    return RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="cohort"), Dimension(name="cohortNthDay")],
        metrics=[Metric(name="cohortActiveUsers")],
        cohort_spec=CohortSpec(
            cohorts=[Cohort(
                # GA4 rejects names beginning with "cohort_".
                name="all_users",
                dimension="firstSessionDate",
                date_range=DateRange(
                    start_date=_gtm_date_string(start),
                    end_date=_gtm_date_string(end_date),
                ),
            )],
            cohorts_range=CohortsRange(
                granularity=CohortsRange.Granularity.DAILY,
                start_offset=0,
                end_offset=max_offset,
            ),
        ),
    )


def _parse_retention(response, offsets: Iterable[int] = RETENTION_OFFSETS) -> dict:
    active_by_day: Dict[int, int] = {}
    for row in response.rows:
        nth = _to_int(row.dimension_values[1].value)
        active = _to_int(row.metric_values[0].value)
        active_by_day[nth] = active_by_day.get(nth, 0) + active

    day0 = active_by_day.get(0, 0)
    retention: Dict[int, float] = {}
    for d in offsets:
        if day0 > 0 and d in active_by_day:
            retention[d] = round(active_by_day[d] / day0, 4)
        else:
            retention[d] = None

    return {
        "cohort_size": day0,
        "active_by_day": active_by_day,
        "retention": retention,
    }


def fetch_ga4_retention(
    property_id: str,
    credentials_path: str,
    end_date: date,
    cohort_window_days: int = 28,
    max_offset: int = 30,
    offsets: Iterable[int] = RETENTION_OFFSETS,
) -> dict:
    """Return D1/D7/D30 (or supplied offsets) retention for a recent cohort.

    The cohort aggregates everyone whose first session falls in
    ``[end_date - cohort_window_days, end_date]``. Because it is a single
    rolling window, offset N only reflects members old enough to have N days
    of history — with a 28-day window D30 is a partial (lower-bound) signal.

    Raises:
        ValueError: when ``property_id`` or ``credentials_path`` is empty.
        RuntimeError: when the underlying GA4 Data API call fails.
    """
    _require(property_id, "property_id")
    _require(credentials_path, "credentials_path")

    start = end_date - timedelta(days=cohort_window_days)
    request = _build_retention_request(
        property_id, end_date, cohort_window_days, max_offset
    )
    response = _run_single_report(credentials_path, request, "retention")

    result = _parse_retention(response, offsets)
    result["cohort_start"] = _gtm_date_string(start)
    result["cohort_end"] = _gtm_date_string(end_date)
    result["fetched_at"] = datetime.now(timezone.utc).isoformat()
    return result


def summarize_retention(result: dict) -> Dict[str, str]:
    """Render retention into compact strings (D1/D7/D30 + cohort size)."""
    retention = result.get("retention", {})

    def _pct(rate) -> str:
        return "N/A" if rate is None else f"{rate * 100:.1f}%"

    return {
        "d1": _pct(retention.get(1)),
        "d7": _pct(retention.get(7)),
        "d30": _pct(retention.get(30)),
        "cohort_size": str(result.get("cohort_size", 0)),
    }


# ---------------------------------------------------------------------------
# Full event scan (allowlist removed)
#
# `fetch_ga4_snapshot` filters to REWIRE_KEY_EVENTS to keep the daily table
# focused. This unfiltered scan surfaces EVERYTHING actually firing — useful
# to catch instrumentation gaps (an event we expect but see 0 of), unexpected
# events, and GA4 automatic events (first_open, session_start, screen_view).
# ---------------------------------------------------------------------------


def _build_all_events_request(property_id: str, target_date: date) -> RunReportRequest:
    return RunReportRequest(
        property=f"properties/{property_id}",
        date_ranges=[DateRange(
            start_date=_gtm_date_string(target_date),
            end_date=_gtm_date_string(target_date),
        )],
        dimensions=[Dimension(name="eventName")],
        metrics=[
            Metric(name="eventCount"),
            Metric(name="totalUsers"),
        ],
        order_bys=[OrderBy(
            metric=OrderBy.MetricOrderBy(metric_name="eventCount"),
            desc=True,
        )],
    )


def fetch_all_events(
    property_id: str,
    credentials_path: str,
    target_date: date,
) -> List[dict]:
    """Return every event firing on ``target_date`` as ``{name, count, users}``
    sorted by count descending (no allowlist filter).

    Raises:
        ValueError: when ``property_id`` or ``credentials_path`` is empty.
        RuntimeError: when the underlying GA4 Data API call fails.
    """
    _require(property_id, "property_id")
    _require(credentials_path, "credentials_path")

    request = _build_all_events_request(property_id, target_date)
    response = _run_single_report(credentials_path, request, "all-events")

    return [
        {
            "name": row.dimension_values[0].value,
            "count": _to_int(row.metric_values[0].value),
            "users": _to_int(row.metric_values[1].value),
        }
        for row in response.rows
    ]
