"""Tests for the content-blocker abandonment analysis.

The question: of the people who switch porn blocking on, how many give up, how
long do they last, and does the breathing gate talk any of them out of it.

⚠️ The events these read (`blocker_enabled`, `blocker_disable_*`) ship with
2.4.0. Until that build is in users' hands every query returns nothing, so the
"no data yet" path is tested as carefully as the arithmetic — an empty result
must read as "not measured yet", never as "nobody gives up".
"""
import pytest

from scripts.analytics.bq_blocker import (
    HOLDOUT_BANDS,
    BlockerFunnel,
    compute_holdout_buckets,
)


def _funnel(enabled=20, requested=10, confirmed=6, cancelled=4):
    return BlockerFunnel(
        enabled_devices=enabled,
        disable_requested_devices=requested,
        disable_confirmed_devices=confirmed,
        disable_cancelled_devices=cancelled,
    )


class TestAbandonment:
    def test_abandonment_is_confirmed_over_enabled(self):
        """ブロックを始めた人のうち、実際に解除まで行った割合＝挫折率。"""
        assert _funnel(enabled=20, confirmed=6).abandonment_rate == pytest.approx(0.3)

    def test_no_one_enabled_yields_none_not_zero(self):
        """まだ誰も使っていないことを「挫折率0%」と書かない。"""
        assert _funnel(enabled=0, requested=0, confirmed=0, cancelled=0).abandonment_rate is None

    def test_has_data_is_false_before_the_events_ship(self):
        assert _funnel(0, 0, 0, 0).has_data is False

    def test_has_data_is_true_once_anyone_enables_it(self):
        assert _funnel(enabled=1, requested=0, confirmed=0, cancelled=0).has_data is True


class TestGateEffect:
    def test_gate_save_rate_is_cancelled_over_requested(self):
        """呼吸ゲートを見せた回数のうち、思いとどまった割合。

        これが機能の存在価値そのものなので、confirmed だけでなく
        cancelled を送っている意味がここに出る。
        """
        assert _funnel(requested=10, cancelled=4).gate_save_rate == pytest.approx(0.4)

    def test_no_requests_yields_none(self):
        assert _funnel(requested=0, confirmed=0, cancelled=0).gate_save_rate is None

    def test_rate_survives_counts_that_do_not_add_up(self):
        """requested の後アプリを落とすと confirmed も cancelled も来ない。

        欠測は現実に起きる。合計が合わないことを理由に例外を投げない。
        """
        assert _funnel(requested=10, confirmed=2, cancelled=1).gate_save_rate == pytest.approx(0.1)


class TestHoldoutBuckets:
    def test_hours_are_grouped_into_bands(self):
        buckets = compute_holdout_buckets([
            {"hours_enabled": 0, "devices": 5},
            {"hours_enabled": 100, "devices": 1},
        ])
        by_label = {b.label: b.devices for b in buckets}
        assert by_label["1時間未満"] == 5

    def test_immediate_disable_is_its_own_band(self):
        """ONにした直後の解除は最も強い挫折シグナル。1〜6時間に混ぜない。"""
        assert HOLDOUT_BANDS[0][0] == "1時間未満"

    def test_share_is_relative_to_everyone_who_disabled(self):
        buckets = compute_holdout_buckets([
            {"hours_enabled": 0, "devices": 3},
            {"hours_enabled": 50, "devices": 1},
        ])
        first = next(b for b in buckets if b.label == "1時間未満")
        assert first.share == pytest.approx(0.75)

    def test_every_band_is_emitted_even_when_empty(self):
        """「1週間以上持った人が0人」は空欄ではなく 0 と書くべき結果。"""
        buckets = compute_holdout_buckets([{"hours_enabled": 0, "devices": 2}])
        assert len(buckets) == len(HOLDOUT_BANDS)

    def test_no_data_yields_no_buckets(self):
        assert compute_holdout_buckets([]) == []

    def test_rows_without_an_hours_value_are_ignored(self):
        """有効化の記録が無い端末は hours_enabled を送らない（§ useBlockerAnalytics）。"""
        buckets = compute_holdout_buckets([
            {"hours_enabled": None, "devices": 3},
            {"hours_enabled": 2, "devices": 1},
        ])
        assert sum(b.devices for b in buckets) == 1
