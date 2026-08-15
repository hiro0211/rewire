"""Tests for segment breakdowns (acquisition channel, language/country, plan).

Measured 2026-08-08, two facts made this worth building: installs split roughly
evenly between Apple Search (20 devices) and direct (27), and more than half of
all users are outside Japan on a JA/EN-only app. Neither appeared anywhere in
the reporting.
"""
import pytest

from scripts.analytics.bq_segments import (
    MIN_SEGMENT_DEVICES,
    Segment,
    compute_segments,
)


def _row(key, devices, returned):
    return {"segment": key, "devices": devices, "returned": returned}


class TestSegmentRates:
    def test_return_rate_divides_by_the_segment_size(self):
        segments = compute_segments([_row("Apple", 20, 5)])
        assert segments[0].return_rate == pytest.approx(0.25)

    def test_share_is_relative_to_all_devices(self):
        segments = compute_segments([_row("Apple", 20, 5), _row("(direct)", 30, 3)])
        by_key = {s.key: s for s in segments}
        assert by_key["Apple"].share == pytest.approx(0.4)

    def test_segments_are_ordered_by_size(self):
        segments = compute_segments([_row("Apple", 20, 5), _row("(direct)", 30, 3)])
        assert [s.key for s in segments] == ["(direct)", "Apple"]

    def test_empty_input_yields_nothing(self):
        assert compute_segments([]) == []

    def test_a_missing_key_is_labelled_rather_than_dropped(self):
        """NULL のチャネルを捨てると、合計が全体と合わなくなって読者が混乱する。"""
        segments = compute_segments([_row(None, 7, 1)])
        assert segments[0].key == "(不明)"


class TestSampleGuard:
    def test_a_small_segment_does_not_report_a_rate(self):
        """n=2 のセグメントの「継続率50%」は1台が戻っただけ。"""
        segments = compute_segments([_row("Apple", 2, 1)])
        assert segments[0].return_rate is None

    def test_a_small_segment_still_reports_its_size(self):
        """率は出さなくても「何台いるか」は分母として意味がある。"""
        segments = compute_segments([_row("Apple", 2, 1)])
        assert segments[0].devices == 2

    def test_a_segment_at_the_threshold_reports_a_rate(self):
        segments = compute_segments([_row("Apple", MIN_SEGMENT_DEVICES, 1)])
        assert segments[0].return_rate is not None

    def test_zero_devices_does_not_divide_by_zero(self):
        assert compute_segments([_row("Apple", 0, 0)]) == []


class TestImmutability:
    def test_segment_is_frozen(self):
        segment = compute_segments([_row("Apple", 20, 5)])[0]
        assert isinstance(segment, Segment)
        with pytest.raises(Exception):
            segment.devices = 1  # type: ignore[misc]
