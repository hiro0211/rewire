"""App Store Connect API client for analytics reports.

Handles report request creation, polling, and data download.
API docs: https://developer.apple.com/documentation/appstoreconnectapi
"""
import gzip
import logging
from typing import Optional

import requests
from requests.exceptions import HTTPError

from scripts.analytics.jwt_auth import get_auth_headers

logger = logging.getLogger(__name__)

BASE_URL = "https://api.appstoreconnect.apple.com"

# Report categories we care about for funnel analysis.
# COMMERCE is required for Downloads, Trial Starts, Paid Conversions, and
# Active Subscriptions — without it the funnel below Page View is permanently 0.
REPORT_CATEGORIES = [
    "APP_USAGE",              # Sessions, Active Devices
    "APP_STORE_ENGAGEMENT",   # Impressions, Page Views, Taps (discovery)
    "COMMERCE",               # Downloads, Trial Starts, Paid Conversions, Subscriptions
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

    def list_report_requests(self, access_type: Optional[str] = None) -> dict:
        """List analytics report requests for this app.

        Args:
            access_type: Optional filter, e.g. 'ONGOING' or 'ONE_TIME_SNAPSHOT'.

        Returns:
            API response with a list of report request entities.
        """
        url = f"{self.base_url}/v1/apps/{self.app_id}/analyticsReportRequests"
        params = {}
        if access_type:
            params["filter[accessType]"] = access_type
        return self._get(url, params=params)

    def get_or_create_report_request(self, access_type: str = "ONGOING") -> str:
        """Return the request id for an ONGOING report, creating one if needed.

        ASC returns 409 Conflict from POST /v1/analyticsReportRequests when an
        ONGOING request already exists for the app. In that case we list the
        existing requests and reuse the first matching id, so the daily
        scheduler does not need a hand-pasted --request-id every time.

        Raises:
            RuntimeError: when ASC reports the conflict but no matching
                request is found in the listing.
        """
        try:
            resp = self.create_report_request(access_type=access_type)
            return resp["data"]["id"]
        except HTTPError as exc:
            status = getattr(exc.response, "status_code", None)
            if status != 409:
                raise

        listing = self.list_report_requests(access_type=access_type)
        for entry in listing.get("data", []):
            entry_id = entry.get("id")
            if entry_id:
                return entry_id
        raise RuntimeError(
            f"ASC returned 409 for create but no {access_type} request listed "
            f"for app {self.app_id}. Inspect the dashboard manually."
        )

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
