"""Orchestrate the daily analytics email.

Pipeline:
  1. Load config from ~/.config/rewire/.env.analytics
  2. Find the latest daily-metrics JSON in docs/analytics/
  3. Pass it through `claude -p` to render a Markdown report
  4. Email via Resend (skipped when --dry-run)
  5. Persist the rendered Markdown next to the source JSON

Usage:
    python3 -m scripts.analytics.send_daily [--date YYYY-MM-DD] [--dry-run]
"""
import argparse
import logging
import sys
from datetime import date
from pathlib import Path
from typing import Optional

from scripts.analytics.config import load_config
from scripts.analytics.data_loader import (
    find_latest_metrics,
    find_matching_report,
    find_metrics_for_date,
)
from scripts.analytics.firebase_ga4_client import (
    fetch_all_events,
    fetch_ga4_retention,
    fetch_ga4_snapshot,
    summarize_retention,
)
from scripts.analytics.html_report import build_html
from scripts.analytics.mailer import send_email
from scripts.analytics.report_generator import generate_report
from scripts.analytics.revenuecat_client import fetch_overview


DEFAULT_ANALYTICS_DIR = Path(__file__).resolve().parent.parent.parent / "docs" / "analytics"

logger = logging.getLogger(__name__)


def run(dry_run: bool = False, date_str: Optional[str] = None,
        analytics_dir: Optional[Path] = None) -> int:
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
        if date_str:
            latest = find_metrics_for_date(target_dir, date.fromisoformat(date_str))
        else:
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

    if cfg.has_firebase:
        # Align GA4 with the ASC data date so the report describes a single
        # coherent day across sources. ASC's own 24-48h lag already pushes
        # `latest.date` safely outside GA4's standard-report lag window.
        try:
            ga4_snapshot = fetch_ga4_snapshot(
                property_id=cfg.ga4_property_id,
                credentials_path=cfg.google_application_credentials,
                target_date=latest.date,
            )
            # Enrich with cohort retention + the unfiltered event scan so the
            # リテンション / 全イベント sections mirror Focusity. Each is a
            # separate GA4 call and soft-fails on its own — a flaky cohort query
            # must not take down the basics/events table.
            try:
                retention = fetch_ga4_retention(
                    property_id=cfg.ga4_property_id,
                    credentials_path=cfg.google_application_credentials,
                    end_date=latest.date,
                )
                ga4_snapshot["retention_summary"] = summarize_retention(retention)
            except RuntimeError as e:
                logger.warning("GA4 retention fetch failed; continuing: %s", e)
            try:
                ga4_snapshot["all_events"] = fetch_all_events(
                    property_id=cfg.ga4_property_id,
                    credentials_path=cfg.google_application_credentials,
                    target_date=latest.date,
                )
            except RuntimeError as e:
                logger.warning("GA4 all-events fetch failed; continuing: %s", e)
            payload["firebase"] = ga4_snapshot
            logger.info(
                "GA4 snapshot fetched: %d events, %d screens, %d all-events",
                len(ga4_snapshot.get("events", {})),
                len(ga4_snapshot.get("top_screens", [])),
                len(ga4_snapshot.get("all_events", [])),
            )
        except RuntimeError as e:
            logger.warning("GA4 fetch failed; continuing without: %s", e)
            payload["firebase_error"] = str(e)

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

    # HTML part: the Gmail-friendly inline-CSS document. Data tables are built
    # deterministically from the payload; only the LLM's 横断分析 / 改善提案
    # narrative is lifted from the Markdown so the email stays readable.
    html_body = build_html(payload, latest.date, insights_md=markdown)

    if dry_run:
        html_path = target_dir / f"daily-report-{latest.date.isoformat()}.html"
        html_path.write_text(html_body, encoding="utf-8")
        logger.info("--dry-run: skipping email send. Wrote HTML preview to %s", html_path)
        logger.info("--dry-run: plain-text body:\n\n%s", markdown)
        return 0

    try:
        message_id = send_email(
            api_key=cfg.resend_api_key,
            sender=cfg.resend_from,
            recipient=cfg.report_to_email,
            subject=f"Rewire 日次レポート {latest.date.isoformat()}",
            markdown_body=markdown,
            html_body=html_body,
        )
    except RuntimeError as e:
        logger.error("Email send failed: %s", e)
        return 5

    logger.info("Email sent to %s (message id: %s)", cfg.report_to_email, message_id)
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Send Rewire daily analytics email")
    parser.add_argument(
        "--date",
        help="Target date YYYY-MM-DD (default: latest daily-metrics file).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Render the report (writes an HTML preview) but do not call Resend.",
    )
    args = parser.parse_args()
    sys.exit(run(dry_run=args.dry_run, date_str=args.date))


if __name__ == "__main__":
    main()
