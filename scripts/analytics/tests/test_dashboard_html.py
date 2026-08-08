"""Tests for dashboard rendering.

Rendering only — these tests never touch BigQuery. They pin the things that
would silently mislead hiro if they broke: an empty cohort looking like data,
the biggest drop-off not being called out, and unescaped values.
"""
from datetime import date

import pytest

from scripts.analytics.bq_cohort import Cohort
from scripts.analytics.bq_onboarding_funnel import compute_drop_offs
from scripts.analytics.bq_user_activity import UserActivity
from scripts.analytics.dashboard_html import build_dashboard_html


TODAY = date(2026, 8, 8)


def _steps(*triples):
    return compute_drop_offs(
        [{"step_index": i, "step_type": t, "devices": d} for i, t, d in triples]
    )


def _activity(device_id="A5176B88", screens=None, features=None):
    return UserActivity(
        device_id=device_id,
        first_seen=date(2026, 7, 20),
        last_seen=date(2026, 8, 6),
        active_days=3,
        sessions=4,
        days_since_last_seen=2,
        sessions_per_active_day=1.33,
        top_screens=screens if screens is not None else [("/", 15)],
        top_features=features if features is not None else [("quick_action_tapped", 4)],
    )


def _render(cohort=None, onboarding=None, conversion=None, activity=None):
    return build_dashboard_html(
        generated_on=TODAY,
        cohort=cohort if cohort is not None else Cohort("purchaser", "課金完了者", ["A5176B88"]),
        onboarding_steps=onboarding if onboarding is not None else _steps((0, "welcome", 35)),
        conversion_stages=conversion if conversion is not None else _steps((0, "オンボ完了", 29)),
        activity=activity if activity is not None else [_activity()],
    )


class TestEmptyStates:
    def test_empty_cohort_says_so_instead_of_showing_a_blank_table(self):
        """0人を空表で出すと「データが無い」のか「0人」なのか分からない。"""
        html = _render(cohort=Cohort("purchaser", "課金完了者", []), activity=[])

        assert "該当なし" in html

    def test_empty_onboarding_funnel_says_so(self):
        html = _render(onboarding=[])

        assert "該当なし" in html

    def test_empty_everything_still_renders_a_document(self):
        html = _render(cohort=Cohort("purchaser", "課金完了者", []),
                       onboarding=[], conversion=[], activity=[])

        assert html.strip().startswith("<!DOCTYPE") or "<html" in html


class TestContent:
    def test_cohort_label_is_shown(self):
        """誰を見ているのか画面から分かること。"""
        assert "課金完了者" in _render()

    def test_cohort_size_is_shown(self):
        html = _render(cohort=Cohort("purchaser", "課金完了者", ["a", "b"]))

        assert "2" in html

    def test_biggest_drop_is_called_out(self):
        """「どこで脱落しているのか」が一目で分かること。これが本命の問い。"""
        html = _render(conversion=_steps(
            (0, "オンボ完了", 30), (1, "ペイウォール表示", 28), (2, "購入開始", 6)
        ))

        assert "最大の脱落" in html and "購入開始" in html

    def test_user_row_shows_recency_and_frequency(self):
        """「いつ・どれくらいの頻度で」の答えが表に出ていること。"""
        html = _render()

        assert "2日前" in html

    def test_screens_and_features_are_listed_per_user(self):
        html = _render(activity=[_activity(screens=[("/profile", 9)],
                                           features=[("breathing_started", 8)])])

        assert "/profile" in html and "breathing_started" in html

    def test_feature_events_are_labelled_in_japanese(self):
        """生のイベント名だけだと読めない。日本語ラベルを併記する。"""
        html = _render(activity=[_activity(features=[("breathing_started", 8)])])

        assert "呼吸法" in html

    def test_onboarding_steps_are_listed(self):
        html = _render(onboarding=_steps((0, "welcome", 35), (1, "consent", 32)))

        assert "welcome" in html and "consent" in html


class TestSafety:
    def test_values_are_escaped(self):
        """画面名はアプリ由来だが、レポートは HTML なのでエスケープを外さない。"""
        html = _render(activity=[_activity(screens=[("<script>x</script>", 1)])])

        assert "<script>x</script>" not in html

    def test_data_caveats_are_stated_in_the_page(self):
        """user_id が NULL で端末単位である事実を、見る人が読める場所に書く。

        書かないと「ユーザー数」だと誤読され、再インストールが別人に見える。
        """
        html = _render()

        assert "端末" in html


class TestReadability:
    """目視で見つかった欠陥の回帰テスト。

    どれもテストは緑のまま「読めない画面」を出せてしまう類なので、
    ブラウザで現物を見て見つけたものをここに固定する。
    """

    def test_unchanged_runs_are_collapsed(self):
        """27行中25行が同じ数字だと本命の脱落が埋もれる。変化のない連続は畳む。

        畳みは COLLAPSE_THRESHOLD を超える長さのファネルにだけ効くので、
        実際のオンボ（27段）と同じ程度の長さで検証する。
        """
        steps = [(0, "welcome", 35)] + [(i, f"s{i}", 35) for i in range(1, 15)]
        html = _render(onboarding=_steps(*steps, (15, "consent", 30)))

        assert "変化なし" in html

    def test_collapsed_rows_report_how_many_were_hidden(self):
        """畳んだ事実だけ書いて件数を隠すと、何が省かれたのか分からなくなる。"""
        steps = [(0, "welcome", 35)] + [(i, f"s{i}", 35) for i in range(1, 14)]
        html = _render(onboarding=_steps(*steps, (14, "consent", 30)))

        assert "13 ステップ" in html

    def test_steps_with_drops_are_never_collapsed(self):
        """脱落のあった行は必ず残る。畳んで消したら分析にならない。"""
        steps = [(0, "welcome", 35)] + [(i, f"s{i}", 35) for i in range(1, 14)]
        html = _render(onboarding=_steps(*steps, (14, "consent", 30), (15, "last", 30)))

        assert "consent" in html

    def test_step_index_is_shown_to_disambiguate_repeated_labels(self):
        """assessment_yesno は6回出る。index が無いと同じ行に見える。"""
        html = _render(onboarding=_steps((0, "welcome", 35), (1, "assessment_yesno", 34)))

        assert "#1" in html

    def test_negligible_drop_is_not_announced_as_the_biggest_drop(self):
        """2端末の 6.2% を「最大の脱落点」と大書きすると、
        隣のセクションの 78% から目を逸らさせる。"""
        html = _render(onboarding=_steps((0, "welcome", 35), (1, "consent", 34)))

        assert "最大の脱落点" not in html

    def test_significant_drop_is_still_announced(self):
        html = _render(conversion=_steps((0, "ペイウォール表示", 32), (1, "購入開始", 7)))

        assert "最大の脱落点" in html

    def test_home_route_is_labelled(self):
        """`/` だけでは何の画面か読めない。"""
        html = _render(activity=[_activity(screens=[("/", 24)])])

        assert "ホーム" in html

    def test_user_table_keeps_columns_few_enough_to_read(self):
        """列が多すぎるとヘッダーが縦書きに潰れて読めなくなる（実際にそうなった）。"""
        html = _render()

        headers = [h for h in html.split("<thead>")[1:] ]
        user_header = headers[-1].split("</thead>")[0]
        assert user_header.count("<th") <= 5

    def test_short_funnels_are_never_collapsed(self):
        """5段の課金ファネルを畳むと、hiro が見たい「ペイウォール表示」の段が
        「変化なし」の下に消える。畳みは長いファネル専用の措置。"""
        html = _render(conversion=_steps(
            (0, "オンボ完了", 29), (1, "ベネフィット画面", 29),
            (2, "ペイウォール表示", 32), (3, "購入開始", 7), (4, "購入完了", 2),
        ))

        assert "ペイウォール表示" in html and "ベネフィット画面" in html

    def test_long_funnels_are_still_collapsed(self):
        html = _render(onboarding=_steps(*[(i, f"s{i}", 35) for i in range(20)]))

        assert "変化なし" in html

    def test_table_headers_do_not_wrap_mid_word(self):
        """「最終利用」が縦に1文字ずつ折り返して読めなくなっていた。

        ページ全体に "white-space:nowrap" があるかを見るだけでは駄目で、
        `_kv_table` の warn スタイルが同じ文字列を持つため常に緑になる。
        `<th>` の中を名指しで見る。
        """
        html = _render()

        headers = html.split("<thead>")[-1].split("</thead>")[0]
        assert "white-space:nowrap" in headers
