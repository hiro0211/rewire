"""High-level functions for fetching App Store Connect analytics data.

Orchestrates the ASC API workflow:
1. Create/find report request
2. Get available reports by category
3. Get daily report instances
4. Download and save data
"""
import csv
import io
import json
import logging
from datetime import date
from pathlib import Path
from typing import Optional

from scripts.analytics.asc_client import ASCClient, REPORT_CATEGORIES

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent.parent / "data" / "analytics"


def fetch_daily_data(
    client: ASCClient,
    date: str,
    request_id: Optional[str] = None,
) -> dict:
    """Fetch all analytics data for a given date.

    Args:
        client: An authenticated ASCClient.
        date: The target date string (YYYY-MM-DD).
        request_id: Existing report request ID (creates new if None).

    Returns:
        Dict mapping report_name -> TSV content string.
    """
    # Step 1: Create or use existing report request
    if request_id is None:
        resp = client.create_report_request()
        request_id = resp["data"]["id"]
        logger.info(f"Created report request: {request_id}")

    results = {}

    # Step 2: Get reports for each category
    for category in REPORT_CATEGORIES:
        try:
            reports_resp = client.get_reports(request_id, category=category)
            for report in reports_resp.get("data", []):
                report_id = report["id"]
                report_name = report["attributes"].get("name", report_id)

                # Step 3: Get daily instances
                instances_resp = client.get_report_instances(
                    report_id, granularity="DAILY"
                )
                for instance in instances_resp.get("data", []):
                    proc_date = instance["attributes"].get("processingDate", "")
                    if proc_date == date:
                        instance_id = instance["id"]

                        # Step 4: Download segments
                        segments_resp = client.get_report_segments(instance_id)
                        for segment in segments_resp.get("data", []):
                            url = segment["attributes"].get("url", "")
                            if url:
                                tsv_data = client.download_segment(url)
                                results[report_name] = tsv_data
                                logger.info(f"Downloaded: {report_name} for {date}")
        except Exception as e:
            logger.warning(f"Failed to fetch {category}: {e}")

    return results


def save_daily_data(data: dict, date_str: str, output_dir: Optional[Path] = None) -> Path:
    """Save fetched data to date-organized directory.

    Args:
        data: Dict mapping report_name -> TSV content.
        date_str: Date string for directory naming.
        output_dir: Override output directory.

    Returns:
        Path to the saved directory.
    """
    out = (output_dir or DATA_DIR) / date_str
    out.mkdir(parents=True, exist_ok=True)

    for name, content in data.items():
        safe_name = name.replace(" ", "_").replace("/", "_").lower()
        filepath = out / f"{safe_name}.tsv"
        filepath.write_text(content, encoding="utf-8")
        logger.info(f"Saved: {filepath}")

    # Also save a manifest
    manifest = {
        "date": date_str,
        "reports": list(data.keys()),
        "file_count": len(data),
    }
    (out / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    return out
