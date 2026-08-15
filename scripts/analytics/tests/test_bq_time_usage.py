"""Tests for the when-do-people-use-it analysis.

Pure pivoting, so no BigQuery. The traps guarded here are the ones that make a
heatmap look plausible while pointing at the wrong hour: BigQuery's 1=Sunday
weekday numbering, and cells with no rows disappearing instead of reading zero.
"""
import pytest

from scripts.analytics.bq_time_usage import (
    HOURS,
    WEEKDAY_LABELS,
    FeatureTimeProfile,
    build_heatmap,
    busiest_cell,
    compute_feature_profiles,
    split_weekday_weekend,
)


def _cells(*triples):
    """(dow 1=Sun..7=Sat, hour, n) rows as BigQuery returns them."""
    return [{"weekday": d, "hour": h, "events": n, "devices": 1} for d, h, n in triples]


class TestBuildHeatmap:
    def test_grid_is_seven_by_twentyfour(self):
        grid = build_heatmap(_cells((2, 9, 5)))
        assert len(grid) == 7
        assert all(len(row) == 24 for row in grid)

    def test_bigquery_sunday_is_index_zero(self):
        """BigQuery の DAYOFWEEK は 1=日曜。0 始まりの配列にそのまま入れると1日ずれる。"""
        grid = build_heatmap(_cells((1, 0, 42)))
        assert grid[0][0] == 42

    def test_bigquery_saturday_is_index_six(self):
        grid = build_heatmap(_cells((7, 23, 9)))
        assert grid[6][23] == 9

    def test_labels_start_at_sunday_to_match_the_grid(self):
        """行ラベルと行の中身がずれたら、読む人は気づけない。"""
        assert WEEKDAY_LABELS[0] == "日"
        assert WEEKDAY_LABELS[6] == "土"

    def test_missing_cells_are_zero_not_absent(self):
        """誰も使っていない時間帯は 0。空白にすると「データが無い」と読める。"""
        grid = build_heatmap(_cells((2, 9, 5)))
        assert grid[3][14] == 0

    def test_out_of_range_weekday_is_ignored_rather_than_crashing(self):
        """想定外の値で日次レポート全体を落とさない。"""
        assert build_heatmap(_cells((0, 9, 5), (8, 9, 5)))[0][9] == 0

    def test_empty_input_still_returns_a_full_grid(self):
        grid = build_heatmap([])
        assert sum(sum(row) for row in grid) == 0
        assert len(grid) == 7

    def test_hours_axis_covers_the_whole_day(self):
        assert HOURS == tuple(range(24))


class TestBusiestCell:
    def test_returns_the_weekday_and_hour_with_the_most_events(self):
        grid = build_heatmap(_cells((2, 9, 5), (5, 22, 40)))
        cell = busiest_cell(grid)
        assert (cell.weekday_label, cell.hour, cell.events) == ("木", 22, 40)

    def test_returns_none_for_an_empty_grid(self):
        assert busiest_cell(build_heatmap([])) is None


class TestWeekdayWeekendSplit:
    def test_saturday_and_sunday_count_as_weekend(self):
        grid = build_heatmap(_cells((1, 10, 3), (7, 10, 4), (3, 10, 10)))
        split = split_weekday_weekend(grid)
        assert (split.weekend_events, split.weekday_events) == (7, 10)

    def test_per_day_average_makes_the_two_comparable(self):
        """平日は5日、週末は2日。総数のまま比べると必ず平日が勝つ。"""
        grid = build_heatmap(_cells((1, 10, 10), (3, 10, 10)))
        split = split_weekday_weekend(grid)
        assert split.weekend_per_day == pytest.approx(5.0)
        assert split.weekday_per_day == pytest.approx(2.0)

    def test_empty_grid_does_not_divide_by_zero(self):
        split = split_weekday_weekend(build_heatmap([]))
        assert split.weekend_per_day == 0.0


class TestFeatureProfiles:
    def test_peak_hour_is_the_hour_with_most_uses(self):
        profiles = compute_feature_profiles([
            {"event_name": "panic_button_tapped", "hour": 2, "events": 9, "devices": 3},
            {"event_name": "panic_button_tapped", "hour": 14, "events": 1, "devices": 1},
        ])
        assert profiles[0].peak_hour == 2

    def test_night_share_covers_the_late_night_window(self):
        """22時〜翌4時。Rewire の性質上ここに偏るなら通知時刻の設計が変わる。"""
        profiles = compute_feature_profiles([
            {"event_name": "panic_button_tapped", "hour": 23, "events": 3, "devices": 1},
            {"event_name": "panic_button_tapped", "hour": 12, "events": 1, "devices": 1},
        ])
        assert profiles[0].night_share == pytest.approx(0.75)

    def test_features_are_ordered_by_total_uses(self):
        profiles = compute_feature_profiles([
            {"event_name": "breathing_started", "hour": 9, "events": 2, "devices": 1},
            {"event_name": "panic_button_tapped", "hour": 2, "events": 9, "devices": 3},
        ])
        assert [p.event_name for p in profiles] == [
            "panic_button_tapped",
            "breathing_started",
        ]

    def test_hourly_counts_are_a_full_24_slot_row(self):
        profiles = compute_feature_profiles([
            {"event_name": "breathing_started", "hour": 9, "events": 2, "devices": 1},
        ])
        assert len(profiles[0].by_hour) == 24
        assert profiles[0].by_hour[9] == 2

    def test_no_rows_yields_no_profiles(self):
        assert compute_feature_profiles([]) == []

    def test_profile_is_immutable(self):
        profile = compute_feature_profiles([
            {"event_name": "breathing_started", "hour": 9, "events": 2, "devices": 1},
        ])[0]
        assert isinstance(profile, FeatureTimeProfile)
        with pytest.raises(Exception):
            profile.peak_hour = 1  # type: ignore[misc]
