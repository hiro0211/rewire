"""App Store Connect API client for analytics reports.

Handles report request creation, polling, and data download.
API docs: https://developer.apple.com/documentation/appstoreconnectapi
"""
import gzip
import logging
from typing import Optional

import requests

from scripts.analytics.jwt_auth import get_auth_headers

logger = logging.getLogger(__name__)

BASE_URL = "https://api.appstoreconnect.apple.com"

# Report categories we care about for funnel analysis
REPORT_CATEGORIES = [
    "APP_USAGE",        # Impressions, Page Views, Downloads, Sessions
    "APP_STORE_ENGAGEMENT",  # Product page engagement
]


class ASCClient:
    """Client for App Store Connect Analytics Reports API."""

    def __init__(self, app_id: str, headers: Optional[dict] = None):
        """Initialize client.

        Args:
            app_id: The App Store app ID.
            headers: Optional auth headers (auto-generated if not provided).
        """
        self.app_id = app_id
        self.base_url = BASE_URL
        self.headers = headers or get_auth_headers()

    def _get(self, url: str, params: Optional[dict] = None) -> dict:
        """Make authenticated GET request."""
        resp = requests.get(url, headers=self.headers, params=params)
        resp.raise_for_status()
        return resp.json()

    def _post(self, url: str, payload: dict) -> dict:
        """Make authenticated POST request."""
        resp = requests.post(url, headers=self.headers, json=payload)
        resp.raise_for_status()
        return resp.json()

    def create_report_request(self, access_type: str = "ONGOING") -> dict:
        """Create an analytics report request for the app.

        Args:
            access_type: 'ONGOING' for daily updates or 'ONE_TIME_SNAPSHOT'.

        Returns:
            API response with report request ID.
        """
        url = f"{self.base_url}/v1/analyticsReportRequests"
        payload = {
            "data": {
                "type": "analyticsReportRequests",
                "attributes": {
                    "accessType": access_type,
                },
                "relationships": {
                    "app": {
                        "data": {
                            "type": "apps",
                            "id": self.app_id,
                        }
                    }
                },
            }
        }
        return self._post(url, payload)

    def get_reports(
        self, request_id: str, category: Optional[str] = None
    ) -> dict:
        """Get available reports for a report request.

        Args:
            request_id: The report request ID.
            category: Optional filter (e.g. 'APP_USAGE').

        Returns:
            API response with list of reports.
        """
        url = f"{self.base_url}/v1/analyticsReportRequests/{request_id}/reports"
        params = {}
        if category:
            params["filter[category]"] = category
        return self._get(url, params=params)

    def get_report_instances(
        self, report_id: str, granularity: Optional[str] = None
    ) -> dict:
        """Get report instances (daily/weekly/monthly data).

        Args:
            report_id: The report ID.
            granularity: Optional filter ('DAILY', 'WEEKLY', 'MONTHLY').

        Returns:
            API response with list of instances.
        """
        url = f"{self.base_url}/v1/analyticsReports/{report_id}/instances"
        params = {}
        if granularity:
            params["filter[granularity]"] = granularity
        return self._get(url, params=params)

    def get_report_segments(self, instance_id: str) -> dict:
        """Get downloadable segments for a report instance.

        Args:
            instance_id: The report instance ID.

        Returns:
            API response with download URLs.
        """
        url = f"{self.base_url}/v1/analyticsReportInstances/{instance_id}/segments"
        return self._get(url)

    def download_segment(self, url: str) -> str:
        """Download and decompress a report segment.

        The URL returned by ASC is a pre-signed S3 link, so we must not
        send the Authorization bearer token — doing so causes a 400.

        Args:
            url: The download URL for the gzipped TSV file.

        Returns:
            Decompressed TSV content as string.
        """
        resp = requests.get(url)
        resp.raise_for_status()
        decompressed = gzip.decompress(resp.content)
        return decompressed.decode("utf-8")
