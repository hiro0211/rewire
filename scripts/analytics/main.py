#!/usr/bin/env python3
"""CLI entry point for fetching App Store Connect analytics data.

Usage:
    python -m scripts.analytics.main [--date YYYY-MM-DD] [--request-id ID]

Fetches analytics data from ASC API and saves to data/analytics/<date>/.
"""
import argparse
import logging
import sys
from datetime import date, timedelta

from scripts.analytics.asc_client import ASCClient
from scripts.analytics.asc_fetch import fetch_daily_data, save_daily_data

# Rewire App Store ID
APP_ID = "6759087214"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(
        description="Fetch App Store Connect analytics for Rewire"
    )
    parser.add_argument(
        "--date",
        type=str,
        default=str(date.today() - timedelta(days=1)),
        help="Target date (YYYY-MM-DD). Defaults to yesterday.",
    )
    parser.add_argument(
        "--request-id",
        type=str,
        default=None,
        help="Existing report request ID (skips creation step).",
    )
    args = parser.parse_args()

    logger.info(f"Fetching analytics for date: {args.date}")
    logger.info(f"App ID: {APP_ID}")

    try:
        client = ASCClient(app_id=APP_ID)
        data = fetch_daily_data(client, date=args.date, request_id=args.request_id)

        if data:
            output_path = save_daily_data(data, args.date)
            logger.info(f"Data saved to: {output_path}")
            logger.info(f"Reports downloaded: {len(data)}")
            for name in data:
                logger.info(f"  - {name}")
        else:
            logger.warning("No data returned. Report may not be ready yet.")
            logger.info("Tip: First run creates the report request. "
                       "Data becomes available after ~24h.")
            sys.exit(1)

    except Exception as e:
        logger.error(f"Failed to fetch analytics: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
