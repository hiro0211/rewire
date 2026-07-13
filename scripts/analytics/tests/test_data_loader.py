"""Tests for the daily metrics + report loader."""
import json
from datetime import date

import pytest


class TestFindLatestMetrics:
    """Selects the most recent metrics JSON, preferring -corrected suffix."""

    def _write_metrics(self, dir_path, date_str: str, value: int, corrected: bool = False):
        suffix = "-corrected" if corrected else ""
        path = dir_path / f"daily-metrics-{date_str}{suffix}.json"
        path.write_text(json.dumps({"date": date_str, "metrics": {"impressions": value}}))

    def test_returns_latest_date(self, tmp_path):
        from scripts.analytics.data_loader import find_latest_metrics

        self._write_metrics(tmp_path, "2026-05-20", 100)
        self._write_metrics(tmp_path, "2026-05-23", 300)
        self._write_metrics(tmp_path, "2026-05-22", 200)

        latest = find_latest_metrics(tmp_path)
        assert latest.date == date(2026, 5, 23)
        assert latest.metrics["metrics"]["impressions"] == 300

    def test_prefers_corrected_when_both_exist(self, tmp_path):
        from scripts.analytics.data_loader import find_latest_metrics

        self._write_metrics(tmp_path, "2026-05-23", 0)            # broken base
        self._write_metrics(tmp_path, "2026-05-23", 999, corrected=True)

        latest = find_latest_metrics(tmp_path)
        assert latest.metrics["metrics"]["impressions"] == 999
        assert latest.source_path.name == "daily-metrics-2026-05-23-corrected.json"

    def test_corrected_only_picked_when_present(self, tmp_path):
        from scripts.analytics.data_loader import find_latest_metrics

        self._write_metrics(tmp_path, "2026-05-22", 222)
        self._write_metrics(tmp_path, "2026-05-23", 0)
        self._write_metrics(tmp_path, "2026-05-23", 333, corrected=True)

        latest = find_latest_metrics(tmp_path)
        assert latest.date == date(2026, 5, 23)
        assert latest.metrics["metrics"]["impressions"] == 333

    def test_raises_when_no_metrics_found(self, tmp_path):
        from scripts.analytics.data_loader import find_latest_metrics
        import pytest

        with pytest.raises(FileNotFoundError):
            find_latest_metrics(tmp_path)

    def test_ignores_unrelated_json_files(self, tmp_path):
        from scripts.analytics.data_loader import find_latest_metrics

        (tmp_path / "totally-unrelated.json").write_text("{}")
        self._write_metrics(tmp_path, "2026-05-23", 1)

        latest = find_latest_metrics(tmp_path)
        assert latest.date == date(2026, 5, 23)


class TestFindMatchingReport:
    """Loads the Markdown report for a given date, preferring -corrected."""

    def test_returns_corrected_when_present(self, tmp_path):
        from scripts.analytics.data_loader import find_matching_report

        (tmp_path / "daily-report-2026-05-23.md").write_text("# broken")
        (tmp_path / "daily-report-2026-05-23-corrected.md").write_text("# real")

        report = find_matching_report(tmp_path, date(2026, 5, 23))
        assert report == "# real"

    def test_falls_back_to_base_when_no_corrected(self, tmp_path):
        from scripts.analytics.data_loader import find_matching_report

        (tmp_path / "daily-report-2026-05-23.md").write_text("# base")

        report = find_matching_report(tmp_path, date(2026, 5, 23))
        assert report == "# base"

    def test_returns_none_when_no_report(self, tmp_path):
        from scripts.analytics.data_loader import find_matching_report

        report = find_matching_report(tmp_path, date(2026, 5, 23))
        assert report is None


class TestFindMetricsForDate:
    """Loads a specific day's metrics JSON, preferring the -corrected variant."""

    def test_loads_the_requested_date(self, tmp_path):
        from scripts.analytics.data_loader import find_metrics_for_date

        (tmp_path / "daily-metrics-2026-07-10.json").write_text(
            json.dumps({"date": "2026-07-10", "metrics": {"impressions": 119}}))
        result = find_metrics_for_date(tmp_path, date(2026, 7, 10))
        assert result.date == date(2026, 7, 10)
        assert result.metrics["metrics"]["impressions"] == 119

    def test_prefers_corrected_variant(self, tmp_path):
        from scripts.analytics.data_loader import find_metrics_for_date

        (tmp_path / "daily-metrics-2026-07-10.json").write_text(
            json.dumps({"date": "2026-07-10", "metrics": {"impressions": 1}}))
        (tmp_path / "daily-metrics-2026-07-10-corrected.json").write_text(
            json.dumps({"date": "2026-07-10", "metrics": {"impressions": 119}}))
        result = find_metrics_for_date(tmp_path, date(2026, 7, 10))
        assert result.metrics["metrics"]["impressions"] == 119

    def test_raises_when_absent(self, tmp_path):
        from scripts.analytics.data_loader import find_metrics_for_date

        with pytest.raises(FileNotFoundError):
            find_metrics_for_date(tmp_path, date(2026, 7, 10))
