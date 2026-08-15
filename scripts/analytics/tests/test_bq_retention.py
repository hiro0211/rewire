"""Tests for install-date cohort retention.

All the maths is pure, so these run without BigQuery. The two things they exist
to protect are the ones that quietly turn a retention table into a lie:

  - an immature cell (the day has not happened yet) rendered as 0%
  - a cohort whose day 0 predates the export, so its denominator is wrong
"""
from datetime import date

import pytest

from scripts.analytics.bq_retention import (
    DEFAULT_OFFSETS,
    LifespanBucket,
    RetentionCohort,
    compute_lifespan_buckets,
    compute_retention_curve,
    is_offset_mature,
    summarise_offset,
)

TODAY = date(2026, 8, 8)


def _sizes(*pairs):
    return [{"cohort_date": d, "devices": n} for d, n in pairs]


def _activity(*triples):
    return [
        {"cohort_date": d, "day_offset": o, "devices": n} for d, o, n in triples
    ]


class TestMaturity:
    """「まだ来ていない日」を 0% と表示しないための判定。"""

    def test_offset_is_mature_only_after_that_day_has_fully_passed(self):
        # 8/5 インストールの D1 は 8/6。今日が 8/8 なら 8/6 は完全に過ぎている。
        assert is_offset_mature(date(2026, 8, 5), 1, TODAY) is True

    def test_today_itself_is_not_mature(self):
        """D1 が今日に当たるコホートは、まだ1日分のデータが揃っていない。

        揃う前に数えると、その日の朝に集計しただけで継続率が落ちて見える。
        """
        assert is_offset_mature(date(2026, 8, 7), 1, TODAY) is False

    def test_future_offset_is_not_mature(self):
        assert is_offset_mature(date(2026, 8, 5), 30, TODAY) is False


class TestComputeRetentionCurve:
    def test_retained_counts_are_placed_at_their_offset(self):
        cohorts = compute_retention_curve(
            sizes=_sizes((date(2026, 7, 20), 10)),
            activity=_activity(
                (date(2026, 7, 20), 0, 10),
                (date(2026, 7, 20), 1, 4),
                (date(2026, 7, 20), 7, 2),
            ),
            today=TODAY,
            offsets=(1, 7),
        )
        assert cohorts[0].retained == {1: 4, 7: 2}

    def test_an_offset_with_no_activity_row_is_zero_not_missing(self):
        """誰も戻らなかった日は「0人」であって「データなし」ではない。

        行が無いのを欠測扱いにすると、最悪の継続率が表から消える。
        """
        cohorts = compute_retention_curve(
            sizes=_sizes((date(2026, 7, 20), 10)),
            activity=_activity((date(2026, 7, 20), 0, 10)),
            today=TODAY,
            offsets=(1,),
        )
        assert cohorts[0].retained[1] == 0

    def test_immature_offset_is_none_not_zero(self):
        """成熟前は None。これを 0 にすると「直近コホートは全滅」と読める。"""
        cohorts = compute_retention_curve(
            sizes=_sizes((date(2026, 8, 7), 5)),
            activity=_activity((date(2026, 8, 7), 0, 5)),
            today=TODAY,
            offsets=(1, 7),
        )
        assert cohorts[0].retained == {1: None, 7: None}

    def test_rate_is_none_when_the_offset_is_immature(self):
        cohorts = compute_retention_curve(
            sizes=_sizes((date(2026, 8, 7), 5)),
            activity=_activity((date(2026, 8, 7), 0, 5)),
            today=TODAY,
            offsets=(1,),
        )
        assert cohorts[0].rate(1) is None

    def test_rate_divides_by_the_cohort_size(self):
        cohorts = compute_retention_curve(
            sizes=_sizes((date(2026, 7, 20), 10)),
            activity=_activity((date(2026, 7, 20), 1, 4)),
            today=TODAY,
            offsets=(1,),
        )
        assert cohorts[0].rate(1) == pytest.approx(0.4)

    def test_cohort_size_comes_from_the_size_rows_not_from_offset_zero(self):
        """深夜インストールは初回イベントが翌日になり、offset 0 の行を持たない。

        offset 0 を分母にすると、その端末が分母から消えて継続率が過大に出る。
        """
        cohorts = compute_retention_curve(
            sizes=_sizes((date(2026, 7, 20), 10)),
            activity=_activity(
                (date(2026, 7, 20), 0, 9),  # 1台は day0 に活動なし
                (date(2026, 7, 20), 1, 5),
            ),
            today=TODAY,
            offsets=(1,),
        )
        assert cohorts[0].size == 10
        assert cohorts[0].rate(1) == pytest.approx(0.5)

    def test_cohorts_are_returned_newest_first(self):
        cohorts = compute_retention_curve(
            sizes=_sizes((date(2026, 7, 20), 3), (date(2026, 7, 25), 4)),
            activity=[],
            today=TODAY,
            offsets=(1,),
        )
        assert [c.cohort_date for c in cohorts] == [
            date(2026, 7, 25),
            date(2026, 7, 20),
        ]

    def test_zero_size_cohort_does_not_divide_by_zero(self):
        cohorts = compute_retention_curve(
            sizes=_sizes((date(2026, 7, 20), 0)),
            activity=[],
            today=TODAY,
            offsets=(1,),
        )
        assert cohorts[0].rate(1) is None


class TestSummariseOffset:
    """コホート横断の集計。母数が小さいのでこれが実質の主指標になる。"""

    def test_only_mature_cohorts_contribute(self):
        cohorts = compute_retention_curve(
            sizes=_sizes((date(2026, 7, 20), 10), (date(2026, 8, 7), 5)),
            activity=_activity(
                (date(2026, 7, 20), 1, 3),
                (date(2026, 8, 7), 1, 5),  # 未成熟。混ぜてはいけない
            ),
            today=TODAY,
            offsets=(1,),
        )
        summary = summarise_offset(cohorts, 1)
        assert (summary.retained, summary.total) == (3, 10)

    def test_rate_is_none_when_no_cohort_is_mature(self):
        cohorts = compute_retention_curve(
            sizes=_sizes((date(2026, 8, 7), 5)),
            activity=_activity((date(2026, 8, 7), 1, 5)),
            today=TODAY,
            offsets=(1,),
        )
        assert summarise_offset(cohorts, 1).rate is None


class TestLifespanBuckets:
    def test_devices_are_grouped_into_readable_bands(self):
        buckets = compute_lifespan_buckets([
            {"lifespan_days": 0, "devices": 38},
            {"lifespan_days": 2, "devices": 3},
            {"lifespan_days": 13, "devices": 1},
        ])
        by_label = {b.label: b.devices for b in buckets}
        assert by_label["0日（初日のみ）"] == 38

    def test_share_is_relative_to_all_devices(self):
        buckets = compute_lifespan_buckets([
            {"lifespan_days": 0, "devices": 3},
            {"lifespan_days": 5, "devices": 1},
        ])
        first = next(b for b in buckets if b.label == "0日（初日のみ）")
        assert first.share == pytest.approx(0.75)

    def test_empty_input_yields_no_buckets(self):
        assert compute_lifespan_buckets([]) == []

    def test_all_bands_are_present_even_when_empty(self):
        """空のバンドを落とすと「7日以上使う人がいない」ことが表から見えなくなる。"""
        buckets = compute_lifespan_buckets([{"lifespan_days": 0, "devices": 5}])
        assert len(buckets) >= 4
        assert all(isinstance(b, LifespanBucket) for b in buckets)


class TestDefaults:
    def test_default_offsets_cover_the_standard_reporting_points(self):
        assert DEFAULT_OFFSETS == (1, 3, 7, 14, 30)

    def test_retention_cohort_is_immutable(self):
        """描画側が集計値を書き換えられないようにする。"""
        cohort = RetentionCohort(
            cohort_date=date(2026, 7, 20), size=1, retained={1: 0}
        )
        with pytest.raises(Exception):
            cohort.size = 2  # type: ignore[misc]
