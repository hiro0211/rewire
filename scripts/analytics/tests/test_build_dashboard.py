"""Tests for the dashboard CLI orchestration."""
from datetime import date
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from scripts.analytics.bq_cohort import Cohort
from scripts.analytics.build_dashboard import output_path, run


TODAY = date(2026, 8, 8)


def _cohort(*device_ids):
    """A real Cohort, not a MagicMock: the renderer compares `.size` to an int,
    so a loose mock would hide a genuine type error."""
    return Cohort(key="purchaser", label="課金完了者", device_ids=list(device_ids))


def _config(has_firebase=True):
    cfg = MagicMock()
    cfg.has_firebase = has_firebase
    cfg.google_application_credentials = "/tmp/sa.json"
    return cfg


class TestOutputPath:
    def test_filename_carries_the_date_and_cohort(self):
        """日付ごとに残るので、過去の状態と比較できる。"""
        path = output_path(Path("/docs"), TODAY, "purchaser")

        assert path.name == "dashboard-purchaser-2026-08-08.html"


class TestRun:
    def test_missing_credentials_is_reported_not_crashed(self):
        with patch("scripts.analytics.build_dashboard.load_config", return_value=_config(False)):
            assert run(today=TODAY) == 2

    def test_unknown_cohort_is_rejected(self):
        """タイポでこっそり別のコホートを見てしまわないように。"""
        with patch("scripts.analytics.build_dashboard.load_config", return_value=_config()):
            assert run(cohort_key="nope", today=TODAY) == 2

    def test_dry_run_writes_nothing(self, tmp_path):
        with patch("scripts.analytics.build_dashboard.load_config", return_value=_config()), \
             patch("scripts.analytics.build_dashboard.build_client"), \
             patch("scripts.analytics.build_dashboard.fetch_cohort", return_value=_cohort()), \
             patch("scripts.analytics.build_dashboard.fetch_funnel", return_value=[]), \
             patch("scripts.analytics.build_dashboard.fetch_conversion_funnel", return_value=[]), \
             patch("scripts.analytics.build_dashboard.fetch_user_activity", return_value=[]):
            code = run(output_dir=tmp_path, dry_run=True, today=TODAY)

        assert code == 0 and list(tmp_path.iterdir()) == []

    def test_writes_the_html_file(self, tmp_path):
        with patch("scripts.analytics.build_dashboard.load_config", return_value=_config()), \
             patch("scripts.analytics.build_dashboard.build_client"), \
             patch("scripts.analytics.build_dashboard.fetch_cohort", return_value=_cohort()), \
             patch("scripts.analytics.build_dashboard.fetch_funnel", return_value=[]), \
             patch("scripts.analytics.build_dashboard.fetch_conversion_funnel", return_value=[]), \
             patch("scripts.analytics.build_dashboard.fetch_user_activity", return_value=[]):
            code = run(output_dir=tmp_path, today=TODAY)

        written = list(tmp_path.iterdir())
        assert code == 0 and len(written) == 1 and written[0].suffix == ".html"

    def test_a_bigquery_failure_returns_an_error_code(self, tmp_path):
        """権限切れ等で落ちたとき、空のダッシュボードを書いて成功を装わない。"""
        with patch("scripts.analytics.build_dashboard.load_config", return_value=_config()), \
             patch("scripts.analytics.build_dashboard.build_client"), \
             patch("scripts.analytics.build_dashboard.fetch_cohort",
                   side_effect=RuntimeError("403 Access Denied")):
            code = run(output_dir=tmp_path, today=TODAY)

        assert code == 1 and list(tmp_path.iterdir()) == []
