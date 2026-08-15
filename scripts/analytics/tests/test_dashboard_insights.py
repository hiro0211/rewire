"""Tests for the new dashboard sections.

Pure rendering. What these protect is honesty in the output: an unknown must
never render like a zero, a tiny sample must never render like a finding, and
a section with no data must say why.
"""
from datetime import date

from scripts.analytics.bq_blocker import BlockerFunnel, compute_holdout_buckets
from scripts.analytics.bq_data_quality import DataQuality
from scripts.analytics.bq_engagement import compute_dwell_coverage, compute_session_stats
from scripts.analytics.bq_feature_retention import build_any_feature_lift
from scripts.analytics.bq_retention import compute_retention_curve
from scripts.analytics.bq_segments import compute_segments
from scripts.analytics.dashboard_insights import (
    blocker_section,
    data_quality_section,
    engagement_section,
    retention_section,
    segment_section,
)

TODAY = date(2026, 8, 9)


class TestRetentionSection:
    def _cohorts(self):
        return compute_retention_curve(
            sizes=[{"cohort_date": date(2026, 7, 20), "devices": 10}],
            activity=[{"cohort_date": date(2026, 7, 20), "day_offset": 1, "devices": 4}],
            today=TODAY,
            offsets=(1, 30),
        )

    def test_a_mature_rate_is_shown_as_a_percentage(self):
        assert "40.0%" in retention_section(self._cohorts(), [], (1, 30))

    def test_an_immature_offset_renders_as_a_dash(self):
        """D30 を 0% と書くと「1か月で全滅」と読まれる。まだ来ていないだけ。"""
        html = retention_section(self._cohorts(), [], (1, 30))
        assert "—" in html

    def test_denominators_differ_per_offset_is_stated(self):
        """実測で D3 < D7 が起きる。成熟したコホートの集合が違うだけ。"""
        html = retention_section(self._cohorts(), [], (1, 30))
        assert "分母" in html

    def test_no_cohorts_says_so_rather_than_rendering_an_empty_table(self):
        assert "該当なし" in retention_section([], [], (1,))


class TestEngagementSection:
    def _stats(self):
        return compute_session_stats([
            {"device_id": "a", "wall_sec": 100, "engaged_sec": 90, "screens": 5},
            {"device_id": "b", "wall_sec": 3000, "engaged_sec": 2900, "screens": 40},
        ])

    def test_median_and_mean_are_both_present(self):
        html = engagement_section(self._stats(), [], compute_dwell_coverage(900, 1000))
        assert "中央値" in html and "平均" in html

    def test_unreliable_dwell_attribution_is_called_out(self):
        """実測 0.7%。この警告なしに画面別滞在時間を出すと全体像だと誤読される。"""
        html = engagement_section(self._stats(), [], compute_dwell_coverage(7, 1000))
        assert "0.7%" in html

    def test_the_dwell_table_is_withheld_when_attribution_is_unreliable(self):
        html = engagement_section(
            self._stats(),
            [{"screen": "/", "engaged_msec": 5000, "devices": 1, "views": 2}],
            compute_dwell_coverage(7, 1000),
        )
        assert "9.4" not in html

    def test_the_dwell_table_appears_once_attribution_is_reliable(self):
        from scripts.analytics.bq_engagement import compute_screen_dwell

        html = engagement_section(
            self._stats(),
            compute_screen_dwell([
                {"screen": "/panic", "engaged_msec": 5000, "devices": 1, "views": 2}
            ]),
            compute_dwell_coverage(900, 1000),
        )
        assert "/panic" in html


class TestSegmentSection:
    def test_a_small_segment_says_sample_shortage_instead_of_a_rate(self):
        html = segment_section("国", compute_segments([{"segment": "Qatar", "devices": 1, "returned": 0}]))
        assert "サンプル不足" in html

    def test_a_large_enough_segment_shows_its_rate(self):
        html = segment_section("国", compute_segments([{"segment": "Japan", "devices": 10, "returned": 2}]))
        assert "20.0%" in html

    def test_empty_segments_render_a_note(self):
        assert "該当なし" in segment_section("国", [])


class TestBlockerSection:
    def test_no_data_says_it_is_not_measured_yet(self):
        """2.4.0 配信前は0件。挫折率 0% と書いてはいけない。"""
        html = blocker_section(BlockerFunnel(0, 0, 0, 0), [])
        assert "2.4.0" in html

    def test_no_data_does_not_render_a_zero_percent_abandonment(self):
        assert "0.0%" not in blocker_section(BlockerFunnel(0, 0, 0, 0), [])

    def test_abandonment_and_gate_rates_are_shown_once_there_is_data(self):
        html = blocker_section(BlockerFunnel(20, 10, 6, 4), [])
        assert "30.0%" in html  # 挫折率 6/20
        assert "40.0%" in html  # ゲート引き止め率 4/10

    def test_holdout_bands_are_rendered(self):
        html = blocker_section(
            BlockerFunnel(20, 10, 6, 4),
            compute_holdout_buckets([{"hours_enabled": 0, "devices": 6}]),
        )
        assert "1時間未満" in html


class TestDataQualitySection:
    def _quality(self, missing=()):
        return DataQuality(
            first_date=date(2026, 7, 19),
            last_date=date(2026, 8, 6),
            missing_dates=list(missing),
            today=TODAY,
            total_devices=47,
            eligible_devices=39,
        )

    def test_missing_days_are_listed(self):
        assert "2026-08-03" in data_quality_section(self._quality([date(2026, 8, 3)]))

    def test_a_clean_range_says_there_are_no_gaps(self):
        assert "欠測なし" in data_quality_section(self._quality())

    def test_the_provisional_window_is_stated(self):
        assert "72" in data_quality_section(self._quality())

    def test_excluded_devices_are_explained(self):
        """分母が 47 ではなく 39 である理由を書かないと数字が食い違って見える。"""
        html = data_quality_section(self._quality())
        assert "8" in html and "39" in html

    def test_none_quality_renders_a_note_rather_than_crashing(self):
        assert "該当なし" in data_quality_section(None)


class TestScreensPerSessionCaveat:
    """1セッション17画面は自動収集ノイズで膨らんだ数字。

    滞在時間には「計測できていない」と警告を出しておきながら、まったく同じ原因で
    狂っている画面数を素の数字として並べるのは一貫していない。実際に生成した
    HTML を読んで気づいた。
    """

    def _html(self, attributed: int) -> str:
        from scripts.analytics.bq_engagement import (
            compute_dwell_coverage,
            compute_session_stats,
        )

        return engagement_section(
            compute_session_stats([
                {"device_id": "a", "wall_sec": 100, "engaged_sec": 90, "screens": 17}
            ]),
            [],
            compute_dwell_coverage(attributed, 1000),
        )

    def _screens_row(self, html: str) -> str:
        """画面数の行だけを切り出す（後続の注記に巻き込まれないように）。"""
        start = html.index("1セッションの画面数")
        return html[start : html.index("</tr>", start)]

    def test_the_row_is_flagged_when_attribution_is_unreliable(self):
        assert "参考値" in self._screens_row(self._html(attributed=7))

    def test_the_row_is_not_flagged_once_attribution_is_reliable(self):
        # 無効化との対比。付けっぱなしのラベルは警告として機能しない。
        assert "参考値" not in self._screens_row(self._html(attributed=900))
