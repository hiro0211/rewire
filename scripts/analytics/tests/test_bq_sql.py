"""Tests for the shared SQL fragments.

Everything here is pure string building, so these run without BigQuery. What
they pin down is the handful of GA4-export facts that have already cost us a
silently-empty result once each — the `double_value` trap, the UTC/JST split,
and reading install date from the export rather than from the app.
"""
import re
from datetime import date

import pytest

from scripts.analytics.bq_sql import (
    DAYS_SINCE_INSTALL,
    EVENT_DATE_JST,
    EVENT_HOUR_JST,
    EVENT_WEEKDAY_JST,
    INSTALL_DATE,
    param_bool,
    param_number,
    param_string,
    table_suffix_between,
    user_property_string,
)


class TestParamNumber:
    """RN の Firebase SDK は JS number を double で送る。"""

    def test_reads_both_int_and_double_columns(self):
        """`double_value` を読まないと数値パラメータは丸ごと空になる。

        実測 2026-08-08: `step_index` は 944 行すべてが double_value、
        int_value は 0 行。int_value だけを見たファネルは空だった。
        """
        sql = param_number("step_index")
        assert "double_value" in sql
        assert "int_value" in sql

    def test_double_is_the_fallback_not_the_primary(self):
        """int_value を先に見る（将来ネイティブが整数で送っても壊れない）。"""
        sql = param_number("step_index")
        assert sql.index("int_value") < sql.index("double_value")

    def test_the_key_appears_for_every_column_read(self):
        """片方の列だけ別のキーを見る、という取り違えを防ぐ。"""
        assert param_number("goal_days").count("'goal_days'") == 2


class TestParamAccessors:
    def test_string_param_reads_the_string_column(self):
        sql = param_string("source")
        assert "string_value" in sql and "'source'" in sql

    def test_bool_param_reads_the_int_column(self):
        """boolean は int_value に 0/1 で入る（実測: granted / cancelled）。"""
        sql = param_bool("granted")
        assert "int_value" in sql and "'granted'" in sql

    def test_user_property_reads_the_user_properties_array(self):
        """event_params と user_properties は別の配列。混同すると常に NULL。"""
        sql = user_property_string("is_pro")
        assert "user_properties" in sql
        assert "event_params" not in sql

    @pytest.mark.parametrize("evil", ["a' OR '1'='1", "key; DROP TABLE x", "key-with-dash", ""])
    def test_keys_that_are_not_plain_identifiers_are_rejected(self, evil):
        """キーは SQL に直に埋まるので、識別子以外は組み立てさせない。"""
        with pytest.raises(ValueError):
            param_string(evil)


class TestTimeFragments:
    """`event_date` は JST だが `event_timestamp` は UTC。混ぜると1日ずれる。"""

    def test_hour_is_converted_to_tokyo(self):
        """UTC のまま時間帯を出すと、日本のユーザーの深夜が昼に見える。"""
        assert "Asia/Tokyo" in EVENT_HOUR_JST
        assert "event_timestamp" in EVENT_HOUR_JST

    def test_weekday_is_converted_to_tokyo(self):
        assert "Asia/Tokyo" in EVENT_WEEKDAY_JST

    def test_event_date_is_parsed_not_recomputed(self):
        """`event_date` はすでにプロパティTZ（JST）の日付なので、
        タイムゾーン変換をかけ直してはいけない。"""
        assert "PARSE_DATE" in EVENT_DATE_JST
        assert "Asia/Tokyo" not in EVENT_DATE_JST


class TestInstallDate:
    def test_install_date_comes_from_the_export_not_the_app(self):
        """アプリ送信の days_since_install は実測で誤っていた（0 と送って実際は52日目）。

        `user_first_touch_timestamp` は全行に入っていて遡及的に正しいので、
        インストール日はそこから導出する。
        """
        assert "user_first_touch_timestamp" in INSTALL_DATE
        assert "Asia/Tokyo" in INSTALL_DATE

    def test_days_since_install_is_a_date_diff_from_install_date(self):
        assert "DATE_DIFF" in DAYS_SINCE_INSTALL
        assert "user_first_touch_timestamp" in DAYS_SINCE_INSTALL


class TestTableSuffixFilter:
    def test_bounds_the_wildcard_scan_by_date(self):
        """`events_*` の全期間スキャンを避ける。データが増えるほど効く。"""
        sql = table_suffix_between(date(2026, 7, 19), date(2026, 8, 6))
        assert "_TABLE_SUFFIX" in sql
        assert "20260719" in sql
        assert "20260806" in sql

    def test_intraday_tables_are_excluded(self):
        """`events_intraday_YYYYMMDD` は日次テーブルと二重計上になる。

        ストリーミングは現在 OFF だが、誰かが有効化した瞬間に
        全部の数字が倍近くなるのを防ぐ。
        """
        sql = table_suffix_between(date(2026, 7, 19), date(2026, 8, 6))
        # 数字8桁の suffix しか通さない形になっていること
        assert re.search(r"_TABLE_SUFFIX\s+BETWEEN", sql)

    def test_reversed_range_is_rejected(self):
        with pytest.raises(ValueError):
            table_suffix_between(date(2026, 8, 6), date(2026, 7, 19))
