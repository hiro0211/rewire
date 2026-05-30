"""Tests for the send_daily orchestration entry point."""
import json
from datetime import date
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from scripts.analytics.config import AnalyticsConfig
from scripts.analytics.data_loader import LatestMetrics


def _config(**overrides) -> AnalyticsConfig:
    defaults = dict(
        resend_api_key="re_test",
        resend_from="Test <t@e.com>",
        report_to_email="me@e.com",
        claude_cmd="claude",
        report_timezone="Asia/Tokyo",
        revenuecat_api_key=None,
        revenuecat_project_id=None,
    )
    defaults.update(overrides)
    return AnalyticsConfig(**defaults)


def _latest(tmp_path, value=10) -> LatestMetrics:
    p = tmp_path / "daily-metrics-2026-05-23-corrected.json"
    payload = {"date": "2026-05-23", "metrics": {"impressions": value}}
    p.write_text(json.dumps(payload))
    return LatestMetrics(date=date(2026, 5, 23), metrics=payload, source_path=p)


class TestSendDailyOrchestration:
    """End-to-end orchestration: load → generate → email."""

    def test_dry_run_does_not_call_send(self, tmp_path):
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        with patch.object(send_daily, "load_config", return_value=_config()), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(send_daily, "generate_report", return_value="# Markdown body"), \
             patch.object(send_daily, "send_email") as mock_send:
            exit_code = send_daily.run(dry_run=True, analytics_dir=tmp_path)
        assert exit_code == 0
        mock_send.assert_not_called()

    def test_real_send_calls_resend_with_config_values(self, tmp_path):
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        cfg = _config(
            resend_api_key="re_real",
            resend_from="Rewire <onboarding@resend.dev>",
            report_to_email="arimura.hiroaki40@gmail.com",
        )
        with patch.object(send_daily, "load_config", return_value=cfg), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(send_daily, "generate_report", return_value="# Body"), \
             patch.object(send_daily, "send_email", return_value="msg-1") as mock_send:
            exit_code = send_daily.run(dry_run=False, analytics_dir=tmp_path)
        assert exit_code == 0
        kwargs = mock_send.call_args.kwargs
        assert kwargs["api_key"] == "re_real"
        assert kwargs["recipient"] == "arimura.hiroaki40@gmail.com"
        assert kwargs["sender"] == "Rewire <onboarding@resend.dev>"
        assert "2026-05-23" in kwargs["subject"]
        assert kwargs["markdown_body"] == "# Body"

    def test_exits_with_nonzero_when_no_metrics_available(self, tmp_path):
        from scripts.analytics import send_daily

        with patch.object(send_daily, "load_config", return_value=_config()), \
             patch.object(
                 send_daily, "find_latest_metrics",
                 side_effect=FileNotFoundError("no metrics"),
             ):
            exit_code = send_daily.run(dry_run=False, analytics_dir=tmp_path)
        assert exit_code != 0

    def test_passes_existing_report_to_generator_when_present(self, tmp_path):
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        with patch.object(send_daily, "load_config", return_value=_config()), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value="# prior"), \
             patch.object(send_daily, "generate_report", return_value="# new") as mock_gen, \
             patch.object(send_daily, "send_email", return_value="msg"):
            send_daily.run(dry_run=False, analytics_dir=tmp_path)
        kwargs = mock_gen.call_args.kwargs
        assert kwargs["existing_report"] == "# prior"

    def test_skips_revenuecat_when_not_configured(self, tmp_path):
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        with patch.object(send_daily, "load_config", return_value=_config()), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(send_daily, "fetch_overview") as mock_rc, \
             patch.object(send_daily, "generate_report", return_value="# Body") as mock_gen, \
             patch.object(send_daily, "send_email", return_value="msg"):
            send_daily.run(dry_run=False, analytics_dir=tmp_path)
        # RevenueCat fetcher must not run when keys are absent
        mock_rc.assert_not_called()
        # Generator receives ASC-only payload
        passed = mock_gen.call_args.kwargs["metrics"]
        assert "asc" in passed
        assert "revenuecat" not in passed

    def test_calls_revenuecat_and_merges_into_payload_when_configured(self, tmp_path):
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        cfg = _config(
            revenuecat_api_key="sk_real",
            revenuecat_project_id="projcb6956cd",
        )
        rc_overview = {
            "mrr": {"value": 4, "unit": "$", "period": "P28D", "name": "MRR"},
            "active_subscriptions": {
                "value": 1, "unit": "#", "period": "P0D", "name": "Active Subscriptions",
            },
        }
        with patch.object(send_daily, "load_config", return_value=cfg), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(send_daily, "fetch_overview", return_value=rc_overview) as mock_rc, \
             patch.object(send_daily, "generate_report", return_value="# Body") as mock_gen, \
             patch.object(send_daily, "send_email", return_value="msg"):
            send_daily.run(dry_run=False, analytics_dir=tmp_path)
        mock_rc.assert_called_once_with(api_key="sk_real", project_id="projcb6956cd")
        passed = mock_gen.call_args.kwargs["metrics"]
        assert passed["revenuecat"]["mrr"]["value"] == 4

    def test_continues_when_revenuecat_fetch_fails(self, tmp_path):
        # A flaky RevenueCat must not block the daily email — fall back to
        # ASC-only so hiro still hears about the App Store funnel.
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        cfg = _config(
            revenuecat_api_key="sk_real",
            revenuecat_project_id="projcb6956cd",
        )
        with patch.object(send_daily, "load_config", return_value=cfg), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(
                 send_daily, "fetch_overview",
                 side_effect=RuntimeError("500 server error"),
             ), \
             patch.object(send_daily, "generate_report", return_value="# Body") as mock_gen, \
             patch.object(send_daily, "send_email", return_value="msg"):
            exit_code = send_daily.run(dry_run=False, analytics_dir=tmp_path)
        assert exit_code == 0
        passed = mock_gen.call_args.kwargs["metrics"]
        # Failure should be visible to Claude as an explicit error marker so
        # it can call out the gap in the report.
        assert "revenuecat_error" in passed
