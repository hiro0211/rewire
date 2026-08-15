"""Build the Rewire analytics dashboard from the GA4 BigQuery export.

Pipeline:
  1. Load config from ~/.config/rewire/.env.analytics (same key as the GA4 client)
  2. Resolve the cohort (default: purchasers)
  3. Query the onboarding funnel, the conversion funnel, and per-user activity
  4. Render one standalone HTML file into docs/analytics/

Usage:
    python3 -m scripts.analytics.build_dashboard [--cohort purchaser|onboarded]
                                                 [--dry-run] [--open]
"""
import argparse
import logging
import webbrowser
from datetime import date
from pathlib import Path
from typing import Optional

from scripts.analytics.bigquery_client import build_client
from scripts.analytics.bq_blocker import fetch_blocker_funnel, fetch_holdout_buckets
from scripts.analytics.bq_cohort import COHORTS, fetch_cohort
from scripts.analytics.bq_data_quality import fetch_data_quality
from scripts.analytics.bq_engagement import (
    fetch_dwell_coverage,
    fetch_screen_dwell,
    fetch_session_stats,
)
from scripts.analytics.bq_onboarding_funnel import fetch_conversion_funnel, fetch_funnel
from scripts.analytics.bq_retention import DEFAULT_OFFSETS, fetch_lifespan, fetch_retention
from scripts.analytics.bq_segments import (
    CHANNEL_SQL,
    COUNTRY_SQL,
    LANGUAGE_SQL,
    fetch_segments,
)
from scripts.analytics.bq_time_usage import (
    fetch_feature_profiles,
    fetch_heatmap,
    split_weekday_weekend,
)
from scripts.analytics.bq_user_activity import fetch_user_activity
from scripts.analytics.config import load_config
from scripts.analytics.dashboard_html import build_dashboard_html
from scripts.analytics.dashboard_insights import Insights


DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "docs" / "analytics"
DEFAULT_COHORT = "purchaser"

#: The export was linked on this date; nothing before it exists. Cohort
#: analysis excludes devices that installed earlier, because their day 0 is not
#: in the data and every offset would be measured from the wrong origin.
EXPORT_START = date(2026, 7, 19)

logger = logging.getLogger(__name__)


def gather_insights(client, target_date: date) -> Optional[Insights]:
    """Fetch the retention / timing / engagement / blocker sections.

    Returns None on failure instead of raising: these sections are additive,
    and losing them should not cost the funnel dashboard that already worked.
    The failure is logged so a silently missing section is still traceable.
    """
    try:
        # One fetch, two consumers — the grid and its weekday/weekend rollup are
        # the same query.
        heatmap = fetch_heatmap(client)
        return Insights(
            retention_cohorts=fetch_retention(client, EXPORT_START, target_date),
            lifespan=fetch_lifespan(client, EXPORT_START),
            retention_offsets=DEFAULT_OFFSETS,
            heatmap=heatmap,
            feature_profiles=fetch_feature_profiles(client),
            week_split=split_weekday_weekend(heatmap),
            session_stats=fetch_session_stats(client),
            screen_dwell=fetch_screen_dwell(client, limit=15),
            dwell_coverage=fetch_dwell_coverage(client),
            segments=[
                ("流入チャネル", fetch_segments(client, CHANNEL_SQL, EXPORT_START)),
                ("国", fetch_segments(client, COUNTRY_SQL, EXPORT_START)),
                ("言語", fetch_segments(client, LANGUAGE_SQL, EXPORT_START)),
            ],
            blocker_funnel=fetch_blocker_funnel(client),
            holdout=fetch_holdout_buckets(client),
            quality=fetch_data_quality(client, EXPORT_START, target_date),
        )
    except Exception as e:  # noqa: BLE001
        logger.error("Insight queries failed, rendering without them: %s", e)
        return None


def output_path(output_dir: Path, target_date: date, cohort_key: str) -> Path:
    """Dated filename so successive runs accumulate instead of overwriting."""
    return Path(output_dir) / f"dashboard-{cohort_key}-{target_date.isoformat()}.html"


def run(
    cohort_key: str = DEFAULT_COHORT,
    output_dir: Optional[Path] = None,
    dry_run: bool = False,
    today: Optional[date] = None,
    open_after: bool = False,
) -> int:
    """Return a process exit code: 0 ok, 1 query failure, 2 configuration error."""
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    target_date = today or date.today()
    target_dir = Path(output_dir or DEFAULT_OUTPUT_DIR)

    definition = COHORTS.get(cohort_key)
    if definition is None:
        logger.error("Unknown cohort %r. Available: %s", cohort_key, ", ".join(COHORTS))
        return 2

    try:
        cfg = load_config()
    except (FileNotFoundError, ValueError) as e:
        logger.error("Config error: %s", e)
        return 2

    if not cfg.has_firebase:
        logger.error(
            "Service-account JSON not configured or unreadable "
            "(GOOGLE_APPLICATION_CREDENTIALS in ~/.config/rewire/.env.analytics)"
        )
        return 2

    try:
        client = build_client(cfg.google_application_credentials)
        cohort = fetch_cohort(client, definition)
        onboarding_steps = fetch_funnel(client)
        conversion_stages = fetch_conversion_funnel(client)
        activity = fetch_user_activity(client, cohort, today=target_date)
    except Exception as e:  # noqa: BLE001 — surface any query/auth failure as exit 1
        # Deliberately not writing a file here: an empty dashboard that looks
        # successful is worse than no dashboard.
        logger.error("BigQuery query failed: %s", e)
        return 1

    insights = gather_insights(client, target_date)

    html = build_dashboard_html(
        generated_on=target_date,
        cohort=cohort,
        onboarding_steps=onboarding_steps,
        conversion_stages=conversion_stages,
        activity=activity,
        insights=insights,
    )

    if dry_run:
        logger.info(
            "dry-run: cohort=%s(%d) onboarding_steps=%d stages=%d users=%d html=%d bytes",
            cohort_key, cohort.size, len(onboarding_steps),
            len(conversion_stages), len(activity), len(html.encode("utf-8")),
        )
        return 0

    target_dir.mkdir(parents=True, exist_ok=True)
    path = output_path(target_dir, target_date, cohort_key)
    path.write_text(html, encoding="utf-8")
    logger.info("wrote %s (%d bytes)", path, len(html.encode("utf-8")))

    if open_after:
        webbrowser.open(path.as_uri())
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cohort", default=DEFAULT_COHORT, choices=sorted(COHORTS))
    parser.add_argument("--dry-run", action="store_true",
                        help="query and render, but write no file")
    parser.add_argument("--open", action="store_true", dest="open_after",
                        help="open the result in a browser")
    args = parser.parse_args()
    return run(cohort_key=args.cohort, dry_run=args.dry_run, open_after=args.open_after)


if __name__ == "__main__":
    raise SystemExit(main())
