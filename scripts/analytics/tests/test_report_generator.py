"""Tests for the Claude-driven report generator (subprocess-based)."""
import json
from datetime import date
from unittest.mock import MagicMock, patch

import pytest


SAMPLE_METRICS = {
    "date": "2026-05-23",
    "metrics": {
        "impressions": 100,
        "product_page_views": 30,
        "app_units": 10,
        "trial_starts": 5,
        "paid_conversions": 2,
        "cancellations": 1,
        "active_subscriptions": 25,
    },
    "funnel": {
        "page_view_rate": 0.3,
        "download_rate": 0.33,
        "trial_start_rate": 0.5,
        "trial_to_paid_rate": 0.4,
        "monthly_churn_rate": 0.04,
    },
}


def _completed_proc(stdout: str = "# Report\n\nSummary", returncode: int = 0):
    proc = MagicMock()
    proc.stdout = stdout
    proc.stderr = ""
    proc.returncode = returncode
    return proc


class TestBuildPrompt:
    """Tests for the prompt builder (pure function, no subprocess)."""

    def test_includes_target_date(self):
        from scripts.analytics.report_generator import build_prompt

        prompt = build_prompt(date(2026, 5, 23), SAMPLE_METRICS, existing_report=None)
        assert "2026-05-23" in prompt

    def test_embeds_metrics_json(self):
        from scripts.analytics.report_generator import build_prompt

        prompt = build_prompt(date(2026, 5, 23), SAMPLE_METRICS, existing_report=None)
        # JSON values should appear in the prompt body
        assert '"impressions": 100' in prompt
        assert '"trial_to_paid_rate": 0.4' in prompt

    def test_includes_existing_report_when_provided(self):
        from scripts.analytics.report_generator import build_prompt

        prompt = build_prompt(
            date(2026, 5, 23), SAMPLE_METRICS, existing_report="# old report\nbody"
        )
        assert "old report" in prompt

    def test_requests_markdown_output(self):
        from scripts.analytics.report_generator import build_prompt

        prompt = build_prompt(date(2026, 5, 23), SAMPLE_METRICS, existing_report=None)
        assert "Markdown" in prompt or "markdown" in prompt


class TestGenerateReport:
    """Tests for the subprocess invocation of `claude -p`."""

    def test_invokes_claude_cli_with_print_flag(self):
        from scripts.analytics.report_generator import generate_report

        with patch("subprocess.run", return_value=_completed_proc()) as mock_run:
            generate_report(
                claude_cmd="claude",
                target_date=date(2026, 5, 23),
                metrics=SAMPLE_METRICS,
                existing_report=None,
            )
        args = mock_run.call_args[0][0]
        assert args[0] == "claude"
        assert "-p" in args or "--print" in args

    def test_returns_stdout_markdown(self):
        from scripts.analytics.report_generator import generate_report

        with patch("subprocess.run", return_value=_completed_proc("# Daily\n\nbody")):
            result = generate_report(
                claude_cmd="claude",
                target_date=date(2026, 5, 23),
                metrics=SAMPLE_METRICS,
                existing_report=None,
            )
        assert result.startswith("# Daily")

    def test_passes_prompt_via_stdin(self):
        from scripts.analytics.report_generator import generate_report

        with patch("subprocess.run", return_value=_completed_proc()) as mock_run:
            generate_report(
                claude_cmd="claude",
                target_date=date(2026, 5, 23),
                metrics=SAMPLE_METRICS,
                existing_report=None,
            )
        stdin = mock_run.call_args.kwargs.get("input", "")
        assert "2026-05-23" in stdin
        assert '"impressions": 100' in stdin

    def test_raises_on_non_zero_exit(self):
        from scripts.analytics.report_generator import generate_report

        with patch("subprocess.run", return_value=_completed_proc("", returncode=2)):
            with pytest.raises(RuntimeError) as exc:
                generate_report(
                    claude_cmd="claude",
                    target_date=date(2026, 5, 23),
                    metrics=SAMPLE_METRICS,
                    existing_report=None,
                )
        assert "claude" in str(exc.value).lower()

    def test_supports_custom_claude_path(self):
        from scripts.analytics.report_generator import generate_report

        with patch("subprocess.run", return_value=_completed_proc()) as mock_run:
            generate_report(
                claude_cmd="/Users/x/.local/bin/claude",
                target_date=date(2026, 5, 23),
                metrics=SAMPLE_METRICS,
                existing_report=None,
            )
        args = mock_run.call_args[0][0]
        assert args[0] == "/Users/x/.local/bin/claude"
