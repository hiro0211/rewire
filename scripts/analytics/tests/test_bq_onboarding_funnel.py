"""Tests for the onboarding drop-off funnel.

The drop-rate maths is a pure function over rows, so most of this file needs no
mock at all. Only the query-shape tests touch a fake BigQuery client.
"""
from unittest.mock import MagicMock

import pytest

from scripts.analytics.bq_onboarding_funnel import (
    CONVERSION_STAGES,
    FunnelStep,
    biggest_drop,
    compute_drop_offs,
    fetch_conversion_funnel,
    fetch_funnel,
)


def _rows(*pairs):
    """Build raw query rows: (step_index, step_type, devices)."""
    return [
        {"step_index": i, "step_type": t, "devices": d} for i, t, d in pairs
    ]


class TestComputeDropOffs:
    def test_first_step_has_no_drop(self):
        """先頭ステップには「前のステップ」が無いので脱落0。"""
        steps = compute_drop_offs(_rows((0, "welcome", 35)))

        assert steps[0].dropped == 0

    def test_drop_is_the_difference_from_the_previous_step(self):
        steps = compute_drop_offs(_rows((0, "welcome", 35), (1, "survey", 31)))

        assert steps[1].dropped == 4

    def test_drop_rate_is_relative_to_the_previous_step(self):
        """脱落率の分母は「全体」ではなく「直前ステップの到達数」。

        全体を分母にすると、後半のステップほど率が小さく見えて
        「どこで一番落ちたか」を見誤る。
        """
        steps = compute_drop_offs(_rows((0, "welcome", 40), (1, "survey", 30)))

        assert steps[1].drop_rate == pytest.approx(0.25)

    def test_zero_previous_devices_does_not_divide_by_zero(self):
        """到達0のステップの次でも落ちない（データ欠測時に普通に起きる）。"""
        steps = compute_drop_offs(_rows((0, "welcome", 0), (1, "survey", 0)))

        assert steps[1].drop_rate == 0.0

    def test_empty_input_returns_empty(self):
        assert compute_drop_offs([]) == []

    def test_steps_are_ordered_by_index(self):
        """SQL の並びに依存せず step_index 昇順に整える。"""
        steps = compute_drop_offs(_rows((2, "features", 12), (0, "welcome", 35), (1, "survey", 31)))

        assert [s.step_index for s in steps] == [0, 1, 2]

    def test_a_step_that_gained_devices_is_not_a_negative_drop(self):
        """後段の方が到達数が多いという逆転（歯抜けセッション）で負値を出さない。"""
        steps = compute_drop_offs(_rows((0, "welcome", 10), (1, "survey", 12)))

        assert steps[1].dropped == 0


class TestBiggestDrop:
    def test_returns_the_step_with_the_largest_drop_rate(self):
        """「どこで脱落しているのか」への直接の答え。"""
        steps = compute_drop_offs(
            _rows((0, "welcome", 100), (1, "survey", 90), (2, "education", 45), (3, "features", 40))
        )

        assert biggest_drop(steps).step_type == "education"

    def test_returns_none_when_there_is_no_second_step(self):
        assert biggest_drop(compute_drop_offs(_rows((0, "welcome", 35)))) is None

    def test_returns_none_for_empty_funnel(self):
        assert biggest_drop([]) is None


class TestFetchFunnel:
    def test_queries_the_onboarding_step_event(self):
        """入力は onboarding_step_viewed のみ。ここが変わるとファネル全体が空になる。"""
        client = MagicMock()
        client.query.return_value.result.return_value = []

        fetch_funnel(client)

        assert "onboarding_step_viewed" in client.query.call_args.args[0]

    def test_uses_the_device_scoped_key_not_user_id(self):
        """user_id は全行 NULL なので、これを使うとファネルが常に空になる。"""
        client = MagicMock()
        client.query.return_value.result.return_value = []

        fetch_funnel(client)

        assert "user_pseudo_id" in client.query.call_args.args[0]

    def test_step_index_is_read_from_double_value(self):
        """`step_index` は GA4 上 `double_value` に入る（実測）。

        React Native の Firebase SDK は JS の number を double として送るため、
        `int_value` だけを見るとファネルが丸ごと空になる。実データで確認済み:
        step_index の 944 行すべてが double_value、int_value は 0 行。
        モックのテストでは捕まらないので、SQL の字面をここで固定する。
        """
        client = MagicMock()
        client.query.return_value.result.return_value = []

        fetch_funnel(client)

        assert "double_value" in client.query.call_args.args[0]

    def test_rows_become_funnel_steps_with_drops(self):
        client = MagicMock()
        client.query.return_value.result.return_value = _rows(
            (0, "welcome", 35), (1, "survey", 31)
        )

        steps = fetch_funnel(client)

        assert steps == [
            FunnelStep(step_index=0, step_type="welcome", devices=35, dropped=0, drop_rate=0.0),
            FunnelStep(
                step_index=1, step_type="survey", devices=31, dropped=4,
                drop_rate=pytest.approx(4 / 35),
            ),
        ]


class TestFetchConversionFunnel:
    """オンボ完了 → ペイウォール → 購入 の後段ファネル。

    実測では「オンボ自体はほぼ脱落しない（35端末中30が最終ステップに到達）」ため、
    hiro が探している脱落点はこちら側にある。
    """

    def _client(self, counts):
        client = MagicMock()
        client.query.return_value.result.return_value = [
            {"event_name": name, "devices": n} for name, n in counts.items()
        ]
        return client

    def test_stages_are_in_conversion_order_not_query_order(self):
        """BigQuery の GROUP BY は順不同なので、定義順に並べ直す。"""
        stages = fetch_conversion_funnel(
            self._client({"pro_purchase_completed": 2, "onboarding_complete": 29,
                          "paywall_viewed": 32, "benefits_screen_viewed": 29,
                          "purchase_initiated": 7})
        )

        assert [s.step_type for s in stages] == [label for _, label in CONVERSION_STAGES]

    def test_missing_event_counts_as_zero(self):
        """一度も発火していないイベントは行が返らない。欠落ではなく0として扱う。"""
        stages = fetch_conversion_funnel(self._client({"onboarding_complete": 29}))

        assert stages[-1].devices == 0

    def test_drop_between_stages_is_computed(self):
        stages = fetch_conversion_funnel(
            self._client({"onboarding_complete": 30, "benefits_screen_viewed": 15})
        )

        assert stages[1].dropped == 15

    def test_all_stage_events_are_in_the_query(self):
        """1つでも SQL から漏れるとその段が常に0になり、偽の脱落点を作る。"""
        client = self._client({})

        fetch_conversion_funnel(client)

        sql = client.query.call_args.args[0]
        assert all(event in sql for event, _ in CONVERSION_STAGES)

    def test_empty_result_yields_all_zero_stages(self):
        stages = fetch_conversion_funnel(self._client({}))

        assert [s.devices for s in stages] == [0] * len(CONVERSION_STAGES)
