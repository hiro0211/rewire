"""Tests for the data-quality checks.

These replace a hardcoded string. `dashboard_html.py` carried the literal
"2026-08-03 のテーブルが存在しないため、その日は集計に含まれません" — correct on
the day it was written, and silently wrong the next time a day goes missing.
"""
from datetime import date

import pytest

from scripts.analytics.bq_data_quality import (
    PROVISIONAL_DAYS,
    DataQuality,
    find_missing_dates,
    provisional_from,
)


class TestMissingDates:
    def test_a_gap_inside_the_range_is_reported(self):
        dates = [date(2026, 8, 1), date(2026, 8, 2), date(2026, 8, 4)]
        assert find_missing_dates(dates) == [date(2026, 8, 3)]

    def test_a_contiguous_range_reports_nothing(self):
        dates = [date(2026, 8, 1), date(2026, 8, 2), date(2026, 8, 3)]
        assert find_missing_dates(dates) == []

    def test_gaps_are_only_looked_for_between_the_first_and_last_day(self):
        """エクスポート開始前・今日以降は「欠測」ではない。"""
        assert find_missing_dates([date(2026, 8, 4)]) == []

    def test_multiple_gaps_are_all_reported(self):
        dates = [date(2026, 8, 1), date(2026, 8, 3), date(2026, 8, 5)]
        assert find_missing_dates(dates) == [date(2026, 8, 2), date(2026, 8, 4)]

    def test_unordered_input_is_handled(self):
        dates = [date(2026, 8, 4), date(2026, 8, 1), date(2026, 8, 2)]
        assert find_missing_dates(dates) == [date(2026, 8, 3)]

    def test_no_dates_reports_nothing(self):
        assert find_missing_dates([]) == []


class TestProvisionalWindow:
    def test_the_last_three_days_are_provisional(self):
        """GA4 は最大72時間、遅れて届いたイベントで日次テーブルを更新し続ける。

        直近3日を確定値として読むと、毎朝「昨日は急に減った」と誤読する。
        """
        assert provisional_from(date(2026, 8, 8)) == date(2026, 8, 6)

    def test_the_window_is_three_days(self):
        assert PROVISIONAL_DAYS == 3


class TestDataQuality:
    def _quality(self, **kw):
        defaults = dict(
            first_date=date(2026, 7, 19),
            last_date=date(2026, 8, 6),
            missing_dates=[],
            today=date(2026, 8, 8),
            total_devices=47,
            eligible_devices=39,
        )
        defaults.update(kw)
        return DataQuality(**defaults)

    def test_days_covered_counts_only_days_with_data(self):
        quality = self._quality(missing_dates=[date(2026, 8, 3)])
        assert quality.days_covered == 18

    def test_excluded_devices_are_the_pre_export_installs(self):
        """コホート分析から外れた端末数。分母が減った理由を説明するために要る。"""
        assert self._quality().excluded_devices == 8

    def test_has_gaps_is_true_when_a_day_is_missing(self):
        assert self._quality(missing_dates=[date(2026, 8, 3)]).has_gaps is True

    def test_has_gaps_is_false_for_a_clean_range(self):
        assert self._quality().has_gaps is False

    def test_quality_is_immutable(self):
        with pytest.raises(Exception):
            self._quality().total_devices = 1  # type: ignore[misc]
