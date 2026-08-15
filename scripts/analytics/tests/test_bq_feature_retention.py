"""Tests for "which feature, used early, predicts coming back".

This is the most tempting place in the whole stack to publish a number that is
noise. At 39 eligible devices most features are used by two or three people, so
the guard that matters more than the arithmetic is the one that refuses to
report a lift when the base is too small.
"""
import pytest

from scripts.analytics.bq_feature_retention import (
    MIN_GROUP_SIZE,
    FeatureLift,
    build_any_feature_lift,
    compute_feature_lifts,
)


def _row(event, used_n, used_ret, unused_n, unused_ret):
    return {
        "event_name": event,
        "used_devices": used_n,
        "used_retained": used_ret,
        "unused_devices": unused_n,
        "unused_retained": unused_ret,
    }


def _big(event, used_ret=8, unused_ret=1):
    """A row whose both arms clear MIN_GROUP_SIZE."""
    n = MIN_GROUP_SIZE
    return _row(event, n, used_ret, n, unused_ret)


class TestSampleGuard:
    def test_a_group_below_the_minimum_is_not_reported(self):
        """n=2 の「継続率100%」を出すくらいなら何も出さないほうがよい。"""
        lifts = compute_feature_lifts([_row("breathing_started", 2, 2, 30, 1)])
        assert lifts[0].is_reportable is False

    def test_both_arms_must_clear_the_minimum(self):
        """比較なので、使った側だけ十分でも意味がない。"""
        lifts = compute_feature_lifts([_row("breathing_started", MIN_GROUP_SIZE, 5, 1, 0)])
        assert lifts[0].is_reportable is False

    def test_a_row_with_both_arms_large_enough_is_reportable(self):
        assert compute_feature_lifts([_big("breathing_started")])[0].is_reportable is True

    def test_unreportable_rows_still_carry_their_counts(self):
        """「サンプル不足」と表示するために、件数自体は残す必要がある。"""
        lift = compute_feature_lifts([_row("breathing_started", 2, 2, 30, 1)])[0]
        assert (lift.used_devices, lift.unused_devices) == (2, 30)

    def test_rate_is_none_when_not_reportable(self):
        """読めない数字はそもそも計算結果として返さない。"""
        lift = compute_feature_lifts([_row("breathing_started", 2, 2, 30, 1)])[0]
        assert lift.used_rate is None and lift.lift is None


class TestLiftArithmetic:
    def test_rates_divide_by_their_own_group(self):
        lift = compute_feature_lifts([_big("breathing_started", used_ret=5, unused_ret=1)])[0]
        assert lift.used_rate == pytest.approx(5 / MIN_GROUP_SIZE)
        assert lift.unused_rate == pytest.approx(1 / MIN_GROUP_SIZE)

    def test_lift_is_the_difference_in_percentage_points(self):
        """比ではなく差。分母が小さいと比は簡単に「10倍」になって誇張される。"""
        lift = compute_feature_lifts([_big("breathing_started", used_ret=5, unused_ret=1)])[0]
        assert lift.lift == pytest.approx(4 / MIN_GROUP_SIZE)

    def test_a_feature_can_have_a_negative_lift(self):
        """使った人のほうが残らない、も結論。符号を潰さない。"""
        lift = compute_feature_lifts([_big("breathing_started", used_ret=1, unused_ret=5)])[0]
        assert lift.lift < 0

    def test_zero_sized_group_does_not_divide_by_zero(self):
        lift = compute_feature_lifts([_row("breathing_started", 0, 0, 0, 0)])[0]
        assert lift.used_rate is None


class TestOrdering:
    def test_reportable_features_come_before_unreportable_ones(self):
        """読める数字を、サンプル不足の行の下に埋もれさせない。"""
        lifts = compute_feature_lifts([
            _row("panic_button_tapped", 2, 2, 30, 1),
            _big("breathing_started"),
        ])
        assert lifts[0].event_name == "breathing_started"

    def test_reportable_features_are_sorted_by_lift_descending(self):
        lifts = compute_feature_lifts([
            _big("panic_button_tapped", used_ret=2),
            _big("breathing_started", used_ret=9),
        ])
        assert [x.event_name for x in lifts[:2]] == [
            "breathing_started",
            "panic_button_tapped",
        ]

    def test_japanese_label_is_attached(self):
        lift = compute_feature_lifts([_big("breathing_started")])[0]
        assert lift.label == "呼吸法 開始"

    def test_unknown_event_falls_back_to_its_raw_name(self):
        assert compute_feature_lifts([_big("mystery_event")])[0].label == "mystery_event"

    def test_no_rows_yields_nothing(self):
        assert compute_feature_lifts([]) == []


class TestAnyFeatureLift:
    """機能を1つでも使ったか、という束ねた比較。

    実測 2026-08-08 で per-feature は全滅（各機能の利用者が2〜4台）だったが、
    束ねると「何か使った 7台は全員復帰、何も使わなかった 32台はほぼ全滅」という
    形が見えた。個別機能では母数が足りないが、束ねれば足りることがある。
    """

    def test_it_is_labelled_as_the_pooled_comparison(self):
        lift = build_any_feature_lift(
            {"used_devices": 12, "used_retained": 11, "unused_devices": 27, "unused_retained": 1}
        )
        assert lift.label == "いずれかの機能を利用"

    def test_it_uses_the_same_sample_guard(self):
        lift = build_any_feature_lift(
            {"used_devices": 7, "used_retained": 7, "unused_devices": 32, "unused_retained": 0}
        )
        assert lift.is_reportable is False

    def test_a_large_enough_pooled_comparison_reports_a_lift(self):
        lift = build_any_feature_lift(
            {"used_devices": 12, "used_retained": 6, "unused_devices": 20, "unused_retained": 2}
        )
        assert lift.lift == pytest.approx(0.5 - 0.1)


class TestImmutability:
    def test_lift_is_frozen(self):
        lift = compute_feature_lifts([_big("breathing_started")])[0]
        assert isinstance(lift, FeatureLift)
        with pytest.raises(Exception):
            lift.used_devices = 1  # type: ignore[misc]
