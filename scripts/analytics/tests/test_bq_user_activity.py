"""Tests for per-user activity (recency, frequency, screens, features)."""
from datetime import date
from unittest.mock import MagicMock

import pytest

from scripts.analytics.bq_cohort import Cohort
from scripts.analytics.bq_user_activity import (
    FEATURE_EVENTS,
    UserActivity,
    fetch_user_activity,
)


def _cohort(*device_ids):
    return Cohort(key="purchaser", label="課金完了者", device_ids=list(device_ids))


def _client(summary_rows, breakdown_rows):
    """A client whose two queries return summary rows then breakdown rows."""
    client = MagicMock()
    client.query.return_value.result.side_effect = [summary_rows, breakdown_rows]
    return client


def _summary(device_id="dev_a", first="2026-07-20", last="2026-08-06",
             active_days=12, sessions=20):
    return {
        "device_id": device_id,
        "first_seen": date.fromisoformat(first),
        "last_seen": date.fromisoformat(last),
        "active_days": active_days,
        "sessions": sessions,
    }


TODAY = date(2026, 8, 8)


class TestFetchUserActivity:
    def test_empty_cohort_runs_no_query(self):
        """空コホートで IN () の不正な SQL を投げない。課金者0人は普通に起きる。"""
        client = MagicMock()

        assert fetch_user_activity(client, _cohort(), today=TODAY) == []
        client.query.assert_not_called()

    def test_recency_is_days_since_last_seen(self):
        """「いつ使ったか」の答え。基準日は引数で受ける（テストを日付に依存させない）。"""
        client = _client([_summary(last="2026-08-06")], [])

        activity = fetch_user_activity(client, _cohort("dev_a"), today=TODAY)

        assert activity[0].days_since_last_seen == 2

    def test_frequency_is_sessions_per_active_day(self):
        """「どれくらいの頻度で使ったか」の答え。"""
        client = _client([_summary(active_days=10, sessions=25)], [])

        activity = fetch_user_activity(client, _cohort("dev_a"), today=TODAY)

        assert activity[0].sessions_per_active_day == pytest.approx(2.5)

    def test_zero_active_days_does_not_divide_by_zero(self):
        client = _client([_summary(active_days=0, sessions=0)], [])

        activity = fetch_user_activity(client, _cohort("dev_a"), today=TODAY)

        assert activity[0].sessions_per_active_day == 0.0

    def test_screens_are_attached_to_the_right_device(self):
        """「どのページをよく使うか」。端末をまたいで混ざらないこと。"""
        client = _client(
            [_summary(device_id="dev_a"), _summary(device_id="dev_b")],
            [
                {"device_id": "dev_a", "kind": "screen", "name": "/profile", "n": 9},
                {"device_id": "dev_b", "kind": "screen", "name": "/learn", "n": 4},
            ],
        )

        by_id = {a.device_id: a for a in fetch_user_activity(client, _cohort("dev_a", "dev_b"), today=TODAY)}

        assert by_id["dev_a"].top_screens == [("/profile", 9)]
        assert by_id["dev_b"].top_screens == [("/learn", 4)]

    def test_screens_are_ordered_by_use_descending(self):
        """「よく使っている」順。上位が先頭に来ないと一覧の意味がない。"""
        client = _client(
            [_summary()],
            [
                {"device_id": "dev_a", "kind": "screen", "name": "/learn", "n": 3},
                {"device_id": "dev_a", "kind": "screen", "name": "/", "n": 21},
            ],
        )

        activity = fetch_user_activity(client, _cohort("dev_a"), today=TODAY)

        assert [s for s, _ in activity[0].top_screens] == ["/", "/learn"]

    def test_features_are_separated_from_screens(self):
        client = _client(
            [_summary()],
            [
                {"device_id": "dev_a", "kind": "screen", "name": "/", "n": 5},
                {"device_id": "dev_a", "kind": "feature", "name": "breathing_started", "n": 8},
            ],
        )

        activity = fetch_user_activity(client, _cohort("dev_a"), today=TODAY)

        assert activity[0].top_screens == [("/", 5)]
        assert activity[0].top_features == [("breathing_started", 8)]

    def test_a_device_with_no_breakdown_still_appears(self):
        """画面イベントが無くても一覧から消えない（消すと母数が狂う）。"""
        client = _client([_summary()], [])

        activity = fetch_user_activity(client, _cohort("dev_a"), today=TODAY)

        assert activity[0].top_screens == [] and activity[0].top_features == []

    def test_users_are_ordered_by_most_recent_use(self):
        """直近に使っている人が上。休眠から見たいわけではない。"""
        client = _client(
            [_summary(device_id="stale", last="2026-07-25"),
             _summary(device_id="fresh", last="2026-08-06")],
            [],
        )

        activity = fetch_user_activity(client, _cohort("stale", "fresh"), today=TODAY)

        assert [a.device_id for a in activity] == ["fresh", "stale"]

    def test_cohort_is_bound_as_a_parameter(self):
        """端末IDを SQL に直接埋めない。"""
        client = _client([], [])

        fetch_user_activity(client, _cohort("dev_a", "dev_b"), today=TODAY)

        bound = client.query.call_args_list[0].kwargs["job_config"].query_parameters
        assert any(p.values == ["dev_a", "dev_b"] for p in bound)


class TestQueryShape:
    def _sql(self, index):
        client = _client([], [])
        fetch_user_activity(client, _cohort("dev_a"), today=TODAY)
        return client.query.call_args_list[index].args[0]

    def test_screen_names_come_from_firebase_screen(self):
        """実測: pathname は `firebase_screen` にのみ入る（714行）。

        `firebase_screen_class` は iOS 自動収集の RNSScreen / UIViewController が
        混ざるため使えない。ここを取り違えると画面一覧がゴミで埋まる。
        """
        assert "firebase_screen" in self._sql(1)

    def test_only_app_pathnames_are_counted_as_screens(self):
        """RNSScreen 等の自動収集値を除くフィルタが入っていること。"""
        assert "'/%'" in self._sql(1)

    def test_all_feature_events_are_in_the_query(self):
        """1つ漏れるとその機能は「誰も使っていない」ように見える。"""
        sql = self._sql(1)
        assert all(event in sql for event in FEATURE_EVENTS)
