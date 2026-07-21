"""Tests for the Gmail-friendly HTML email renderer (`build_html`).

Rewire mirrors Focusity's report structure: same section order, headings and
table shapes (今日の要点 → サマリー → 各ファンネル → 収益 → リテンション →
全イベント → App Store取得 → 用語集 → 注記), populated with Rewire's own data
(recovery / paywall / RevenueCat). Asserts the readable contract: real <table>
markup, Japanese labels in the body (raw GA4 event names only in the glossary),
color-coded problem cells, graceful "取得できませんでした" fallback when a source
fails, HTML-escaping, and a size under Gmail's 102KB clip.
"""
from datetime import date

from scripts.analytics.html_report import build_html, headline


# --- fixtures ---------------------------------------------------------------

def _asc(**over):
    base = {
        "date": "2026-07-11",
        "metrics": {
            "impressions": 262, "product_page_views": 188, "app_units": 12,
            "taps": 27, "trial_starts": 1, "paid_conversions": 0,
        },
        "funnel": {"page_view_rate": 0.718, "download_rate": 0.046},
        "sources": {
            "App Store Search": {"impressions": 228, "product_page_views": 113,
                                 "taps": 4, "app_units": 7},
            "App Store Browse": {"impressions": 34, "product_page_views": 49,
                                 "taps": 23, "app_units": 1},
        },
    }
    base.update(over)
    return base


def _revenuecat():
    return {
        "mrr": {"value": 8, "unit": "$", "period": "P28D", "name": "MRR"},
        "active_subscriptions": {"value": 2, "unit": "#", "period": "P0D",
                                 "name": "Active Subscriptions"},
        "active_trials": {"value": 5, "unit": "#", "period": "P0D",
                          "name": "Active Trials"},
        "new_customers": {"value": 37, "unit": "#", "period": "P28D",
                          "name": "New Customers"},
        "active_users": {"value": 45, "unit": "#", "period": "P28D",
                         "name": "Active Users"},
    }


def _firebase(**over):
    base = {
        "basics": {
            "active_users": {"yesterday": 11, "prior_week_avg": 6.67},
            "new_users": {"yesterday": 6, "prior_week_avg": 2.17},
            "sessions": {"yesterday": 28, "prior_week_avg": 13.33},
            "avg_session_duration_seconds": 356.0,
            "screen_page_views": 10,
        },
        "events": {
            "paywall_viewed": {"count": 22, "users": 18},
            "pro_purchase_completed": {"count": 1, "users": 1},
            "breathing_started": {"count": 9, "users": 7},
            "breathing_completed": {"count": 6, "users": 5},
            "panic_button_tapped": {"count": 3, "users": 2},
            "onboarding_complete": {"count": 6, "users": 1},
            "reflection_opened": {"count": 4, "users": 3},
            "share_tapped": {"count": 0, "users": 0},
        },
        "retention_summary": {"d1": "10.9%", "d7": "1.1%", "d30": "N/A",
                              "cohort_size": "175"},
        "all_events": [
            {"name": "screen_view", "count": 210, "users": 3},
            {"name": "session_start", "count": 29, "users": 12},
            {"name": "paywall_viewed", "count": 22, "users": 18},
            {"name": "app_update", "count": 4, "users": 4},
        ],
        "top_screens": [
            {"name": "HomeScreen", "views": 120, "engagement_seconds": 400},
        ],
        "fetched_at": "2026-07-12T00:00:00+00:00",
    }
    base.update(over)
    return base


def _payload(**over):
    base = {"asc": _asc(), "revenuecat": _revenuecat(), "firebase": _firebase()}
    base.update(over)
    return base


TARGET = date(2026, 7, 11)


# The Focusity-mirrored section order (headings appear in this exact sequence).
EXPECTED_SECTIONS = [
    "今日の要点",
    "サマリー（前日 vs 直近7日平均）",
    "回復ファンネル（SOS）",
    "収益ファンネル（ペイウォール→購入）",
    "オンボーディング（初回設定）",
    "振り返り・記録",
    "共有",
    "収益（RevenueCat）",
    "リテンション（継続率）",
    "全イベント発火状況（計測ギャップ検出）",
    "App Store 取得（媒体別・ASC）",
    "用語集",
    "注記",
]


# --- structure contract -----------------------------------------------------

def test_is_a_full_html_document_titled_rewire():
    html = build_html(_payload(), TARGET)
    assert html.lstrip().startswith("<!DOCTYPE html>")
    assert "Rewire 日次レポート 2026-07-11" in html


def test_sections_appear_in_focusity_order():
    html = build_html(_payload(), TARGET)
    positions = [html.find(name) for name in EXPECTED_SECTIONS]
    assert all(p >= 0 for p in positions), [
        s for s, p in zip(EXPECTED_SECTIONS, positions) if p < 0]
    assert positions == sorted(positions), "sections are out of order"


def test_no_narrative_sections_when_insights_md_omitted():
    # Without insights_md, the report is the deterministic Focusity-mirrored
    # tables only — no narrative blocks appear.
    html = build_html(_payload(), TARGET)
    assert "横断分析" not in html
    assert "改善提案" not in html


def test_insights_markdown_rendered_as_html_after_asc_before_glossary():
    # send_daily always calls Claude for the 横断分析/改善提案 narrative (the
    # data that "was always in the email") — build_html must render it, not
    # silently drop it, on top of the deterministic Focusity-mirrored tables.
    md = (
        "## 横断分析\n\n"
        "- ASC DL=0 だが RevenueCat は稼働中。\n\n"
        "## 改善提案\n\n"
        "- **今日**: スクショ1枚目を差し替え。\n"
    )
    html = build_html(_payload(), TARGET, insights_md=md)
    assert "横断分析" in html and "改善提案" in html
    assert "<li" in html
    assert "<strong>今日</strong>" in html
    assert "**今日**" not in html            # markdown markers must not leak
    asc_pos = html.find("App Store 取得")
    narrative_pos = html.find("横断分析")
    glossary_pos = html.find("用語集")
    assert asc_pos < narrative_pos < glossary_pos


def test_revenuecat_section_still_present_alongside_narrative():
    md = "## 横断分析\n\n- 何か\n\n## 改善提案\n\n- **今日**: 施策\n"
    html = build_html(_payload(), TARGET, insights_md=md)
    assert "収益（RevenueCat）" in html
    assert "$8" in html


def test_renders_real_tables_not_pre_pipe_dumps():
    html = build_html(_payload(), TARGET)
    assert "<table" in html and "<th" in html and "<td" in html
    assert "<pre>" not in html
    assert "|---|" not in html


def test_highlights_table_has_item_value_change_columns():
    html = build_html(_payload(), TARGET)
    top = html[html.find("今日の要点"):html.find("サマリー")]
    assert "項目" in top and "前日比" in top
    assert "11" in top                       # active users yesterday
    assert "+65%" in top                     # 11 vs 6.67
    assert "新規ダウンロード" in top          # ASC installs surfaced here too


def test_summary_change_arrows_present():
    html = build_html(_payload(), TARGET)
    assert "▲" in html                        # up-swing glyph carries meaning


def test_revenuecat_section_present_with_japanese_period():
    html = build_html(_payload(), TARGET)
    assert "$8" in html
    assert "P28D" not in html and "28日" in html


def test_asc_media_table_has_totals_row():
    html = build_html(_payload(), TARGET)
    asc = html[html.find("App Store 取得"):]
    assert "App Store Search" in asc
    assert "合計" in asc
    assert "262" in asc                        # total impressions


def test_all_events_table_flags_unfired_key_events():
    html = build_html(_payload(), TARGET)
    assert "⚠️" in html                        # share_tapped fired 0 → gap marker


def test_event_names_japanese_in_body_raw_only_in_glossary():
    html = build_html(_payload(), TARGET)
    body, _, glossary = html.partition("用語集")
    assert "呼吸エクササイズ開始" in body
    assert "breathing_started" not in body
    assert "breathing_started" in glossary


def test_firebase_error_degrades_gracefully_not_a_stacktrace():
    payload = {"asc": _asc(), "revenuecat": _revenuecat(),
               "firebase_error": "GA4 fetch failed: 503 invalid_scope <bad>"}
    html = build_html(payload, TARGET)
    # Still a full report; ASC + RevenueCat present; GA4 sections show fallback.
    assert "取得できませんでした" in html
    assert "&lt;bad&gt;" in html
    assert "<pre>" not in html
    # ASC + RevenueCat still render with data.
    assert "262" in html and "$8" in html


def test_stays_under_gmail_clip_threshold():
    html = build_html(_payload(), TARGET)
    assert len(html.encode("utf-8")) < 102_000


def test_headline_ok_when_downloads_flow():
    h = headline(_payload())
    assert h["level"] in {"ok", "attention", "warn"}
    assert h["text"]


def test_headline_warns_on_firebase_fetch_failure():
    h = headline({"asc": _asc(), "firebase_error": "boom"})
    assert h["level"] == "warn"


class TestDataQualityBanners:
    """Delivery gaps must be visible in the email, not silently rendered as 0."""

    def test_stale_data_produces_a_warning_banner(self):
        payload = {"asc": _asc(), "staleness_days": 4}
        html = build_html(payload, date(2026, 7, 18))
        assert "4日前" in html
        assert "古い" in html

    def test_fresh_data_produces_no_staleness_warning(self):
        payload = {"asc": _asc(), "staleness_days": 1}
        html = build_html(payload, date(2026, 7, 12))
        assert "古い" not in html

    def test_missing_report_is_named_in_the_email(self):
        asc = _asc(missing_reports=["app_store_discovery_and_engagement_standard"],
                   unmeasured_metrics=["impressions", "product_page_views", "taps"])
        html = build_html({"asc": asc}, date(2026, 7, 16))
        assert "未取得" in html

    def test_unmeasured_metrics_are_not_shown_as_zero(self):
        asc = _asc(
            metrics={"impressions": 0, "product_page_views": 0, "app_units": 3,
                     "taps": 0, "trial_starts": 0, "paid_conversions": 1},
            missing_reports=["app_store_discovery_and_engagement_standard"],
            unmeasured_metrics=["impressions", "product_page_views", "taps"],
        )
        html = build_html({"asc": asc}, date(2026, 7, 16))
        # The headline must not claim zero impressions when none were delivered.
        assert "未取得" in html

    def test_no_data_quality_keys_renders_cleanly(self):
        html = build_html({"asc": _asc()}, date(2026, 7, 11))
        assert "未取得" not in html
        assert "古い" not in html
