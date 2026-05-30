"""Tests for the RevenueCat V2 API client."""
from unittest.mock import MagicMock, patch

import pytest


def _mock_response(status=200, body=None):
    resp = MagicMock()
    resp.status_code = status
    resp.ok = 200 <= status < 300
    resp.json.return_value = body or {}
    resp.text = "" if body is None else str(body)
    return resp


_SAMPLE_OVERVIEW = {
    "object": "overview_metrics",
    "metrics": [
        {
            "id": "active_trials", "name": "Active Trials", "value": 2,
            "unit": "#", "period": "P0D", "description": "In total",
        },
        {
            "id": "active_subscriptions", "name": "Active Subscriptions",
            "value": 1, "unit": "#", "period": "P0D",
        },
        {
            "id": "mrr", "name": "MRR", "value": 4, "unit": "$", "period": "P28D",
        },
    ],
}


class TestFetchOverview:
    """Snapshot endpoint: GET /v2/projects/{id}/metrics/overview."""

    def test_calls_correct_endpoint_with_bearer_auth(self):
        from scripts.analytics.revenuecat_client import fetch_overview

        with patch("requests.get", return_value=_mock_response(body=_SAMPLE_OVERVIEW)) as mock_get:
            fetch_overview(api_key="sk_test", project_id="projcb6956cd")

        url = mock_get.call_args[0][0]
        assert url == "https://api.revenuecat.com/v2/projects/projcb6956cd/metrics/overview"
        headers = mock_get.call_args.kwargs["headers"]
        assert headers["Authorization"] == "Bearer sk_test"
        assert headers["Accept"] == "application/json"

    def test_returns_dict_keyed_by_metric_id(self):
        from scripts.analytics.revenuecat_client import fetch_overview

        with patch("requests.get", return_value=_mock_response(body=_SAMPLE_OVERVIEW)):
            result = fetch_overview(api_key="sk_test", project_id="projcb6956cd")

        assert set(result.keys()) == {"active_trials", "active_subscriptions", "mrr"}
        assert result["mrr"]["value"] == 4
        assert result["mrr"]["unit"] == "$"
        assert result["mrr"]["period"] == "P28D"
        assert result["mrr"]["name"] == "MRR"

    def test_handles_empty_metrics_list(self):
        from scripts.analytics.revenuecat_client import fetch_overview

        with patch("requests.get", return_value=_mock_response(body={"metrics": []})):
            result = fetch_overview(api_key="sk_test", project_id="projcb6956cd")

        assert result == {}

    def test_raises_runtime_error_on_4xx(self):
        from scripts.analytics.revenuecat_client import fetch_overview

        with patch(
            "requests.get",
            return_value=_mock_response(status=403, body={"message": "forbidden"}),
        ):
            with pytest.raises(RuntimeError) as exc:
                fetch_overview(api_key="sk_test", project_id="projcb6956cd")
        assert "403" in str(exc.value)
        assert "forbidden" in str(exc.value)

    def test_raises_when_project_id_missing(self):
        from scripts.analytics.revenuecat_client import fetch_overview

        with pytest.raises(ValueError):
            fetch_overview(api_key="sk_test", project_id="")

    def test_raises_when_api_key_missing(self):
        from scripts.analytics.revenuecat_client import fetch_overview

        with pytest.raises(ValueError):
            fetch_overview(api_key="", project_id="projcb6956cd")


class TestSummarize:
    """Pure helper turning the dict into a small human-friendly payload."""

    def test_summarize_includes_named_metrics_with_values(self):
        from scripts.analytics.revenuecat_client import summarize_overview

        metrics = {
            "mrr": {"value": 4, "unit": "$", "period": "P28D", "name": "MRR"},
            "active_subscriptions": {
                "value": 1, "unit": "#", "period": "P0D", "name": "Active Subscriptions",
            },
        }
        summary = summarize_overview(metrics)
        assert summary["mrr"] == "$4 (P28D)"
        assert summary["active_subscriptions"] == "1 (P0D)"

    def test_summarize_handles_missing_metrics_gracefully(self):
        from scripts.analytics.revenuecat_client import summarize_overview

        assert summarize_overview({}) == {}
