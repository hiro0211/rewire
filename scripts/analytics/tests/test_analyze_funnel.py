"""Tests for funnel analysis script."""
import json
import sys
from pathlib import Path

import pytest

from scripts.analytics.analyze_funnel import (
    calculate_funnel,
    extract_metrics,
    identify_bottleneck,
    format_rate,
    benchmark_comparison,
    generate_daily_report,
    load_tsv_data,
    find_data_dir,
)


class TestCalculateFunnel:
    def test_basic_funnel_rates(self):
        metrics = {
            "impressions": 10000,
            "product_page_views": 3000,
            "app_units": 1000,
            "sessions": 800,
            "active_devices": 500,
            "trial_starts": 200,
            "paid_conversions": 100,
            "cancellations": 10,
            "active_subscriptions": 200,
        }
        funnel = calculate_funnel(metrics)

        assert funnel["page_view_rate"] == 0.3
        assert funnel["download_rate"] == pytest.approx(0.3333, abs=0.001)
        assert funnel["trial_start_rate"] == 0.2
        assert funnel["trial_to_paid_rate"] == 0.5
        assert funnel["monthly_churn_rate"] == 0.05

    def test_zero_denominator_returns_none(self):
        metrics = {
            "impressions": 0,
            "product_page_views": 0,
            "app_units": 0,
            "sessions": 0,
            "active_devices": 0,
            "trial_starts": 0,
            "paid_conversions": 0,
            "cancellations": 0,
            "active_subscriptions": 0,
        }
        funnel = calculate_funnel(metrics)
        assert funnel["page_view_rate"] is None
        assert funnel["download_rate"] is None


class TestIdentifyBottleneck:
    def test_finds_worst_stage(self):
        funnel = {
            "page_view_rate": 0.30,     # Within benchmark
            "download_rate": 0.10,      # Way below benchmark (0.30-0.40)
            "trial_start_rate": 0.20,   # Within benchmark
            "trial_to_paid_rate": 0.50, # Within benchmark
            "monthly_churn_rate": 0.06, # Within benchmark
        }
        stage, gap = identify_bottleneck(funnel)
        assert stage == "download_rate"
        assert gap > 0

    def test_no_bottleneck_when_all_good(self):
        funnel = {
            "page_view_rate": 0.40,
            "download_rate": 0.45,
            "trial_start_rate": 0.30,
            "trial_to_paid_rate": 0.65,
            "monthly_churn_rate": 0.03,
        }
        stage, gap = identify_bottleneck(funnel)
        assert stage is None

    def test_handles_none_rates(self):
        funnel = {
            "page_view_rate": None,
            "download_rate": None,
            "trial_start_rate": None,
            "trial_to_paid_rate": None,
            "monthly_churn_rate": None,
        }
        stage, gap = identify_bottleneck(funnel)
        assert stage is None


class TestFormatRate:
    def test_format_percentage(self):
        assert format_rate(0.3) == "30.0%"
        assert format_rate(0.0533) == "5.3%"

    def test_format_none(self):
        assert format_rate(None) == "N/A"


class TestBenchmarkComparison:
    def test_above_benchmark(self):
        result = benchmark_comparison(0.40, "page_view_rate")
        assert "Above" in result or "✅" in result

    def test_below_benchmark(self):
        result = benchmark_comparison(0.10, "page_view_rate")
        assert "Below" in result or "🔴" in result

    def test_churn_high_is_bad(self):
        result = benchmark_comparison(0.15, "monthly_churn_rate")
        assert "High" in result or "🔴" in result

    def test_churn_low_is_good(self):
        result = benchmark_comparison(0.03, "monthly_churn_rate")
        assert "Good" in result or "✅" in result


class TestExtractMetrics:
    def test_extract_from_tsv_data(self):
        data = {
            "engagement": [
                {"Impressions": "5,000", "Product Page Views": "1,500"},
                {"Impressions": "3,000", "Product Page Views": "900"},
            ]
        }
        metrics = extract_metrics(data)
        assert metrics["impressions"] == 8000
        assert metrics["product_page_views"] == 2400

    def test_handles_empty_data(self):
        metrics = extract_metrics({})
        assert metrics["impressions"] == 0


class TestExtractMetricsLongFormat:
    """Real ASC Analytics Reports TSVs use Event + Counts columns (long format).

    The legacy wide-format mapper would silently return all zeros for these
    files — which is the bug that produced 6+ rounds of zero daily reports.
    See MEMORY.md (2026-05-09, 2026-05-17, 2026-05-20 entries).
    """

    def test_groups_impressions_by_event_column(self):
        data = {
            "discovery": [
                {"Event": "Impression", "Counts": "5", "Source Type": "App Store search"},
                {"Event": "Impression", "Counts": "3", "Source Type": "App Store search"},
                {"Event": "Tap", "Counts": "1", "Source Type": "App Store search"},
            ]
        }
        metrics = extract_metrics(data)
        assert metrics["impressions"] == 8

    def test_maps_page_view_event_to_product_page_views(self):
        data = {
            "web_preview": [
                {"Event": "Page view", "Counts": "12"},
                {"Event": "Page view", "Counts": "3"},
            ]
        }
        metrics = extract_metrics(data)
        assert metrics["product_page_views"] == 15

    def test_collects_tap_event_separately_from_downloads(self):
        # ASC "Tap" = user tapped the Get button (intent). Real downloads come
        # from APP_USAGE category, not from Tap. Must not be summed into app_units.
        data = {
            "discovery": [
                {"Event": "Tap", "Counts": "4"},
                {"Event": "Impression", "Counts": "100"},
            ]
        }
        metrics = extract_metrics(data)
        assert metrics["taps"] == 4
        assert metrics["app_units"] == 0

    def test_maps_cancels_event_to_cancellations(self):
        data = {
            "retention": [
                {"Event": "Cancels", "Counts": "2"},
                {"Event": "Cancels", "Counts": "1"},
            ]
        }
        metrics = extract_metrics(data)
        assert metrics["cancellations"] == 3

    def test_handles_comma_separated_thousands_in_counts(self):
        data = {
            "x": [{"Event": "Impression", "Counts": "1,234"}],
        }
        metrics = extract_metrics(data)
        assert metrics["impressions"] == 1234

    def test_ignores_unknown_event_values(self):
        data = {
            "x": [
                {"Event": "Impression", "Counts": "5"},
                {"Event": "MysteryEvent", "Counts": "999"},
            ]
        }
        metrics = extract_metrics(data)
        assert metrics["impressions"] == 5
        # Mystery event should not pollute any tracked metric.
        for k, v in metrics.items():
            if k == "impressions":
                continue
            assert v == 0, f"{k} should be 0 but is {v}"

    def test_long_and_wide_formats_can_coexist(self):
        data = {
            "long": [{"Event": "Impression", "Counts": "10"}],
            "wide": [{"Impressions": "20", "Product Page Views": "5"}],
        }
        metrics = extract_metrics(data)
        assert metrics["impressions"] == 30
        assert metrics["product_page_views"] == 5


class TestExtractMetricsReportRouting:
    """Each ASC report carries its own discriminator column and its own meaning.

    `extract_metrics` originally read only rows with an ``Event`` column, so the
    entire commerce half of the funnel was silently dropped: downloads live in
    ``app_downloads_standard`` under ``Download Type``, subscription flow lives
    in the event report under ``Event Name``, and the subscription snapshot
    lives in the state report under ``State Metric``. Verified against real
    2026-07-17 TSVs, which reported 4 downloads and 1 paid start as 0 / 0.

    Routing is keyed on the report filename (``load_tsv_data`` uses the file
    stem) because the file identity — not the column — determines the meaning.
    Unrecognised names keep the permissive legacy behaviour so synthetic
    fixtures stay valid.
    """

    def test_first_time_download_counts_as_app_units(self):
        data = {
            "app_downloads_standard": [
                {"Download Type": "First-time download", "Counts": "3"},
                {"Download Type": "First-time download", "Counts": "1"},
            ]
        }
        assert extract_metrics(data)["app_units"] == 4

    def test_redownload_is_tracked_separately_from_app_units(self):
        data = {
            "app_downloads_standard": [
                {"Download Type": "First-time download", "Counts": "5"},
                {"Download Type": "Redownload", "Counts": "2"},
            ]
        }
        metrics = extract_metrics(data)
        assert metrics["app_units"] == 5
        assert metrics["redownloads"] == 2

    def test_auto_update_is_not_a_download(self):
        data = {
            "app_downloads_standard": [
                {"Download Type": "Auto-update", "Counts": "99"},
            ]
        }
        metrics = extract_metrics(data)
        assert metrics["app_units"] == 0
        assert metrics["redownloads"] == 0

    def test_free_trial_start_activation_counts_as_trial_start(self):
        data = {
            "app_store_subscription_event_report_standard": [
                {"Event Name": "Free trial start activation", "Counts": "7"},
            ]
        }
        assert extract_metrics(data)["trial_starts"] == 7

    def test_full_price_from_free_trial_counts_as_paid_conversion(self):
        data = {
            "app_store_subscription_event_report_standard": [
                {"Event Name": "Full price from free trial", "Counts": "2"},
                {"Event Name": "Full price subscription start reactivation", "Counts": "1"},
            ]
        }
        assert extract_metrics(data)["paid_conversions"] == 3

    def test_renewal_is_not_counted_as_a_new_paid_conversion(self):
        # A renewal is recurring revenue from an existing subscriber. Folding it
        # into paid_conversions would inflate trial_to_paid_rate without bound.
        data = {
            "app_store_subscription_event_report_standard": [
                {"Event Name": "Full price renewal", "Counts": "50"},
            ]
        }
        metrics = extract_metrics(data)
        assert metrics["paid_conversions"] == 0
        assert metrics["renewals"] == 50

    def test_voluntary_churn_events_count_as_cancellations(self):
        data = {
            "app_store_subscription_event_report_standard": [
                {"Event Name": "Voluntary churn from free trial", "Counts": "4"},
                {"Event Name": "Voluntary churn from full price", "Counts": "1"},
            ]
        }
        assert extract_metrics(data)["cancellations"] == 5

    def test_state_report_active_states_count_as_active_subscriptions(self):
        data = {
            "app_store_subscription_state_report_standard": [
                {"State Metric": "Free trial", "Counts": "3"},
                {"State Metric": "Full price", "Counts": "2"},
            ]
        }
        assert extract_metrics(data)["active_subscriptions"] == 5

    def test_state_report_churn_does_not_inflate_cancellations(self):
        # The state report is a snapshot of everyone currently in a churned
        # state; the event report is the flow of churns that happened that day.
        # Summing both would double-count every cancellation.
        data = {
            "app_store_subscription_state_report_standard": [
                {"State Metric": "Voluntary churn", "Counts": "800"},
                {"State Metric": "Full price", "Counts": "2"},
            ],
            "app_store_subscription_event_report_standard": [
                {"Event Name": "Voluntary churn from full price", "Counts": "1"},
            ],
        }
        metrics = extract_metrics(data)
        assert metrics["cancellations"] == 1
        assert metrics["active_subscriptions"] == 2
        assert metrics["churned_subscriptions"] == 800

    def test_detailed_discovery_report_is_excluded_from_totals(self):
        # The detailed report is a privacy-thresholded SUBSET of standard
        # (verified 2026-07-17: every territory det <= std, and detailed carried
        # only "App Store search"). Summing both double-counts impressions.
        data = {
            "app_store_discovery_and_engagement_standard": [
                {"Event": "Impression", "Counts": "606"},
                {"Event": "Page view", "Counts": "35"},
            ],
            "app_store_discovery_and_engagement_detailed": [
                {"Event": "Impression", "Counts": "410"},
                {"Event": "Page view", "Counts": "5"},
            ],
        }
        metrics = extract_metrics(data)
        assert metrics["impressions"] == 606
        assert metrics["product_page_views"] == 35

    def test_detailed_state_report_is_excluded_from_totals(self):
        data = {
            "app_store_subscription_state_report_standard": [
                {"State Metric": "Full price", "Counts": "2"},
            ],
            "app_store_subscription_state_report_detailed": [
                {"State Metric": "Full price", "Counts": "2"},
            ],
        }
        assert extract_metrics(data)["active_subscriptions"] == 2

    def test_retention_messaging_page_views_are_not_product_page_views(self):
        # These are views of the subscription retention offer shown during
        # cancellation, not App Store product page views.
        data = {
            "retention_messaging": [
                {"Event": "Page views", "Counts": "2"},
                {"Event": "Cancels", "Counts": "1"},
            ]
        }
        metrics = extract_metrics(data)
        assert metrics["product_page_views"] == 0
        assert metrics["retention_message_views"] == 2

    def test_retention_messaging_cancels_do_not_double_count_cancellations(self):
        data = {
            "retention_messaging": [
                {"Event": "Cancels", "Counts": "1"},
            ],
            "app_store_subscription_event_report_standard": [
                {"Event Name": "Voluntary churn from full price", "Counts": "1"},
            ],
        }
        metrics = extract_metrics(data)
        assert metrics["cancellations"] == 1
        assert metrics["retention_message_cancels"] == 1


class TestPurchasesReport:
    """`app_store_purchases_standard.tsv` was being discarded entirely.

    It is the only source of Apple-side revenue truth (proceeds, paying users)
    and it carries ``App Download Date``, which gives days-from-install-to-
    purchase without needing BigQuery.
    """

    def test_purchases_and_revenue_are_collected(self):
        data = {
            "app_store_purchases_standard": [
                {"Purchase Type": "In-app purchase", "Purchases": "1",
                 "Proceeds in USD": "3.57", "Sales in USD": "4.20",
                 "Paying Users": "1"},
                {"Purchase Type": "In-app purchase", "Purchases": "2",
                 "Proceeds in USD": "7.14", "Sales in USD": "8.40",
                 "Paying Users": "2"},
            ]
        }
        metrics = extract_metrics(data)
        assert metrics["purchases"] == 3
        assert metrics["paying_users"] == 3
        assert metrics["proceeds_usd"] == pytest.approx(10.71)
        assert metrics["sales_usd"] == pytest.approx(12.60)

    def test_purchases_do_not_leak_into_app_units(self):
        data = {
            "app_store_purchases_standard": [
                {"Purchase Type": "In-app purchase", "Purchases": "5",
                 "Proceeds in USD": "0", "Sales in USD": "0",
                 "Paying Users": "5"},
            ]
        }
        assert extract_metrics(data)["app_units"] == 0

    def test_days_from_install_to_purchase(self):
        from scripts.analytics.analyze_funnel import days_to_purchase

        rows = [
            {"Date": "2026-07-14", "App Download Date": "2026-07-14",
             "Purchases": "1"},
            {"Date": "2026-07-14", "App Download Date": "2026-07-07",
             "Purchases": "1"},
            {"Date": "2026-07-14", "App Download Date": "", "Purchases": "1"},
        ]
        assert days_to_purchase(rows) == [0, 7]

    def test_days_to_purchase_ignores_malformed_dates(self):
        from scripts.analytics.analyze_funnel import days_to_purchase

        rows = [
            {"Date": "2026-07-14", "App Download Date": "not-a-date",
             "Purchases": "1"},
            {"Date": "2026-07-14", "App Download Date": "2026-07-10",
             "Purchases": "1"},
        ]
        assert days_to_purchase(rows) == [4]


class TestMissingReportDetection:
    """A report Apple did not deliver must not be rendered as a zero.

    2026-07-15 arrived with no discovery report at all; the pipeline reported
    "impressions 0", which reads as "nobody saw the app" rather than "no data".
    """

    def test_reports_absent_from_the_payload_are_listed(self):
        from scripts.analytics.analyze_funnel import detect_missing_reports

        data = {
            "app_downloads_standard": [],
            "app_store_subscription_state_report_standard": [],
        }
        missing = detect_missing_reports(data)
        assert "app_store_discovery_and_engagement_standard" in missing

    def test_no_missing_reports_when_all_present(self):
        from scripts.analytics.analyze_funnel import (
            EXPECTED_REPORTS, detect_missing_reports,
        )

        data = {name: [] for name in EXPECTED_REPORTS}
        assert detect_missing_reports(data) == []

    def test_metrics_flag_which_are_unmeasured(self):
        from scripts.analytics.analyze_funnel import unmeasured_metrics

        # Discovery missing => impressions/page views/taps are unknown, not zero.
        unmeasured = unmeasured_metrics(
            ["app_store_discovery_and_engagement_standard"]
        )
        assert "impressions" in unmeasured
        assert "product_page_views" in unmeasured
        assert "taps" in unmeasured
        assert "app_units" not in unmeasured


class TestExtractMetricsRealFixture:
    """End-to-end against the real 2026-07-17 report set.

    These are the numbers the daily email should have carried. It shipped
    impressions=1016 / app_units=0 / paid_conversions=0 instead.
    """

    FIXTURE_DATE = "2026-07-17"

    @pytest.fixture
    def real_data(self):
        base = Path(__file__).resolve().parents[3] / "data" / "analytics" / self.FIXTURE_DATE
        if not base.exists():
            pytest.skip(f"No local ASC data for {self.FIXTURE_DATE}")
        return load_tsv_data(base)

    def test_impressions_come_from_standard_only(self, real_data):
        assert extract_metrics(real_data)["impressions"] == 606

    def test_product_page_views_exclude_detailed_and_retention(self, real_data):
        assert extract_metrics(real_data)["product_page_views"] == 35

    def test_downloads_are_no_longer_zero(self, real_data):
        assert extract_metrics(real_data)["app_units"] == 4

    def test_paid_conversion_is_no_longer_zero(self, real_data):
        assert extract_metrics(real_data)["paid_conversions"] == 1

    def test_download_rate_reflects_real_downloads(self, real_data):
        funnel = calculate_funnel(extract_metrics(real_data))
        assert funnel["download_rate"] == pytest.approx(4 / 35, abs=0.0001)


class TestExtractMetricsBySourceLongFormat:
    """The per-source breakdown must also handle long-format Event rows."""

    def test_groups_by_source_type_with_event_counts(self):
        from scripts.analytics.analyze_funnel import extract_metrics_by_source

        data = {
            "discovery": [
                {"Event": "Impression", "Counts": "30", "Source Type": "App Store search"},
                {"Event": "Impression", "Counts": "10", "Source Type": "App Store browse"},
                {"Event": "Page view", "Counts": "4", "Source Type": "App Store search"},
                {"Event": "Tap", "Counts": "1", "Source Type": "App Store browse"},
            ]
        }
        result = extract_metrics_by_source(data)
        assert result["App Store Search"]["impressions"] == 30
        assert result["App Store Search"]["product_page_views"] == 4
        assert result["App Store Browse"]["impressions"] == 10
        assert result["App Store Browse"].get("taps", 0) == 1


class TestExtractMetricsBySourceRouting:
    """The per-channel table needs the same report routing as the totals.

    Without it the 媒体別 breakdown double-counted impressions from the detailed
    report and showed 0 downloads for every channel, because downloads live
    under ``Download Type`` rather than ``Event``.
    """

    def test_downloads_are_attributed_to_their_source(self):
        from scripts.analytics.analyze_funnel import extract_metrics_by_source

        data = {
            "app_downloads_standard": [
                {"Download Type": "First-time download", "Counts": "3",
                 "Source Type": "App Store search"},
                {"Download Type": "First-time download", "Counts": "1",
                 "Source Type": "App Store browse"},
                {"Download Type": "Auto-update", "Counts": "50",
                 "Source Type": "App Store search"},
            ]
        }
        result = extract_metrics_by_source(data)
        assert result["App Store Search"]["app_units"] == 3
        assert result["App Store Browse"]["app_units"] == 1

    def test_detailed_report_is_excluded_from_per_source_totals(self):
        from scripts.analytics.analyze_funnel import extract_metrics_by_source

        data = {
            "app_store_discovery_and_engagement_standard": [
                {"Event": "Impression", "Counts": "594",
                 "Source Type": "App Store search"},
            ],
            "app_store_discovery_and_engagement_detailed": [
                {"Event": "Impression", "Counts": "410",
                 "Source Type": "App Store search"},
            ],
        }
        result = extract_metrics_by_source(data)
        assert result["App Store Search"]["impressions"] == 594

    def test_retention_messaging_does_not_create_a_source_bucket(self):
        from scripts.analytics.analyze_funnel import extract_metrics_by_source

        data = {
            "retention_messaging": [
                {"Event": "Page views", "Counts": "2"},
            ]
        }
        result = extract_metrics_by_source(data)
        assert all(
            b.get("product_page_views", 0) == 0 for b in result.values()
        ), result


class TestLoadTsvData:
    def test_loads_tsv_files(self, tmp_path):
        tsv = tmp_path / "test.tsv"
        tsv.write_text("col1\tcol2\nval1\tval2\n")
        data = load_tsv_data(tmp_path)
        assert "test" in data
        assert len(data["test"]) == 1
        assert data["test"][0]["col1"] == "val1"


class TestGenerateReport:
    def test_report_contains_key_sections(self):
        metrics = {
            "impressions": 10000, "product_page_views": 3000,
            "app_units": 1000, "sessions": 800, "active_devices": 500,
            "trial_starts": 200, "paid_conversions": 100,
            "cancellations": 10, "active_subscriptions": 200,
        }
        funnel = calculate_funnel(metrics)
        bottleneck = identify_bottleneck(funnel)
        report = generate_daily_report("2026-04-03", metrics, funnel, {}, bottleneck)

        assert "Rewire Daily Analytics" in report
        assert "Funnel Summary" in report
        assert "Bottleneck Analysis" in report
        assert "Improvement Actions" in report
        assert "10,000" in report  # impressions formatted
