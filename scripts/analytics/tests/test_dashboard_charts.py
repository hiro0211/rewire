"""Tests for the dependency-free chart primitives.

The one that matters most is `intensity`. While verifying the heatmap against
real data, a naive `round(value / peak * steps)` mapped a cell of 1 (peak 85) to
step 0 — the same step as "no data". A used hour rendered emptier than an
unused one. Caught by looking at the output, not by any test, so it gets one.
"""
import pytest

from scripts.analytics.dashboard_charts import (
    HEATMAP_STEPS,
    heatmap_html,
    intensity,
    rate_cell,
)


class TestIntensity:
    def test_zero_is_step_zero(self):
        assert intensity(0, 100) == 0

    def test_any_nonzero_value_is_at_least_step_one(self):
        """1件を「無し」と同じ見た目にしない。

        peak が大きいと素直な比例計算は小さい値を 0 に丸め、
        使われた枠が未使用の枠より薄く見えるという逆転が起きる。
        """
        assert intensity(1, 10_000) >= 1

    def test_the_peak_is_the_top_step(self):
        assert intensity(85, 85) == HEATMAP_STEPS

    def test_intensity_increases_with_value(self):
        assert intensity(10, 100) < intensity(90, 100)

    def test_zero_peak_does_not_divide_by_zero(self):
        assert intensity(0, 0) == 0

    def test_value_above_peak_is_clamped(self):
        assert intensity(200, 100) == HEATMAP_STEPS


class TestHeatmapHtml:
    def _grid(self):
        grid = [[0] * 24 for _ in range(7)]
        grid[2][15] = 85
        grid[0][1] = 1
        return grid

    def test_every_row_label_appears(self):
        html = heatmap_html(self._grid(), ("日", "月", "火", "水", "木", "金", "土"))
        for label in ("日", "月", "火", "水", "木", "金", "土"):
            assert f">{label}<" in html

    def test_a_used_cell_carries_a_background_colour(self):
        html = heatmap_html(self._grid(), ("日", "月", "火", "水", "木", "金", "土"))
        assert "background:" in html

    def test_the_value_is_in_the_cell_title_for_hover(self):
        """セルが小さすぎて数字を書けないので、値は title 属性で読めるようにする。"""
        html = heatmap_html(self._grid(), ("日", "月", "火", "水", "木", "金", "土"))
        assert "85" in html

    def test_an_all_zero_grid_still_renders(self):
        html = heatmap_html([[0] * 24 for _ in range(7)], tuple("日月火水木金土"))
        assert "<table" in html

    def test_no_external_resources_are_referenced(self):
        """CSP・オフライン閲覧のため、CDN も外部フォントも使わない。"""
        html = heatmap_html(self._grid(), tuple("日月火水木金土"))
        assert "http://" not in html and "https://" not in html

    def test_row_label_count_must_match_the_grid(self):
        with pytest.raises(ValueError):
            heatmap_html([[0] * 24 for _ in range(7)], ("日", "月"))


class TestRateCell:
    def test_a_rate_is_rendered_as_a_percentage(self):
        assert "40" in rate_cell(0.4)

    def test_none_renders_as_a_dash_not_zero(self):
        """未成熟・サンプル不足を 0% と書かない。"""
        assert rate_cell(None) == "—"

    def test_zero_is_rendered_as_zero_not_a_dash(self):
        """本当に 0% だったことは、分からないこととは違う。"""
        assert rate_cell(0.0) != "—"
