#!/usr/bin/env python3
"""Funnel analysis script for Rewire App Store analytics.

Reads TSV data from data/analytics/<date>/ and calculates
conversion rates at each funnel stage.

Usage:
    python scripts/analyze_funnel.py --date 2026-04-03
    python scripts/analyze_funnel.py --date 2026-04-03 --output docs/analytics/
"""
import argparse
import csv
import json
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional


# Benchmark values (RevenueCat State of Subscription Apps 2024)
BENCHMARKS = {
    "page_view_rate": {"low": 0.25, "high": 0.35, "label": "Page View Rate"},
    "download_rate": {"low": 0.30, "high": 0.40, "label": "Download Rate"},
    "trial_start_rate": {"low": 0.15, "high": 0.25, "label": "Trial Start Rate"},
    "trial_to_paid_rate": {"low": 0.40, "high": 0.60, "label": "Trial → Paid Rate"},
    "monthly_churn_rate": {"low": 0.05, "high": 0.08, "label": "Monthly Churn Rate"},
}


def find_data_dir(base_path: Path, target_date: Optional[str] = None) -> Optional[Path]:
    """Find the analytics data directory for a given date.

    If no date specified, returns the most recent available.
    """
    analytics_dir = base_path / "data" / "analytics"
    if not analytics_dir.exists():
        return None

    if target_date:
        candidate = analytics_dir / target_date
        return candidate if candidate.exists() else None

    # Find most recent
    date_dirs = sorted(
        [d for d in analytics_dir.iterdir() if d.is_dir()],
        reverse=True,
    )
    return date_dirs[0] if date_dirs else None


def load_tsv_data(data_dir: Path) -> dict:
    """Load all TSV files from a date directory.

    Returns dict mapping filename -> list of row dicts.
    """
    result = {}
    for tsv_file in data_dir.glob("*.tsv"):
        with open(tsv_file, encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter="\t")
            result[tsv_file.stem] = list(reader)
    return result


# Real ASC Analytics Reports v1 TSVs are long-format: one row per
# (Event × dimension combination), with the numeric value in the ``Counts``
# column. Map the lowercased Event value to one of our metric keys.
_EVENT_TO_METRIC = {
    "impression": "impressions",
    "impressions": "impressions",
    "page view": "product_page_views",
    "page views": "product_page_views",
    "product page view": "product_page_views",
    "product page views": "product_page_views",
    "tap": "taps",
    "taps": "taps",
    "install": "app_units",
    "installs": "app_units",
    "download": "app_units",
    "downloads": "app_units",
    "session": "sessions",
    "sessions": "sessions",
    "active device": "active_devices",
    "active devices": "active_devices",
    "free trial": "trial_starts",
    "free trials": "trial_starts",
    "trial start": "trial_starts",
    "trial starts": "trial_starts",
    "paid conversion": "paid_conversions",
    "paid conversions": "paid_conversions",
    "cancel": "cancellations",
    "cancels": "cancellations",
    "cancellation": "cancellations",
    "cancellations": "cancellations",
    "active subscription": "active_subscriptions",
    "active subscriptions": "active_subscriptions",
}

# --- Per-report routing -----------------------------------------------------
#
# Every ASC report carries its own discriminator column, and the same value can
# mean different things depending on which report it came from ("Voluntary
# churn" is a daily flow in the event report but a standing population in the
# state report). Routing on the report file stem — which is what
# `load_tsv_data` keys on — means the meaning is read from the file identity
# rather than guessed from the columns.

# app_downloads_standard.tsv. Updates are not acquisitions, so "Auto-update"
# and friends are deliberately unmapped.
_DOWNLOAD_TYPE_TO_METRIC = {
    "first-time download": "app_units",
    "redownload": "redownloads",
}

# app_store_subscription_event_report_standard.tsv — the daily FLOW of
# subscription events. A renewal is recurring revenue from an existing
# subscriber, so it is kept out of paid_conversions: folding it in would
# inflate trial_to_paid_rate without bound.
_SUBSCRIPTION_EVENT_TO_METRIC = {
    "free trial start activation": "trial_starts",
    "full price from free trial": "paid_conversions",
    "full price subscription start reactivation": "paid_conversions",
    "full price renewal": "renewals",
    "voluntary churn from free trial": "cancellations",
    "voluntary churn from full price": "cancellations",
    "involuntary churn": "cancellations",
}

# app_store_subscription_state_report_standard.tsv — a SNAPSHOT of the current
# subscriber population. Churn here is everyone standing in a churned state,
# not the churns that happened today; summing it with the event report above
# would double-count every cancellation.
_SUBSCRIPTION_STATE_TO_METRIC = {
    "free trial": "active_subscriptions",
    "full price": "active_subscriptions",
    "introductory price": "active_subscriptions",
    "voluntary churn": "churned_subscriptions",
    "involuntary churn": "churned_subscriptions",
}

# retention_messaging.tsv — the win-back offer shown while cancelling. Its
# "Page views" are views of that offer, NOT App Store product page views, and
# its "Cancels" overlap the event report's churn rows.
_RETENTION_MESSAGING_TO_METRIC = {
    "page views": "retention_message_views",
    "cancels": "retention_message_cancels",
}

# report stem -> (discriminator column, value -> metric key)
_REPORT_ROUTES = {
    "app_downloads_standard": ("Download Type", _DOWNLOAD_TYPE_TO_METRIC),
    "app_store_subscription_event_report_standard": (
        "Event Name", _SUBSCRIPTION_EVENT_TO_METRIC,
    ),
    "app_store_subscription_state_report_standard": (
        "State Metric", _SUBSCRIPTION_STATE_TO_METRIC,
    ),
    "retention_messaging": ("Event", _RETENTION_MESSAGING_TO_METRIC),
    "app_store_discovery_and_engagement_standard": ("Event", _EVENT_TO_METRIC),
}

# "Detailed" variants are privacy-thresholded SUBSETS of their standard
# counterpart, not additional data. Verified against 2026-07-17: for every
# territory the detailed impression count was <= standard, and detailed carried
# only the "App Store search" source. They are excluded from totals and used
# only for dimensional breakdowns.
_SUBSET_REPORTS = frozenset({
    "app_store_discovery_and_engagement_detailed",
    "app_store_subscription_event_report_detailed",
    "app_store_subscription_state_report_detailed",
    "app_downloads_detailed",
})


# app_store_purchases_standard.tsv is wide, not discriminator-keyed: every row
# is one purchase slice with its own numeric columns. It is the only
# Apple-side source of proceeds and paying users.
_PURCHASE_COLUMN_TO_METRIC = {
    "Purchases": "purchases",
    "Paying Users": "paying_users",
    "Proceeds in USD": "proceeds_usd",
    "Sales in USD": "sales_usd",
}

_PURCHASES_REPORT = "app_store_purchases_standard"

# Reports the pipeline expects Apple to deliver each day. Anything absent is
# unmeasured, which is not the same as zero — see `detect_missing_reports`.
EXPECTED_REPORTS = (
    "app_store_discovery_and_engagement_standard",
    "app_downloads_standard",
    "app_store_subscription_event_report_standard",
    "app_store_subscription_state_report_standard",
    _PURCHASES_REPORT,
)

# Which metrics go dark when a given report fails to arrive.
_REPORT_TO_METRICS = {
    "app_store_discovery_and_engagement_standard": (
        "impressions", "product_page_views", "taps",
    ),
    "app_downloads_standard": ("app_units", "redownloads"),
    "app_store_subscription_event_report_standard": (
        "trial_starts", "paid_conversions", "renewals", "cancellations",
    ),
    "app_store_subscription_state_report_standard": (
        "active_subscriptions", "churned_subscriptions",
    ),
    _PURCHASES_REPORT: (
        "purchases", "paying_users", "proceeds_usd", "sales_usd",
    ),
}


def detect_missing_reports(data: dict) -> list:
    """Return the expected reports Apple did not deliver for this date."""
    return [name for name in EXPECTED_REPORTS if name not in data]


def unmeasured_metrics(missing_reports) -> set:
    """Return the metrics that cannot be measured given ``missing_reports``.

    These must render as 未取得 rather than 0, or a delivery gap reads as a
    collapse in performance.
    """
    unmeasured = set()
    for report in missing_reports:
        unmeasured.update(_REPORT_TO_METRICS.get(report, ()))
    return unmeasured


def days_to_purchase(rows) -> list:
    """Days between install and purchase for each row that records both.

    ``App Download Date`` lets Apple answer "how long until they paid?"
    directly, with no BigQuery cohort reconstruction. Rows missing or
    malforming either date are skipped rather than guessed at.
    """
    spans = []
    for row in rows:
        installed = str(row.get("App Download Date", "")).strip()
        purchased = str(row.get("Date", "")).strip()
        if not installed or not purchased:
            continue
        try:
            delta = date.fromisoformat(purchased) - date.fromisoformat(installed)
        except ValueError:
            continue
        spans.append(delta.days)
    return spans


def _routed_metric_key(stem: str, row: dict) -> Optional[str]:
    """Return the metric key for ``row`` under ``stem``'s routing, if any."""
    route = _REPORT_ROUTES.get(stem)
    if route is None:
        return None
    column, mapping = route
    return mapping.get(str(row.get(column, "")).strip().lower())


# Legacy wide-format column names — retained so synthetic test fixtures
# (and any hypothetical future wide-format reports) keep working.
_WIDE_COLUMN_MAPPINGS = {
    "impressions": ["Impressions", "impressions", "Total Impressions"],
    "product_page_views": ["Product Page Views", "product_page_views", "Page Views"],
    "app_units": ["App Units", "app_units", "Units", "Downloads", "Total Downloads"],
    "sessions": ["Sessions", "sessions"],
    "active_devices": ["Active Devices", "active_devices", "Active in Last 30 Days"],
    "trial_starts": ["Free Trials", "trial_starts", "Trial Starts"],
    "paid_conversions": ["Paid", "paid_conversions", "Conversions", "Pay Up Front + Free Trial Conversions"],
    "cancellations": ["Cancellations", "cancellations"],
    "active_subscriptions": ["Active Subscriptions", "active_subscriptions", "Active Standard Price Subscriptions"],
}


def _empty_metrics() -> dict:
    return {
        "impressions": 0,
        "product_page_views": 0,
        "app_units": 0,
        "redownloads": 0,
        "taps": 0,
        "sessions": 0,
        "active_devices": 0,
        "trial_starts": 0,
        "paid_conversions": 0,
        "renewals": 0,
        "cancellations": 0,
        "active_subscriptions": 0,
        "churned_subscriptions": 0,
        "retention_message_views": 0,
        "retention_message_cancels": 0,
        "purchases": 0,
        "paying_users": 0,
        "proceeds_usd": 0.0,
        "sales_usd": 0.0,
    }


def _coerce_amount(raw) -> Optional[float]:
    if raw is None:
        return None
    try:
        return float(str(raw).replace(",", "").replace("$", ""))
    except (ValueError, TypeError):
        return None


def _coerce_count(raw) -> Optional[int]:
    if raw is None:
        return None
    try:
        return int(str(raw).replace(",", ""))
    except (ValueError, TypeError):
        return None


def _event_metric_key(event_value) -> Optional[str]:
    if event_value is None:
        return None
    return _EVENT_TO_METRIC.get(str(event_value).strip().lower())


def extract_metrics(data: dict) -> dict:
    """Aggregate funnel metrics from loaded TSV rows.

    Recognised ASC reports are routed by file stem (see ``_REPORT_ROUTES``) so
    each discriminator column is read with its own report's meaning, and
    "detailed" subset reports are skipped to avoid double-counting.

    Unrecognised names fall back to the permissive legacy behaviour, which
    handles both:
      - long format: rows with ``Event`` + ``Counts``.
      - wide format (synthetic fixtures): one column per metric.
    """
    metrics = _empty_metrics()

    for filename, rows in data.items():
        stem = str(filename)
        if stem in _SUBSET_REPORTS:
            continue
        is_routed = stem in _REPORT_ROUTES

        if stem == _PURCHASES_REPORT:
            for row in rows:
                for column, metric_key in _PURCHASE_COLUMN_TO_METRIC.items():
                    amount = _coerce_amount(row.get(column))
                    if amount is None:
                        continue
                    # Counts stay integral; only the USD columns are money.
                    metrics[metric_key] += (
                        amount if metric_key.endswith("_usd") else int(amount)
                    )
            continue

        for row in rows:
            if is_routed:
                metric_key = _routed_metric_key(stem, row)
                if metric_key is None:
                    continue
                count = _coerce_count(row.get("Counts"))
                if count is not None:
                    metrics[metric_key] += count
            elif "Event" in row and "Counts" in row:
                metric_key = _event_metric_key(row["Event"])
                if metric_key is None:
                    continue
                count = _coerce_count(row["Counts"])
                if count is not None:
                    metrics[metric_key] += count
            else:
                # Wide-format fallback.
                for metric_key, possible_cols in _WIDE_COLUMN_MAPPINGS.items():
                    for col in possible_cols:
                        if col in row:
                            count = _coerce_count(row[col])
                            if count is not None:
                                metrics[metric_key] += count

    return metrics


def _normalize_source(raw_source: str) -> str:
    lower = raw_source.lower()
    if "tiktok" in lower or "ct=tiktok" in lower:
        return "TikTok"
    if "search" in lower:
        return "App Store Search"
    if "browse" in lower:
        return "App Store Browse"
    if "web" in lower:
        return "Web Referral"
    return raw_source


_SOURCE_METRIC_KEYS = (
    "impressions",
    "product_page_views",
    "app_units",
    "taps",
    "trial_starts",
    "paid_conversions",
)

_WIDE_SOURCE_COLUMN_MAPPINGS = {
    "impressions": ["Impressions", "impressions", "Total Impressions"],
    "product_page_views": ["Product Page Views", "product_page_views", "Page Views"],
    "app_units": ["App Units", "app_units", "Units", "Downloads", "Total Downloads"],
    "trial_starts": ["Free Trials", "trial_starts", "Trial Starts"],
    "paid_conversions": ["Paid", "paid_conversions", "Conversions",
                         "Pay Up Front + Free Trial Conversions"],
}


def extract_metrics_by_source(data: dict) -> dict:
    """Aggregate per-source metrics, handling long & wide TSV formats."""
    sources: dict = {}
    source_columns = ("Source", "source", "Source Type", "Campaign")

    def _bucket_for(name: str) -> dict:
        bucket = sources.setdefault(
            name, {k: 0 for k in _SOURCE_METRIC_KEYS}
        )
        return bucket

    for filename, rows in data.items():
        stem = str(filename)
        if stem in _SUBSET_REPORTS:
            continue
        is_routed = stem in _REPORT_ROUTES

        for row in rows:
            # Resolve the metric first: a routed row that maps to nothing
            # attributable (a retention-message view, an auto-update) must not
            # even create a source bucket, or the 媒体別 table sprouts empty
            # "Unknown" channels.
            if is_routed:
                metric_key = _routed_metric_key(stem, row)
                if metric_key not in _SOURCE_METRIC_KEYS:
                    continue
            elif "Event" in row and "Counts" in row:
                metric_key = _event_metric_key(row["Event"])
                if metric_key not in _SOURCE_METRIC_KEYS:
                    continue
            else:
                metric_key = None

            raw_source = "Unknown"
            for col in source_columns:
                if col in row and row[col]:
                    raw_source = row[col]
                    break
            source = _normalize_source(raw_source)
            bucket = _bucket_for(source)

            if metric_key is not None:
                count = _coerce_count(row.get("Counts"))
                if count is not None:
                    bucket[metric_key] += count
            else:
                for metric_key, possible_cols in _WIDE_SOURCE_COLUMN_MAPPINGS.items():
                    for col_name in possible_cols:
                        if col_name in row:
                            count = _coerce_count(row[col_name])
                            if count is not None:
                                bucket[metric_key] += count

    return sources


def calculate_funnel(metrics: dict) -> dict:
    """Calculate conversion rates for each funnel stage."""
    funnel = {}

    def safe_rate(numerator: int, denominator: int) -> Optional[float]:
        return round(numerator / denominator, 4) if denominator > 0 else None

    funnel["page_view_rate"] = safe_rate(
        metrics["product_page_views"], metrics["impressions"]
    )
    funnel["download_rate"] = safe_rate(
        metrics["app_units"], metrics["product_page_views"]
    )
    funnel["trial_start_rate"] = safe_rate(
        metrics["trial_starts"], metrics["app_units"]
    )
    funnel["trial_to_paid_rate"] = safe_rate(
        metrics["paid_conversions"], metrics["trial_starts"]
    )
    funnel["monthly_churn_rate"] = safe_rate(
        metrics["cancellations"], metrics["active_subscriptions"]
    )

    return funnel


def identify_bottleneck(funnel: dict) -> tuple:
    """Find the funnel stage with the worst performance vs benchmark.

    Returns (stage_key, gap_vs_benchmark).
    """
    worst_stage = None
    worst_gap = 0

    for stage, rate in funnel.items():
        if rate is None:
            continue
        benchmark = BENCHMARKS.get(stage)
        if not benchmark:
            continue

        # For churn, higher is worse
        if "churn" in stage:
            gap = rate - benchmark["high"]  # positive = bad
        else:
            gap = benchmark["low"] - rate  # positive = bad

        if gap > worst_gap:
            worst_gap = gap
            worst_stage = stage

    return worst_stage, worst_gap


def format_rate(rate: Optional[float]) -> str:
    """Format a rate as percentage string."""
    if rate is None:
        return "N/A"
    return f"{rate * 100:.1f}%"


def benchmark_comparison(rate: Optional[float], stage_key: str) -> str:
    """Compare rate to benchmark and return emoji indicator."""
    if rate is None:
        return "—"
    benchmark = BENCHMARKS.get(stage_key)
    if not benchmark:
        return "—"

    if "churn" in stage_key:
        if rate <= benchmark["low"]:
            return "✅ Good"
        elif rate <= benchmark["high"]:
            return "⚠️ OK"
        else:
            return "🔴 High"
    else:
        if rate >= benchmark["high"]:
            return "✅ Above"
        elif rate >= benchmark["low"]:
            return "⚠️ Average"
        else:
            return "🔴 Below"


def generate_daily_report(
    target_date: str,
    metrics: dict,
    funnel: dict,
    sources: dict,
    bottleneck: tuple,
) -> str:
    """Generate a daily Markdown report."""
    lines = [
        f"# Rewire Daily Analytics - {target_date}",
        "",
        "## Funnel Summary",
        "",
        "| Stage | Count | Conversion Rate | vs Benchmark |",
        "|-------|-------|----------------|--------------|",
    ]

    stages = [
        ("Impressions", metrics["impressions"], None, None),
        ("→ Page Views", metrics["product_page_views"], funnel.get("page_view_rate"), "page_view_rate"),
        ("→ Downloads", metrics["app_units"], funnel.get("download_rate"), "download_rate"),
        ("→ Trial Starts", metrics["trial_starts"], funnel.get("trial_start_rate"), "trial_start_rate"),
        ("→ Paid", metrics["paid_conversions"], funnel.get("trial_to_paid_rate"), "trial_to_paid_rate"),
    ]

    for label, count, rate, key in stages:
        rate_str = format_rate(rate)
        bench = benchmark_comparison(rate, key) if key else "—"
        lines.append(f"| {label} | {count:,} | {rate_str} | {bench} |")

    # Churn
    lines.append(
        f"| Churn Rate | {metrics['cancellations']:,}/{metrics['active_subscriptions']:,} "
        f"| {format_rate(funnel.get('monthly_churn_rate'))} "
        f"| {benchmark_comparison(funnel.get('monthly_churn_rate'), 'monthly_churn_rate')} |"
    )

    # Bottleneck
    lines.extend(["", "## Bottleneck Analysis", ""])
    if bottleneck[0]:
        label = BENCHMARKS[bottleneck[0]]["label"]
        rate = funnel[bottleneck[0]]
        bench_low = BENCHMARKS[bottleneck[0]]["low"]
        lines.append(
            f"The biggest drop-off is at **{label}** "
            f"({format_rate(rate)} vs benchmark {format_rate(bench_low)})."
        )
    else:
        lines.append("No significant bottleneck detected (all stages within benchmark).")

    # Channel comparison
    if sources:
        lines.extend(["", "## Channel Comparison", ""])
        lines.append("| Channel | Impressions | Downloads | Trial Starts | Paid |")
        lines.append("|---------|-------------|-----------|--------------|------|")
        for source, smetrics in sorted(sources.items()):
            lines.append(
                f"| {source} "
                f"| {smetrics['impressions']:,} "
                f"| {smetrics['app_units']:,} "
                f"| {smetrics['trial_starts']:,} "
                f"| {smetrics['paid_conversions']:,} |"
            )

    # Actions
    lines.extend(["", "## Top 3 Improvement Actions", ""])
    actions = generate_actions(funnel, bottleneck, sources)
    for i, action in enumerate(actions[:3], 1):
        lines.append(f"{i}. {action}")

    lines.append("")
    lines.append(f"*Report generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}*")

    return "\n".join(lines)


def generate_actions(funnel: dict, bottleneck: tuple, sources: dict) -> list:
    """Generate improvement action recommendations based on analysis."""
    actions = []
    stage = bottleneck[0] if bottleneck else None

    if stage == "page_view_rate":
        actions.extend([
            "Optimize App Store keywords and title to improve impression-to-page-view conversion. "
            "Test adding the main value proposition to the subtitle.",
            "Update the app icon to be more eye-catching in search results. "
            "A/B test 2-3 variants using App Store Product Page Optimization.",
            "Increase App Store Optimization (ASO) focus: research competitor keywords "
            "and add relevant long-tail keywords.",
        ])
    elif stage == "download_rate":
        actions.extend([
            "Improve the first 3 screenshots on the product page — they should clearly show "
            "the core value proposition within 2 seconds of viewing.",
            "Add or update the app preview video to demonstrate the key user journey. "
            "Keep it under 15 seconds with clear text overlays.",
            "Update the app description's first paragraph with social proof "
            "(ratings, user count, testimonials).",
        ])
    elif stage == "trial_start_rate":
        actions.extend([
            "Review the onboarding flow: ensure the paywall appears after the user "
            "experiences the core value (not before).",
            "A/B test the trial offer presentation: try different trial lengths "
            "(3-day vs 7-day) and emphasize 'cancel anytime'.",
            "Add personalization to onboarding (ask user goals) to increase "
            "investment before showing the paywall.",
        ])
    elif stage == "trial_to_paid_rate":
        actions.extend([
            "Implement push notification reminders during the trial period "
            "highlighting features the user hasn't tried yet.",
            "Send a trial-ending notification 24h before expiry with a summary "
            "of what they'll lose access to.",
            "Review pricing: test annual vs monthly positioning and consider "
            "an introductory offer for the first subscription period.",
        ])
    else:
        actions.extend([
            "Review the full funnel with the latest data to identify emerging bottlenecks.",
            "Set up weekly A/B tests on the lowest-performing funnel stage.",
            "Analyze TikTok campaign performance vs organic to optimize ad spend.",
        ])

    return actions


def main():
    parser = argparse.ArgumentParser(description="Analyze Rewire app funnel")
    parser.add_argument("--date", type=str, default=None, help="Target date (YYYY-MM-DD)")
    parser.add_argument("--output", type=str, default=None, help="Output directory for report")
    parser.add_argument("--project-root", type=str, default=".", help="Rewire project root")
    args = parser.parse_args()

    project_root = Path(args.project_root)
    data_dir = find_data_dir(project_root, args.date)

    if not data_dir:
        print(f"No analytics data found for date: {args.date or 'latest'}")
        print("Run 'python -m scripts.analytics.main' first to fetch data.")
        sys.exit(1)

    target_date = args.date or data_dir.name

    # Load and analyze
    data = load_tsv_data(data_dir)
    metrics = extract_metrics(data)
    funnel = calculate_funnel(metrics)
    sources = extract_metrics_by_source(data)
    bottleneck = identify_bottleneck(funnel)
    missing_reports = detect_missing_reports(data)
    purchase_spans = days_to_purchase(data.get(_PURCHASES_REPORT, []))

    # Generate report
    report = generate_daily_report(target_date, metrics, funnel, sources, bottleneck)

    # Save or print
    if args.output:
        output_dir = Path(args.output)
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file = output_dir / f"daily-report-{target_date}.md"
        output_file.write_text(report, encoding="utf-8")
        print(f"Report saved to: {output_file}")
    else:
        print(report)

    # Also output JSON metrics for programmatic use
    result = {
        "date": target_date,
        "metrics": metrics,
        "funnel": funnel,
        "bottleneck": {
            "stage": bottleneck[0],
            "gap": bottleneck[1],
        } if bottleneck[0] else None,
        "sources": sources,
        # Delivery gaps travel with the data so downstream renderers can show
        # 未取得 instead of a zero that reads as a performance collapse.
        "missing_reports": missing_reports,
        "unmeasured_metrics": sorted(unmeasured_metrics(missing_reports)),
        "days_to_purchase": purchase_spans,
    }
    json_output = json.dumps(result, indent=2, ensure_ascii=False)

    if args.output:
        json_file = Path(args.output) / f"daily-metrics-{target_date}.json"
        json_file.write_text(json_output, encoding="utf-8")
    else:
        print("\n--- JSON Metrics ---")
        print(json_output)


if __name__ == "__main__":
    main()
