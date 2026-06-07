"""Tests for the unfiltered GA4 event scan (`fetch_all_events`).

Surfaces every event firing on a day (no REWIRE_KEY_EVENTS allowlist) so we can
spot instrumentation gaps and unexpected events. Mocks BetaAnalyticsDataClient.
"""
from datetime import date
from unittest.mock import MagicMock, patch

import pytest


def _row(dim_values, metric_values):
    row = MagicMock()
    row.dimension_values = [MagicMock(value=str(v)) for v in dim_values]
    row.metric_values = [MagicMock(value=str(v)) for v in metric_values]
    return row


def _all_events_response():
    """API returns rows already ordered by eventCount desc."""
    resp = MagicMock()
    resp.rows = [
        _row(["screen_view"], ["284", "8"]),
        _row(["session_start"], ["120", "8"]),
        _row(["first_open"], ["12", "12"]),
        _row(["paywall_viewed"], ["5", "1"]),
    ]
    return resp


@pytest.fixture
def patched_client(tmp_path):
    creds = tmp_path / "adc.json"
    creds.write_text("{}")
    fake_client = MagicMock()
    fake_client.run_report.return_value = _all_events_response()
    with patch(
        "scripts.analytics.firebase_ga4_client.load_credentials_from_file",
        return_value=(MagicMock(), "p"),
    ), patch(
        "scripts.analytics.firebase_ga4_client.BetaAnalyticsDataClient",
        return_value=fake_client,
    ):
        yield {"fake_client": fake_client, "credentials_path": str(creds)}


class TestFetchAllEvents:
    def test_raises_when_property_id_missing(self):
        from scripts.analytics.firebase_ga4_client import fetch_all_events

        with pytest.raises(ValueError):
            fetch_all_events("", "/tmp/x.json", date(2026, 6, 4))

    def test_raises_when_credentials_missing(self):
        from scripts.analytics.firebase_ga4_client import fetch_all_events

        with pytest.raises(ValueError):
            fetch_all_events("123", "", date(2026, 6, 4))

    def test_returns_all_rows_as_name_count_users(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_all_events

        out = fetch_all_events(
            "123456789", patched_client["credentials_path"], date(2026, 6, 4)
        )
        assert out[0] == {"name": "screen_view", "count": 284, "users": 8}
        assert {e["name"] for e in out} == {
            "screen_view",
            "session_start",
            "first_open",
            "paywall_viewed",
        }

    def test_preserves_descending_count_order(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_all_events

        out = fetch_all_events(
            "123", patched_client["credentials_path"], date(2026, 6, 4)
        )
        counts = [e["count"] for e in out]
        assert counts == sorted(counts, reverse=True)

    def test_request_has_no_event_name_allowlist_filter(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_all_events

        fetch_all_events("123", patched_client["credentials_path"], date(2026, 6, 4))
        req = patched_client["fake_client"].run_report.call_args.kwargs.get(
            "request"
        ) or patched_client["fake_client"].run_report.call_args.args[0]
        # Unfiltered: no InListFilter on eventName.
        assert "InListFilter" not in str(req)
        assert "eventName" in str(req)

    def test_runtime_error_when_sdk_raises(self, patched_client):
        from scripts.analytics.firebase_ga4_client import fetch_all_events

        patched_client["fake_client"].run_report.side_effect = Exception(
            "403 PERMISSION_DENIED"
        )
        with pytest.raises(RuntimeError) as exc:
            fetch_all_events("123", patched_client["credentials_path"], date(2026, 6, 4))
        assert "GA4" in str(exc.value)
