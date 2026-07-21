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
        ga4_property_id=None,
        google_application_credentials=None,
    )
    defaults.update(overrides)
    return AnalyticsConfig(**defaults)


def _firebase_config(tmp_path, **overrides) -> AnalyticsConfig:
    sa = tmp_path / "ga4-sa.json"
    sa.write_text('{"type":"service_account"}')
    return _config(
        ga4_property_id="123456789",
        google_application_credentials=str(sa),
        **overrides,
    )


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

    def test_passes_gmail_friendly_html_body_to_send_email(self, tmp_path):
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        with patch.object(send_daily, "load_config", return_value=_config()), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(send_daily, "generate_report", return_value="# Body"), \
             patch.object(send_daily, "send_email", return_value="msg") as mock_send:
            send_daily.run(dry_run=False, analytics_dir=tmp_path)
        html_body = mock_send.call_args.kwargs["html_body"]
        assert html_body.lstrip().startswith("<!DOCTYPE html>")
        assert "<table" in html_body
        assert "<pre>" not in html_body            # the old unreadable dump is gone
        # Focusity-mirrored deterministic table structure.
        assert "今日の要点" in html_body
        assert "App Store 取得" in html_body
        assert "用語集" in html_body

    def test_llm_narrative_flows_through_to_html_body(self, tmp_path):
        # The Claude-written 横断分析/改善提案 narrative ("data that was always
        # in the email") must reach the HTML, on top of the deterministic tables.
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        md = "## 横断分析\n\n- 何か気づき\n\n## 改善提案\n\n- **今日**: 施策\n"
        with patch.object(send_daily, "load_config", return_value=_config()), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(send_daily, "generate_report", return_value=md), \
             patch.object(send_daily, "send_email", return_value="msg") as mock_send:
            send_daily.run(dry_run=False, analytics_dir=tmp_path)
        html_body = mock_send.call_args.kwargs["html_body"]
        assert "横断分析" in html_body and "改善提案" in html_body
        assert "今日の要点" in html_body            # deterministic tables still present

    def test_date_flag_loads_that_specific_day(self, tmp_path):
        from scripts.analytics import send_daily

        (tmp_path / "daily-metrics-2026-07-10.json").write_text(
            json.dumps({"date": "2026-07-10", "metrics": {"impressions": 119}}))
        with patch.object(send_daily, "load_config", return_value=_config()), \
             patch.object(send_daily, "generate_report", return_value="# Body"), \
             patch.object(send_daily, "send_email", return_value="msg") as mock_send:
            exit_code = send_daily.run(
                dry_run=False, date_str="2026-07-10", analytics_dir=tmp_path)
        assert exit_code == 0
        assert "2026-07-10" in mock_send.call_args.kwargs["subject"]

    def test_dry_run_writes_html_preview(self, tmp_path):
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        with patch.object(send_daily, "load_config", return_value=_config()), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(send_daily, "generate_report", return_value="# Body"), \
             patch.object(send_daily, "send_email") as mock_send:
            send_daily.run(dry_run=True, analytics_dir=tmp_path)
        mock_send.assert_not_called()
        preview = tmp_path / "daily-report-2026-05-23.html"
        assert preview.is_file()
        assert "<!DOCTYPE html>" in preview.read_text(encoding="utf-8")

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

    def test_skips_firebase_when_not_configured(self, tmp_path):
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        with patch.object(send_daily, "load_config", return_value=_config()), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(send_daily, "fetch_ga4_snapshot") as mock_ga4, \
             patch.object(send_daily, "generate_report", return_value="# Body") as mock_gen, \
             patch.object(send_daily, "send_email", return_value="msg"):
            send_daily.run(dry_run=False, analytics_dir=tmp_path)
        mock_ga4.assert_not_called()
        passed = mock_gen.call_args.kwargs["metrics"]
        assert "firebase" not in passed
        assert "firebase_error" not in passed

    def test_calls_firebase_and_merges_into_payload_when_configured(self, tmp_path):
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        cfg = _firebase_config(tmp_path)
        ga4_snapshot = {
            "basics": {"active_users": {"yesterday": 67, "prior_week_avg": 65}},
            "events": {"paywall_viewed": {"count": 23, "users": 19}},
            "top_screens": [{"name": "dashboard", "views": 230, "engagement_seconds": 4520}],
            "fetched_at": "2026-05-31T08:00:00+00:00",
        }
        with patch.object(send_daily, "load_config", return_value=cfg), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(
                 send_daily, "fetch_ga4_snapshot", return_value=ga4_snapshot,
             ) as mock_ga4, \
             patch.object(send_daily, "generate_report", return_value="# Body") as mock_gen, \
             patch.object(send_daily, "send_email", return_value="msg"):
            send_daily.run(dry_run=False, analytics_dir=tmp_path)
        mock_ga4.assert_called_once()
        kwargs = mock_ga4.call_args.kwargs
        assert kwargs["property_id"] == "123456789"
        assert kwargs["credentials_path"] == cfg.google_application_credentials
        passed = mock_gen.call_args.kwargs["metrics"]
        assert passed["firebase"]["basics"]["active_users"]["yesterday"] == 67

    def test_enriches_firebase_with_retention_and_all_events(self, tmp_path):
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        cfg = _firebase_config(tmp_path)
        snapshot = {"basics": {}, "events": {}, "top_screens": []}
        retention_raw = {"retention": {1: 0.11, 7: 0.01, 30: None}, "cohort_size": 175}
        all_events = [{"name": "screen_view", "count": 210, "users": 3}]
        with patch.object(send_daily, "load_config", return_value=cfg), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(send_daily, "fetch_ga4_snapshot", return_value=snapshot), \
             patch.object(send_daily, "fetch_ga4_retention", return_value=retention_raw) as mock_ret, \
             patch.object(send_daily, "fetch_all_events", return_value=all_events) as mock_all, \
             patch.object(send_daily, "generate_report", return_value="# Body") as mock_gen, \
             patch.object(send_daily, "send_email", return_value="msg"):
            send_daily.run(dry_run=False, analytics_dir=tmp_path)
        mock_ret.assert_called_once()
        mock_all.assert_called_once()
        fb = mock_gen.call_args.kwargs["metrics"]["firebase"]
        assert fb["retention_summary"]["d1"] == "11.0%"
        assert fb["retention_summary"]["cohort_size"] == "175"
        assert fb["all_events"] == all_events

    def test_retention_failure_does_not_sink_the_whole_firebase_section(self, tmp_path):
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        cfg = _firebase_config(tmp_path)
        snapshot = {"basics": {}, "events": {}, "top_screens": []}
        with patch.object(send_daily, "load_config", return_value=cfg), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(send_daily, "fetch_ga4_snapshot", return_value=snapshot), \
             patch.object(send_daily, "fetch_ga4_retention",
                          side_effect=RuntimeError("cohort 500")), \
             patch.object(send_daily, "fetch_all_events", return_value=[]), \
             patch.object(send_daily, "generate_report", return_value="# Body") as mock_gen, \
             patch.object(send_daily, "send_email", return_value="msg"):
            exit_code = send_daily.run(dry_run=False, analytics_dir=tmp_path)
        assert exit_code == 0
        passed = mock_gen.call_args.kwargs["metrics"]
        assert "firebase" in passed                 # section still present
        assert "retention_summary" not in passed["firebase"]

    def test_firebase_target_date_aligns_with_asc_data_date(self, tmp_path):
        # The daily report describes a single day across all sources, so GA4
        # is fetched for the same calendar date as the ASC metrics file. ASC's
        # own ~5-day lag already pushes that date safely past GA4's 24-48h
        # standard-report lag.
        from scripts.analytics import send_daily
        from datetime import date

        latest = _latest(tmp_path)
        cfg = _firebase_config(tmp_path)
        with patch.object(send_daily, "load_config", return_value=cfg), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(send_daily, "fetch_ga4_snapshot", return_value={}) as mock_ga4, \
             patch.object(send_daily, "generate_report", return_value="# Body"), \
             patch.object(send_daily, "send_email", return_value="msg"):
            send_daily.run(dry_run=False, analytics_dir=tmp_path)
        assert mock_ga4.call_args.kwargs["target_date"] == date(2026, 5, 23)

    def test_continues_when_firebase_fetch_fails(self, tmp_path):
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        cfg = _firebase_config(tmp_path)
        with patch.object(send_daily, "load_config", return_value=cfg), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(
                 send_daily, "fetch_ga4_snapshot",
                 side_effect=RuntimeError("403 PERMISSION_DENIED"),
             ), \
             patch.object(send_daily, "generate_report", return_value="# Body") as mock_gen, \
             patch.object(send_daily, "send_email", return_value="msg"):
            exit_code = send_daily.run(dry_run=False, analytics_dir=tmp_path)
        assert exit_code == 0
        passed = mock_gen.call_args.kwargs["metrics"]
        assert "firebase_error" in passed
        assert "PERMISSION_DENIED" in passed["firebase_error"]

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


class TestStalenessPropagation:
    """The renderer can only warn about stale data if send_daily measures it."""

    def test_staleness_is_measured_against_today_and_passed_to_the_renderer(
        self, tmp_path
    ):
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)  # 2026-05-23
        with patch.object(send_daily, "load_config", return_value=_config()), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(send_daily, "generate_report", return_value="# body"), \
             patch.object(send_daily, "staleness_days", return_value=4), \
             patch.object(send_daily, "build_html", return_value="<html></html>") as mock_html:
            send_daily.run(dry_run=True, analytics_dir=tmp_path)

        payload = mock_html.call_args[0][0]
        assert payload["staleness_days"] == 4

    def test_stale_data_is_logged_as_a_warning(self, tmp_path, caplog):
        from scripts.analytics import send_daily

        latest = _latest(tmp_path)
        with patch.object(send_daily, "load_config", return_value=_config()), \
             patch.object(send_daily, "find_latest_metrics", return_value=latest), \
             patch.object(send_daily, "find_matching_report", return_value=None), \
             patch.object(send_daily, "generate_report", return_value="# body"), \
             patch.object(send_daily, "staleness_days", return_value=9):
            send_daily.run(dry_run=True, analytics_dir=tmp_path)

        assert any("stale" in r.message.lower() for r in caplog.records)
