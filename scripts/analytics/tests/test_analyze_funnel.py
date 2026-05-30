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
