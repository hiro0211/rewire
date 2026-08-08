"""Tests for cohort selection.

The purchaser cohort is currently 2 devices, so the degenerate sizes (0 and 1)
are not edge cases here — they are the normal operating range. They get the
same weight in this file as the happy path.
"""
from unittest.mock import MagicMock

import pytest

from scripts.analytics.bq_cohort import (
    COHORTS,
    ONBOARDING_COMPLETER,
    PURCHASER,
    Cohort,
    fetch_cohort,
)


def _client(device_ids):
    client = MagicMock()
    client.query.return_value.result.return_value = [
        {"device_id": d} for d in device_ids
    ]
    return client


class TestFetchCohort:
    def test_device_ids_are_returned(self):
        cohort = fetch_cohort(_client(["dev_a", "dev_b"]), PURCHASER)

        assert cohort.device_ids == ["dev_a", "dev_b"]

    def test_cohort_carries_its_label(self):
        """ダッシュボードの見出しに使う。誰を見ているのか画面から分かるように。"""
        assert fetch_cohort(_client([]), PURCHASER).label == PURCHASER.label

    def test_empty_cohort_is_not_an_error(self):
        """課金者0人は本番で普通に起きる。例外ではなく空で返す。"""
        cohort = fetch_cohort(_client([]), PURCHASER)

        assert cohort.device_ids == []

    def test_empty_cohort_reports_zero_size(self):
        assert fetch_cohort(_client([]), PURCHASER).size == 0

    def test_size_reflects_membership(self):
        assert fetch_cohort(_client(["a", "b", "c"]), PURCHASER).size == 3

    def test_query_filters_on_the_defining_event(self):
        """イベント名は SQL 文字列ではなくクエリパラメータで渡す。

        文字列連結だと SQL の字面で検証したくなるが、パラメータ化の方が正しいので
        バインドされた値の側を見る。
        """
        client = _client([])

        fetch_cohort(client, PURCHASER)

        bound = client.query.call_args.kwargs["job_config"].query_parameters
        assert [p.value for p in bound] == [PURCHASER.event]

    def test_different_definitions_bind_different_events(self):
        """コホートを広げる操作が定義の差し替えだけで済むこと。"""
        purchaser_client, completer_client = _client([]), _client([])

        fetch_cohort(purchaser_client, PURCHASER)
        fetch_cohort(completer_client, ONBOARDING_COMPLETER)

        def bound(c):
            return [p.value for p in c.query.call_args.kwargs["job_config"].query_parameters]

        assert bound(purchaser_client) != bound(completer_client)

    def test_uses_the_device_scoped_key(self):
        client = _client([])

        fetch_cohort(client, PURCHASER)

        assert "user_pseudo_id" in client.query.call_args.args[0]


class TestCohortDefinitions:
    def test_purchaser_is_defined_by_the_completed_purchase_event(self):
        """hiro の指定した「ハードペイウォールを乗り越えた人」の定義。"""
        assert PURCHASER.event == "pro_purchase_completed"

    def test_registry_is_keyed_for_cli_selection(self):
        assert COHORTS[PURCHASER.key] is PURCHASER

    def test_a_wider_cohort_is_available_for_when_the_purchaser_count_is_too_small(self):
        """課金者2人では統計にならないので、母数を広げる逃げ道を用意しておく。"""
        assert ONBOARDING_COMPLETER.event == "onboarding_complete"


class TestCohort:
    def test_membership_check(self):
        cohort = Cohort(key="purchaser", label="課金完了者", device_ids=["a"])

        assert cohort.contains("a") and not cohort.contains("b")
