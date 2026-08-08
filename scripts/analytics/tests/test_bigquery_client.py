"""Tests for the BigQuery query runner.

We mock `bigquery.Client` so tests run without network or service-account
credentials — the same shape as `test_firebase_ga4_client.py`, which mocks
`BetaAnalyticsDataClient`.
"""
from unittest.mock import MagicMock

import pytest
from google.cloud import bigquery

from scripts.analytics.bigquery_client import (
    DEFAULT_MAX_BYTES_BILLED,
    EVENTS_TABLE,
    USER_KEY_COLUMN,
    build_client,
    run_query,
)


def _client_returning(rows):
    """A mock BigQuery client whose query job yields ``rows``."""
    client = MagicMock()
    client.query.return_value.result.return_value = rows
    return client


class TestRunQuery:
    def test_rows_are_returned_as_dicts(self):
        """行が dict のリストとして返る（呼び出し側が Row 型を知らずに済む）。"""
        client = _client_returning([
            {"step_type": "welcome", "devices": 35},
            {"step_type": "features", "devices": 12},
        ])

        assert run_query(client, "SELECT 1") == [
            {"step_type": "welcome", "devices": 35},
            {"step_type": "features", "devices": 12},
        ]

    def test_no_rows_returns_empty_list(self):
        """0件のとき空リストを返す（コホート0人が本番で普通に起きるため）。"""
        assert run_query(_client_returning([]), "SELECT 1") == []

    def test_cost_ceiling_is_applied_to_the_job(self):
        """maximum_bytes_billed が実際に job_config に載っている。

        Blaze 課金が有効なので、この上限が外れると暴走クエリがそのまま課金になる。
        値を渡すだけでなく BigQuery に届いていることをここで固定する。
        """
        client = _client_returning([])

        run_query(client, "SELECT 1")

        job_config = client.query.call_args.kwargs["job_config"]
        assert job_config.maximum_bytes_billed == DEFAULT_MAX_BYTES_BILLED

    def test_cost_ceiling_can_be_overridden(self):
        client = _client_returning([])

        run_query(client, "SELECT 1", max_bytes_billed=5_000)

        assert client.query.call_args.kwargs["job_config"].maximum_bytes_billed == 5_000

    def test_query_parameters_reach_the_job(self):
        """パラメータが job_config に渡る（文字列連結による SQL 組み立てを避けるため）。

        QueryJobConfig は代入時に API 表現へ変換するので、MagicMock ではなく
        実物の ScalarQueryParameter を渡して往復を検証する。
        """
        client = _client_returning([])
        param = bigquery.ScalarQueryParameter("since", "STRING", "20260719")

        run_query(client, "SELECT @since", params=[param])

        assert client.query.call_args.kwargs["job_config"].query_parameters == [param]


class TestBuildClient:
    def test_empty_credentials_path_is_rejected(self):
        """鍵パス未設定を早期に弾く（黙って ADC に落ちると誰の権限で読んだか不明になる）。"""
        with pytest.raises(ValueError, match="credentials_path"):
            build_client("")


class TestConstants:
    def test_user_key_is_device_scoped(self):
        """`user_id` は全行 NULL（2.4.0 未配信）なので端末単位キーを使う。

        2.4.0 が浸透したらこの定数を 'user_id' に変える。そのとき
        このテストが落ちることで、切り替えが意図的だったと分かる。
        """
        assert USER_KEY_COLUMN == "user_pseudo_id"

    def test_events_table_is_a_wildcard_over_daily_tables(self):
        assert EVENTS_TABLE == "`rewire-4a491.analytics_526015389.events_*`"
