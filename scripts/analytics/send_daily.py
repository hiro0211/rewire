"""Orchestrate the daily analytics email.

Pipeline:
  1. Load config from ~/.config/rewire/.env.analytics
  2. Find the latest daily-metrics JSON in docs/analytics/
  3. Pass it through `claude -p` to render a Markdown report
  4. Email via Resend (skipped when --dry-run)
  5. Persist the rendered Markdown next to the source JSON

Usage:
    python3 -m scripts.analytics.send_daily [--dry-run]
"""
import argparse
import logging
import sys
from pathlib import Path
from typing import Optional

from scripts.analytics.config import load_config
from scripts.analytics.data_loader import find_latest_metrics, find_matching_report
from scripts.analytics.mailer import send_email
from scripts.analytics.report_generator import generate_report
from scripts.analytics.revenuecat_client import fetch_overview


DEFAULT_ANALYTICS_DIR = Path(__file__).resolve().parent.parent.parent / "docs" / "analytics"

logger = logging.getLogger(__name__)


def run(dry_run: bool = False, analytics_dir: Optional[Path] = None) -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    target_dir = Path(analytics_dir or DEFAULT_ANALYTICS_DIR)

    try:
        cfg = load_config()
    except (FileNotFoundError, ValueError) as e:
        logger.error("Config error: %s", e)
        return 2

    try:
        latest = find_latest_metrics(target_dir)
    except FileNotFoundError as e:
        logger.error("No metrics available: %s", e)
        return 3

    logger.info("Using metrics from %s (%s)", latest.source_path.name, latest.date)
    existing = find_matching_report(target_dir, latest.date)

    payload: dict = {"asc": latest.metrics}
    if cfg.has_revenuecat:
        try:
            overview = fetch_overview(
                api_key=cfg.revenuecat_api_key,
                project_id=cfg.revenuecat_project_id,
            )
            payload["revenuecat"] = overview
            logger.info("RevenueCat overview: %d metrics fetched", len(overview))
        except RuntimeError as e:
            # Soft-fail: still send the email with ASC data plus an error note
            # so hiro hears about the gap rather than getting silence.
            logger.warning("RevenueCat fetch failed; continuing without: %s", e)
            payload["revenuecat_error"] = str(e)

    try:
        markdown = generate_report(
            claude_cmd=cfg.claude_cmd,
            target_date=latest.date,
            metrics=payload,
            existing_report=existing,
        )
    except RuntimeError as e:
        logger.error("Claude generation failed: %s", e)
        return 4

    rendered_path = target_dir / f"daily-report-{latest.date.isoformat()}-agent.md"
    rendered_path.write_text(markdown, encoding="utf-8")
    logger.info("Wrote %s", rendered_path)

    if dry_run:
        logger.info("--dry-run: skipping email send. Generated body:\n\n%s", markdown)
        return 0

    try:
        message_id = send_email(
            api_key=cfg.resend_api_key,
            sender=cfg.resend_from,
            recipient=cfg.report_to_email,
            subject=f"Rewire 日次レポート {latest.date.isoformat()}",
            markdown_body=markdown,
        )
    except RuntimeError as e:
        logger.error("Email send failed: %s", e)
        return 5

    logger.info("Email sent to %s (message id: %s)", cfg.report_to_email, message_id)
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Send Rewire daily analytics email")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Render the report but do not call Resend.",
    )
    args = parser.parse_args()
    sys.exit(run(dry_run=args.dry_run))


if __name__ == "__main__":
    main()
