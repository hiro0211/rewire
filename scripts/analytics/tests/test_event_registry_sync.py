"""Guards the manual sync between the app's events and the report's allowlist.

`REWIRE_KEY_EVENTS` mirrors the RN call sites by hand, across a language
boundary, so it drifts in both directions:

  - Events fired by the app but absent from the list never reach the report.
  - Events listed but never fired sit permanently at 0 and pad the "未発火"
    warning count, hiding the real instrumentation gaps. `safari_demo_tapped`
    and `safari_demo_skipped` did exactly this.

These tests read the actual TypeScript sources so the drift fails here rather
than silently in a morning email.
"""
import re
from pathlib import Path

import pytest

from scripts.analytics.firebase_ga4_client import REWIRE_KEY_EVENTS

REPO_ROOT = Path(__file__).resolve().parents[3]
SOURCE_DIRS = ("app", "components", "hooks", "features", "lib", "constants")


def _typed_event_names() -> set:
    """Event names declared in `AnalyticsEventParams` (constants/analyticsEvents.ts)."""
    src = (REPO_ROOT / "constants" / "analyticsEvents.ts").read_text(encoding="utf-8")
    body = src.split("export interface AnalyticsEventParams", 1)[1]
    body = body.split("\n}", 1)[0]
    return set(re.findall(r"^\s{2}([a-z][a-z0-9_]*)\s*:", body, re.MULTILINE))


def _source_files():
    for directory in SOURCE_DIRS:
        for path in (REPO_ROOT / directory).rglob("*.ts*"):
            if "__tests__" in path.parts or path.name.endswith(".d.ts"):
                continue
            yield path


def _fired_event_names() -> set:
    """Every event name passed to logEvent/trackEvent anywhere in the app."""
    pattern = re.compile(r"(?:logEvent|trackEvent)\(\s*['\"]([a-z][a-z0-9_]*)['\"]")
    fired = set()
    for path in _source_files():
        fired.update(pattern.findall(path.read_text(encoding="utf-8")))
    return fired


class TestEventRegistrySync:
    def test_every_typed_event_is_in_the_report_allowlist(self):
        missing = _typed_event_names() - set(REWIRE_KEY_EVENTS)
        assert not missing, (
            f"Declared in analyticsEvents.ts but missing from REWIRE_KEY_EVENTS, "
            f"so the daily report will never show them: {sorted(missing)}"
        )

    def test_every_fired_event_is_in_the_report_allowlist(self):
        missing = _fired_event_names() - set(REWIRE_KEY_EVENTS)
        assert not missing, (
            f"Fired by the app but missing from REWIRE_KEY_EVENTS: {sorted(missing)}"
        )

    def test_allowlist_has_no_events_the_app_never_fires(self):
        dead = set(REWIRE_KEY_EVENTS) - _fired_event_names()
        assert not dead, (
            f"Listed in REWIRE_KEY_EVENTS but fired nowhere in the app — these "
            f"sit at 0 forever and inflate the 未発火 warning: {sorted(dead)}"
        )

    def test_allowlist_has_no_duplicates(self):
        assert len(REWIRE_KEY_EVENTS) == len(set(REWIRE_KEY_EVENTS))
