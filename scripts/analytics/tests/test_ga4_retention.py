"""Tests for GA4 cohort-retention fetching (D1/D7/D30).

Kept separate from `fetch_ga4_snapshot` because retention uses a different
report shape (a CohortSpec request) and must fail independently of the daily
snapshot — a flaky cohort call should never take down the basics/events table.

We mock `BetaAnalyticsDataClient` so tests run without network or credentials.
"""
from datetime import date
from unittest.mock import MagicMock, patch

import pytest


def _row(dim_values, metric_values):
    """Build a fake GA4 row matching the BetaAnalyticsDataClient response shape."""
    row = MagicMock()
    row.dimension_values = [MagicMock(value=str(v)) for v in dim_values]
    row.metric_values = [MagicMock(value=str(v)) for v in metric_values]
    return row


def _retention_response():
    """Cohort report rows: dims = (cohort, cohortNthDay), metric = cohortActiveUsers.

    Single aggregated cohort of 57 first-session users with a decaying
    active-user curve over the nth-day offsets.
    """
    resp = MagicMock()
    resp.rows = [
        _row(["cohort_all", "0"], ["57"]),   # cohort size (day 0)
        _row(["cohort_all", "1"], ["14"]),   # D1
        _row(["cohort_all", "2"], ["9"]),
        _row(["cohort_all", "7"], ["5"]),    # D7
        _row(["cohort_all", "30"], ["2"]),   # D30
    ]
    return resp


@pytest.fixture
def patched_client(tmp_path):
    """Mock the credentials loader + BetaAnalyticsDataClient for one run_report."""
    creds = tmp_path / "adc.json"
    creds.write_text('{"type": "authorized_user"}')

    fake_client = MagicMock()
    fake_client.run_report.return_value = _retention_response()

    with patch(
        "scripts.analytics.firebase_ga4_client.load_credentials_from_file"
    ) as mock_creds, patch(
        "scripts.analytics.firebase_ga4_client.BetaAnalyticsDataClient",
        return_value=fake_client,
    ):
        mock_creds.return_value = (MagicMock(), "fake-project")
        yield {"fake_client": fake_client, "credentials_path": str(creds)}


class TestFetchGa4Retention:
    def test_raises_when_property_id_missing(self):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_retention

        with pytest.raises(ValueError):
            fetch_ga4_retention(
                property_id="",
                credentials_path="/tmp/x.json",
                end_date=date(2026, 6, 4),
            )

    def test_raises_when_credentials_path_missing(self):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_retention

        with pytest.raises(ValueError):
            fetch_ga4_retention(
                property_id="123",
                credentials_path="",
                end_date=date(2026, 6, 4),
            )

    def test_request_uses_cohort_spec_and_properties_prefix(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_retention

        fetch_ga4_retention(
            property_id="123456789",
            credentials_path=patched_client["credentials_path"],
            end_date=date(2026, 6, 4),
        )
        req = patched_client["fake_client"].run_report.call_args.kwargs.get(
            "request"
        ) or patched_client["fake_client"].run_report.call_args.args[0]
        assert req.property == "properties/123456789"
        # CohortSpec must be set with a firstSessionDate cohort.
        request_str = str(req)
        assert "firstSessionDate" in request_str
        assert "cohortActiveUsers" in request_str

    def test_cohort_name_does_not_use_reserved_prefix(self):
        # GA4 rejects cohort names beginning with "cohort_" (real-API 400).
        from datetime import date as _date

        from scripts.analytics.firebase_ga4_client import _build_retention_request

        req = _build_retention_request("123", _date(2026, 6, 4), 28, 30)
        name = req.cohort_spec.cohorts[0].name
        assert name and not name.startswith("cohort_")

    def test_parses_d1_d7_d30_retention(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_retention

        out = fetch_ga4_retention(
            property_id="123456789",
            credentials_path=patched_client["credentials_path"],
            end_date=date(2026, 6, 4),
        )
        # 14/57, 5/57, 2/57
        assert out["retention"][1] == pytest.approx(0.2456, abs=0.0001)
        assert out["retention"][7] == pytest.approx(0.0877, abs=0.0001)
        assert out["retention"][30] == pytest.approx(0.0351, abs=0.0001)

    def test_cohort_size_is_day_zero_active_users(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_retention

        out = fetch_ga4_retention(
            property_id="123456789",
            credentials_path=patched_client["credentials_path"],
            end_date=date(2026, 6, 4),
        )
        assert out["cohort_size"] == 57
        assert out["active_by_day"][1] == 14

    def test_retention_is_none_when_cohort_empty(self, tmp_path):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_retention

        creds = tmp_path / "adc.json"
        creds.write_text("{}")
        empty = MagicMock()
        empty.rows = []
        fake_client = MagicMock()
        fake_client.run_report.return_value = empty
        with patch(
            "scripts.analytics.firebase_ga4_client.load_credentials_from_file",
            return_value=(MagicMock(), "p"),
        ), patch(
            "scripts.analytics.firebase_ga4_client.BetaAnalyticsDataClient",
            return_value=fake_client,
        ):
            out = fetch_ga4_retention(
                property_id="123",
                credentials_path=str(creds),
                end_date=date(2026, 6, 4),
            )
        assert out["cohort_size"] == 0
        assert out["retention"][1] is None
        assert out["retention"][7] is None
        assert out["retention"][30] is None

    def test_runtime_error_when_sdk_raises(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_retention

        patched_client["fake_client"].run_report.side_effect = Exception(
            "403 PERMISSION_DENIED"
        )
        with pytest.raises(RuntimeError) as exc:
            fetch_ga4_retention(
                property_id="123",
                credentials_path=patched_client["credentials_path"],
                end_date=date(2026, 6, 4),
            )
        assert "GA4" in str(exc.value)
        assert "PERMISSION_DENIED" in str(exc.value)

    def test_includes_fetched_at_iso_string(self, patched_client):
        from datetime import datetime

        from scripts.analytics.firebase_ga4_client import fetch_ga4_retention

        out = fetch_ga4_retention(
            property_id="123",
            credentials_path=patched_client["credentials_path"],
            end_date=date(2026, 6, 4),
        )
        datetime.fromisoformat(out["fetched_at"].replace("Z", "+00:00"))


class TestSummarizeRetention:
    def test_formats_percentages_with_cohort_size(self):
        from scripts.analytics.firebase_ga4_client import summarize_retention

        out = summarize_retention({
            "cohort_size": 57,
            "retention": {1: 0.2456, 7: 0.0877, 30: 0.0351},
        })
        assert out["d1"] == "24.6%"
        assert out["d7"] == "8.8%"
        assert out["d30"] == "3.5%"
        assert out["cohort_size"] == "57"

    def test_handles_none_retention(self):
        from scripts.analytics.firebase_ga4_client import summarize_retention

        out = summarize_retention({
            "cohort_size": 0,
            "retention": {1: None, 7: None, 30: None},
        })
        assert out["d1"] == "N/A"
        assert out["d7"] == "N/A"
        assert out["d30"] == "N/A"
