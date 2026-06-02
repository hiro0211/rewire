"""Tests for the Firebase / GA4 Data API client.

We mock `BetaAnalyticsDataClient` so tests run without network or service
account credentials. Each test corresponds to one of the three RunReport
calls executed by `fetch_ga4_snapshot`.
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


def _basics_response():
    """Mimic the response to the basic-metrics report:
    7 days × (activeUsers, newUsers, sessions, averageSessionDuration, screenPageViews)."""
    resp = MagicMock()
    # date row format YYYYMMDD descending; the last entry is the most recent day.
    resp.rows = [
        _row(["20260524"], ["60", "10", "100", "120.0", "150"]),  # prior week
        _row(["20260525"], ["62", "9", "105", "118.0", "155"]),
        _row(["20260526"], ["65", "11", "110", "115.0", "160"]),
        _row(["20260527"], ["70", "12", "120", "130.0", "170"]),
        _row(["20260528"], ["72", "8", "115", "125.0", "165"]),
        _row(["20260529"], ["71", "10", "118", "122.0", "168"]),
        _row(["20260530"], ["67", "12", "112", "128.0", "162"]),  # target_date
    ]
    return resp


def _events_response():
    resp = MagicMock()
    resp.rows = [
        _row(["paywall_viewed"], ["23", "19"]),
        _row(["pro_purchase_completed"], ["1", "1"]),
        _row(["breathing_started"], ["48", "32"]),
        _row(["breathing_completed"], ["31", "27"]),
        _row(["panic_button_tapped"], ["12", "9"]),
    ]
    return resp


def _screens_response():
    resp = MagicMock()
    resp.rows = [
        _row(["dashboard"], ["230", "4520"]),
        _row(["breathing"], ["88", "1240"]),
        _row(["onboarding/benefits"], ["50", "300"]),
    ]
    return resp


@pytest.fixture
def patched_client(tmp_path):
    """Provide a mock BetaAnalyticsDataClient + credentials file.

    The credentials loader is patched at `load_credentials_from_file` so that
    both Service Account JSON and Application Default Credentials (user OAuth)
    JSON are supported without touching the loader call site.
    """
    sa = tmp_path / "ga4-sa.json"
    sa.write_text('{"type": "service_account"}')

    fake_client = MagicMock()
    fake_client.run_report.side_effect = [
        _basics_response(),
        _events_response(),
        _screens_response(),
    ]

    with patch(
        "scripts.analytics.firebase_ga4_client.load_credentials_from_file"
    ) as mock_creds, patch(
        "scripts.analytics.firebase_ga4_client.BetaAnalyticsDataClient",
        return_value=fake_client,
    ) as mock_client_cls:
        mock_creds.return_value = (MagicMock(), "fake-project")
        yield {
            "fake_client": fake_client,
            "mock_client_cls": mock_client_cls,
            "mock_creds": mock_creds,
            "credentials_path": str(sa),
        }


class TestFetchGa4Snapshot:
    def test_raises_when_property_id_missing(self):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_snapshot

        with pytest.raises(ValueError):
            fetch_ga4_snapshot(
                property_id="",
                credentials_path="/tmp/x.json",
                target_date=date(2026, 5, 30),
            )

    def test_raises_when_credentials_path_missing(self):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_snapshot

        with pytest.raises(ValueError):
            fetch_ga4_snapshot(
                property_id="123",
                credentials_path="",
                target_date=date(2026, 5, 30),
            )

    def test_passes_credentials_to_sdk(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_snapshot

        fetch_ga4_snapshot(
            property_id="123456789",
            credentials_path=patched_client["credentials_path"],
            target_date=date(2026, 5, 30),
        )
        # load_credentials_from_file is called with the path plus the
        # analytics.readonly scope so user OAuth ADC tokens carry that scope too.
        call = patched_client["mock_creds"].call_args
        assert call.args[0] == patched_client["credentials_path"]
        assert "https://www.googleapis.com/auth/analytics.readonly" in call.kwargs.get(
            "scopes", []
        )

    def test_invokes_three_run_report_calls(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_snapshot

        fetch_ga4_snapshot(
            property_id="123456789",
            credentials_path=patched_client["credentials_path"],
            target_date=date(2026, 5, 30),
        )
        assert patched_client["fake_client"].run_report.call_count == 3

    def test_uses_properties_prefix_in_property_field(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_snapshot

        fetch_ga4_snapshot(
            property_id="123456789",
            credentials_path=patched_client["credentials_path"],
            target_date=date(2026, 5, 30),
        )
        # The first call's request.property must be the GA4-standard prefixed form.
        first_request = patched_client["fake_client"].run_report.call_args_list[0].kwargs.get(
            "request"
        ) or patched_client["fake_client"].run_report.call_args_list[0].args[0]
        assert first_request.property == "properties/123456789"

    def test_basics_section_yesterday_versus_prior_week_avg(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_snapshot

        snap = fetch_ga4_snapshot(
            property_id="123456789",
            credentials_path=patched_client["credentials_path"],
            target_date=date(2026, 5, 30),
        )
        # target date row was activeUsers=67.
        assert snap["basics"]["active_users"]["yesterday"] == 67
        # Prior 6 days: 60,62,65,70,72,71 → avg 66.67 → round to 2dp.
        assert snap["basics"]["active_users"]["prior_week_avg"] == pytest.approx(66.67, abs=0.01)
        # New users target day = 12, prior 6-day avg = (10+9+11+12+8+10)/6 = 10.0
        assert snap["basics"]["new_users"]["yesterday"] == 12
        assert snap["basics"]["new_users"]["prior_week_avg"] == pytest.approx(10.0, abs=0.01)

    def test_events_keyed_by_event_name(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_snapshot

        snap = fetch_ga4_snapshot(
            property_id="123456789",
            credentials_path=patched_client["credentials_path"],
            target_date=date(2026, 5, 30),
        )
        assert snap["events"]["paywall_viewed"] == {"count": 23, "users": 19}
        assert snap["events"]["pro_purchase_completed"] == {"count": 1, "users": 1}
        assert snap["events"]["breathing_completed"] == {"count": 31, "users": 27}

    def test_events_dimension_filter_applies_to_rewire_event_list(self, patched_client):
        """The events report must restrict eventName to the configured allowlist
        so we don't pay for irrelevant rows (and so the table stays focused)."""
        from scripts.analytics.firebase_ga4_client import (
            REWIRE_KEY_EVENTS,
            fetch_ga4_snapshot,
        )

        fetch_ga4_snapshot(
            property_id="123456789",
            credentials_path=patched_client["credentials_path"],
            target_date=date(2026, 5, 30),
        )
        # The 2nd call is the events report.
        second_request = patched_client["fake_client"].run_report.call_args_list[1].kwargs.get(
            "request"
        ) or patched_client["fake_client"].run_report.call_args_list[1].args[0]
        # The request must include a dimension filter on eventName limited to
        # REWIRE_KEY_EVENTS. We check the serialised form contains each name.
        request_str = str(second_request)
        for event in REWIRE_KEY_EVENTS:
            assert event in request_str

    def test_top_screens_returned_in_order(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_snapshot

        snap = fetch_ga4_snapshot(
            property_id="123456789",
            credentials_path=patched_client["credentials_path"],
            target_date=date(2026, 5, 30),
        )
        assert snap["top_screens"][0]["name"] == "dashboard"
        assert snap["top_screens"][0]["views"] == 230
        assert snap["top_screens"][0]["engagement_seconds"] == 4520

    def test_includes_fetched_at_iso_string(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_snapshot

        snap = fetch_ga4_snapshot(
            property_id="123456789",
            credentials_path=patched_client["credentials_path"],
            target_date=date(2026, 5, 30),
        )
        assert "fetched_at" in snap
        # Should be an ISO 8601 string we can parse.
        from datetime import datetime
        datetime.fromisoformat(snap["fetched_at"].replace("Z", "+00:00"))

    def test_runtime_error_when_sdk_raises(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_ga4_snapshot

        patched_client["fake_client"].run_report.side_effect = Exception("403 PERMISSION_DENIED")

        with pytest.raises(RuntimeError) as exc:
            fetch_ga4_snapshot(
                property_id="123456789",
                credentials_path=patched_client["credentials_path"],
                target_date=date(2026, 5, 30),
            )
        assert "GA4" in str(exc.value)
        assert "PERMISSION_DENIED" in str(exc.value)


class TestSummarizeGa4:
    def test_summary_includes_wow_delta_for_active_users(self):
        from scripts.analytics.firebase_ga4_client import summarize_ga4

        snapshot = {
            "basics": {
                "active_users": {"yesterday": 70, "prior_week_avg": 60.0},
                "new_users": {"yesterday": 10, "prior_week_avg": 10.0},
                "sessions": {"yesterday": 100, "prior_week_avg": 100.0},
                "avg_session_duration_seconds": 120.0,
            },
            "events": {
                "paywall_viewed": {"count": 20, "users": 18},
                "pro_purchase_completed": {"count": 2, "users": 2},
            },
            "top_screens": [],
        }
        out = summarize_ga4(snapshot)
        assert out["active_users"] == "70 (+16.7% vs 7d avg)"
        assert out["new_users"] == "10 (flat vs 7d avg)"

    def test_summary_includes_paywall_cvr_when_both_events_present(self):
        from scripts.analytics.firebase_ga4_client import summarize_ga4

        out = summarize_ga4({
            "basics": {},
            "events": {
                "paywall_viewed": {"count": 20, "users": 20},
                "pro_purchase_completed": {"count": 2, "users": 2},
            },
            "top_screens": [],
        })
        assert out["paywall_cvr"] == "10.0%"

    def test_summary_omits_paywall_cvr_when_views_zero(self):
        from scripts.analytics.firebase_ga4_client import summarize_ga4

        out = summarize_ga4({
            "basics": {},
            "events": {"paywall_viewed": {"count": 0, "users": 0}},
            "top_screens": [],
        })
        assert "paywall_cvr" not in out

    def test_summary_handles_empty_snapshot(self):
        from scripts.analytics.firebase_ga4_client import summarize_ga4

        assert summarize_ga4({"basics": {}, "events": {}, "top_screens": []}) == {}
