"""Tests for App Store Connect API client."""
import json
import gzip
from unittest.mock import patch, MagicMock
import pytest


class TestASCClient:
    """Tests for the ASC API client class."""

    def _make_client(self):
        from scripts.analytics.asc_client import ASCClient
        with patch("scripts.analytics.asc_client.get_auth_headers", return_value={
            "Authorization": "Bearer fake-token",
            "Content-Type": "application/json",
        }):
            return ASCClient(app_id="123456789")

    def test_client_stores_app_id(self):
        client = self._make_client()
        assert client.app_id == "123456789"

    def test_client_has_base_url(self):
        client = self._make_client()
        assert client.base_url == "https://api.appstoreconnect.apple.com"

    def test_create_report_request_sends_post(self):
        client = self._make_client()
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_response.json.return_value = {
            "data": {"id": "report-req-123", "type": "analyticsReportRequests"}
        }

        with patch("requests.post", return_value=mock_response) as mock_post:
            result = client.create_report_request()

        mock_post.assert_called_once()
        call_url = mock_post.call_args[0][0]
        assert "/v1/analyticsReportRequests" in call_url
        assert result["data"]["id"] == "report-req-123"

    def test_get_reports_for_request(self):
        client = self._make_client()
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "data": [
                {"id": "report-1", "attributes": {"category": "APP_USAGE", "name": "App Store Engagement"}},
                {"id": "report-2", "attributes": {"category": "APP_USAGE", "name": "App Downloads"}},
            ]
        }

        with patch("requests.get", return_value=mock_response) as mock_get:
            result = client.get_reports("report-req-123", category="APP_USAGE")

        call_url = mock_get.call_args[0][0]
        assert "report-req-123" in call_url
        assert len(result["data"]) == 2

    def test_get_report_instances(self):
        client = self._make_client()
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "data": [
                {
                    "id": "instance-1",
                    "attributes": {
                        "granularity": "DAILY",
                        "processingDate": "2026-04-03",
                    },
                }
            ]
        }

        with patch("requests.get", return_value=mock_response) as mock_get:
            result = client.get_report_instances("report-1", granularity="DAILY")

        call_url = mock_get.call_args[0][0]
        assert "report-1" in call_url
        assert result["data"][0]["attributes"]["granularity"] == "DAILY"

    def test_get_report_segments(self):
        client = self._make_client()
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "data": [
                {
                    "id": "segment-1",
                    "attributes": {"url": "https://download.example.com/data.tsv.gz"},
                }
            ]
        }

        with patch("requests.get", return_value=mock_response) as mock_get:
            result = client.get_report_segments("instance-1")

        assert result["data"][0]["attributes"]["url"].endswith(".tsv.gz")

    def test_download_segment_decompresses_gzip(self):
        client = self._make_client()
        tsv_content = "date\tmetric\tvalue\n2026-04-03\timpressions\t1000\n"
        compressed = gzip.compress(tsv_content.encode("utf-8"))

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = compressed

        with patch("requests.get", return_value=mock_response):
            result = client.download_segment("https://download.example.com/data.tsv.gz")

        assert "impressions" in result
        assert "1000" in result

    def test_download_segment_does_not_send_auth_headers(self):
        """Pre-signed S3 URLs reject requests that include the ASC bearer token.

        The download URL is a pre-signed S3 link — sending Authorization headers
        causes a 400 Bad Request. Ensure `download_segment` requests without them.
        """
        client = self._make_client()
        tsv_content = "date\tmetric\n2026-04-20\t1\n"
        compressed = gzip.compress(tsv_content.encode("utf-8"))

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = compressed

        with patch("requests.get", return_value=mock_response) as mock_get:
            client.download_segment("https://asp-us-west-2.s3.amazonaws.com/signed")

        # Ensure the call did not forward the ASC bearer token
        called_headers = mock_get.call_args.kwargs.get("headers") or (
            mock_get.call_args.args[1] if len(mock_get.call_args.args) > 1 else None
        )
        if called_headers:
            assert "Authorization" not in called_headers


class TestFetchDailyData:
    """Tests for the high-level daily data fetch function."""

    def test_fetch_daily_returns_dict_with_categories(self):
        from scripts.analytics.asc_client import ASCClient

        client = MagicMock(spec=ASCClient)
        client.app_id = "123456789"

        # Mock the workflow
        client.create_report_request.return_value = {
            "data": {"id": "req-1"}
        }
        client.get_reports.return_value = {
            "data": [{"id": "report-1", "attributes": {"category": "APP_USAGE", "name": "App Store Engagement"}}]
        }
        client.get_report_instances.return_value = {
            "data": [{"id": "inst-1", "attributes": {"granularity": "DAILY", "processingDate": "2026-04-03"}}]
        }
        client.get_report_segments.return_value = {
            "data": [{"id": "seg-1", "attributes": {"url": "https://example.com/data.tsv.gz"}}]
        }
        client.download_segment.return_value = "date\tmetric\n2026-04-03\t100\n"

        from scripts.analytics.asc_fetch import fetch_daily_data
        result = fetch_daily_data(client, date="2026-04-03")

        assert isinstance(result, dict)
        # Should have attempted to fetch data
        client.get_reports.assert_called()
