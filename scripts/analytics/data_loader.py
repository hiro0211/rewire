"""Load the latest daily metrics + report from docs/analytics/.

Prefers `*-corrected.json` / `*-corrected.md` over base files when both exist
for the same date (corrected files are manually re-aggregated and considered
the source of truth — see MEMORY.md for the analyze_funnel column-mapping bug).
"""
import json
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Optional


_METRICS_RE = re.compile(r"^daily-metrics-(\d{4}-\d{2}-\d{2})(-corrected)?\.json$")
_REPORT_BASENAME = "daily-report-{date}{suffix}.md"

# ASC data lands 24-48h behind, so metrics two days old are expected. Anything
# older means aggregation did not run and the email would silently describe a
# different day than the one in its subject line.
STALENESS_THRESHOLD_DAYS = 2


def staleness_days(metrics_date: date, reference: Optional[date] = None) -> int:
    """Days between ``metrics_date`` and ``reference`` (default: today)."""
    return ((reference or date.today()) - metrics_date).days


def is_stale(metrics_date: date, reference: Optional[date] = None) -> bool:
    """Whether ``metrics_date`` is too old to present as the current report."""
    return staleness_days(metrics_date, reference) > STALENESS_THRESHOLD_DAYS


@dataclass(frozen=True)
class LatestMetrics:
    date: date
    metrics: dict
    source_path: Path


def find_latest_metrics(analytics_dir: Path) -> LatestMetrics:
    """Return the most recent daily-metrics JSON, preferring corrected variants.

    Raises:
        FileNotFoundError: when no matching files exist.
    """
    candidates: dict[date, Path] = {}
    for entry in Path(analytics_dir).iterdir():
        if not entry.is_file():
            continue
        match = _METRICS_RE.match(entry.name)
        if not match:
            continue
        d = date.fromisoformat(match.group(1))
        is_corrected = match.group(2) is not None
        current = candidates.get(d)
        if current is None:
            candidates[d] = entry
            continue
        # Replace base with corrected, never the reverse.
        if is_corrected and "-corrected" not in current.name:
            candidates[d] = entry

    if not candidates:
        raise FileNotFoundError(
            f"No daily-metrics-*.json files found under {analytics_dir}"
        )

    latest_date = max(candidates.keys())
    source = candidates[latest_date]
    payload = json.loads(source.read_text(encoding="utf-8"))
    return LatestMetrics(date=latest_date, metrics=payload, source_path=source)


def find_metrics_for_date(analytics_dir: Path, target: date) -> LatestMetrics:
    """Return the daily-metrics JSON for a specific date, preferring -corrected.

    Used by ``send_daily --date`` to re-render a past day's report.

    Raises:
        FileNotFoundError: when no metrics file exists for ``target``.
    """
    date_str = target.isoformat()
    for suffix in ("-corrected", ""):
        path = Path(analytics_dir) / f"daily-metrics-{date_str}{suffix}.json"
        if path.is_file():
            payload = json.loads(path.read_text(encoding="utf-8"))
            return LatestMetrics(date=target, metrics=payload, source_path=path)
    raise FileNotFoundError(
        f"No daily-metrics-{date_str}.json found under {analytics_dir}"
    )


def find_matching_report(analytics_dir: Path, target: date) -> Optional[str]:
    """Return the Markdown report for a date, preferring -corrected suffix."""
    date_str = target.isoformat()
    for suffix in ("-corrected", ""):
        path = Path(analytics_dir) / _REPORT_BASENAME.format(
            date=date_str, suffix=suffix
        )
        if path.is_file():
            return path.read_text(encoding="utf-8")
    return None
