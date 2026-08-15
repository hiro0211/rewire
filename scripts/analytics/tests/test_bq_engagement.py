"""Tests for session length and screen dwell time.

The measured distribution is extremely skewed — mean session 1,194s against a
median of 104s — so the thing these tests protect is that both numbers survive
to the report. A mean alone would claim the average user spends 20 minutes.
"""
import pytest

from scripts.analytics.bq_engagement import (
    ScreenDwell,
    SessionStats,
    compute_dwell_coverage,
    compute_screen_dwell,
    compute_session_stats,
    median,
)


def _sessions(*triples):
    """(wall_sec, engaged_sec, screens) per session."""
    return [
        {"device_id": f"d{i}", "wall_sec": w, "engaged_sec": e, "screens": s}
        for i, (w, e, s) in enumerate(triples)
    ]


class TestMedian:
    def test_odd_count_takes_the_middle(self):
        assert median([3, 1, 2]) == 2

    def test_even_count_averages_the_two_middle_values(self):
        assert median([1, 2, 3, 4]) == pytest.approx(2.5)

    def test_empty_is_zero(self):
        assert median([]) == 0.0


class TestSessionStats:
    def test_median_and_mean_are_both_reported(self):
        """実測では平均1194秒・中央値104秒。平均だけ出すと嘘になる。"""
        stats = compute_session_stats(_sessions((10, 10, 1), (20, 20, 2), (3000, 3000, 3)))
        assert stats.median_wall_sec == 20
        assert stats.mean_wall_sec == pytest.approx(1010.0)

    def test_session_count_is_the_number_of_rows(self):
        assert compute_session_stats(_sessions((10, 5, 1), (20, 8, 2))).sessions == 2

    def test_devices_are_counted_distinctly(self):
        rows = [
            {"device_id": "a", "wall_sec": 1, "engaged_sec": 1, "screens": 1},
            {"device_id": "a", "wall_sec": 2, "engaged_sec": 1, "screens": 1},
        ]
        assert compute_session_stats(rows).devices == 1

    def test_engaged_time_is_tracked_separately_from_wall_time(self):
        """実時間は「アプリを開いていた」、engagement は「実際に触っていた」。

        バックグラウンドに置きっぱなしのセッションで両者は大きくずれる。
        """
        stats = compute_session_stats(_sessions((3000, 30, 2)))
        assert stats.median_wall_sec == 3000
        assert stats.median_engaged_sec == 30

    def test_screens_per_session_is_reported(self):
        assert compute_session_stats(_sessions((10, 5, 4))).median_screens == 4

    def test_no_sessions_yields_zeroes_not_a_crash(self):
        stats = compute_session_stats([])
        assert (stats.sessions, stats.median_wall_sec, stats.mean_wall_sec) == (0, 0.0, 0.0)

    def test_stats_are_immutable(self):
        stats = compute_session_stats(_sessions((10, 5, 1)))
        assert isinstance(stats, SessionStats)
        with pytest.raises(Exception):
            stats.sessions = 99  # type: ignore[misc]


class TestDwellCoverage:
    """滞在時間のうち、実際のルートに紐づいた割合。

    実測 2026-08-08: engagement_time の 23.42h / 24.5h（95.6%）が `RNSScreen`
    に付いており、ルート名を持たない。Firebase の自動 screen 収集が「現在の画面」を
    iOS 内部クラス名で上書きするため。この割合を出さずに画面別滞在時間を表に出すと、
    実際は 0.7% しか見ていない数字を全体像として読ませてしまう。
    """

    def test_share_is_attributed_over_total(self):
        coverage = compute_dwell_coverage(attributed_msec=1000, total_msec=4000)
        assert coverage.share == pytest.approx(0.25)

    def test_zero_total_is_not_a_division_error(self):
        assert compute_dwell_coverage(attributed_msec=0, total_msec=0).share == 0.0

    def test_low_coverage_is_flagged_as_unreliable(self):
        """割合が低いときは「参考値」ではなく「読めない」と伝える必要がある。"""
        assert compute_dwell_coverage(attributed_msec=7, total_msec=1000).is_reliable is False

    def test_high_coverage_is_reliable(self):
        assert compute_dwell_coverage(attributed_msec=900, total_msec=1000).is_reliable is True


class TestScreenDwell:
    def test_seconds_are_summed_per_screen(self):
        dwell = compute_screen_dwell([
            {"screen": "/", "engaged_msec": 5000, "devices": 2, "views": 3},
            {"screen": "/panic", "engaged_msec": 1000, "devices": 1, "views": 1},
        ])
        assert dwell[0].total_sec == pytest.approx(5.0)

    def test_ordered_by_total_time_not_by_view_count(self):
        """回数の多い画面より、時間を食っている画面のほうが示唆がある。"""
        dwell = compute_screen_dwell([
            {"screen": "/", "engaged_msec": 1000, "devices": 1, "views": 50},
            {"screen": "/lesson/lesson-1", "engaged_msec": 9000, "devices": 1, "views": 2},
        ])
        assert [d.screen for d in dwell] == ["/lesson/lesson-1", "/"]

    def test_average_per_view_is_derived(self):
        dwell = compute_screen_dwell([
            {"screen": "/", "engaged_msec": 10000, "devices": 1, "views": 4},
        ])
        assert dwell[0].mean_sec_per_view == pytest.approx(2.5)

    def test_zero_views_does_not_divide_by_zero(self):
        dwell = compute_screen_dwell([
            {"screen": "/", "engaged_msec": 10000, "devices": 1, "views": 0},
        ])
        assert dwell[0].mean_sec_per_view == 0.0

    def test_rows_with_no_screen_are_dropped(self):
        """`firebase_screen` が無い行は自動収集の残骸で、ルート名を持たない。"""
        dwell = compute_screen_dwell([
            {"screen": None, "engaged_msec": 9999, "devices": 1, "views": 1},
            {"screen": "/", "engaged_msec": 1000, "devices": 1, "views": 1},
        ])
        assert [d.screen for d in dwell] == ["/"]

    def test_empty_input_yields_nothing(self):
        assert compute_screen_dwell([]) == []

    def test_dwell_is_immutable(self):
        dwell = compute_screen_dwell([
            {"screen": "/", "engaged_msec": 1000, "devices": 1, "views": 1},
        ])[0]
        assert isinstance(dwell, ScreenDwell)
        with pytest.raises(Exception):
            dwell.total_sec = 1.0  # type: ignore[misc]
