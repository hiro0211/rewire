"""Gmail-friendly HTML renderer for the Rewire daily report.

Mirrors Focusity's ``html_report.py`` one-to-one — same section order, headings
and table shapes — populated with Rewire's own data (recovery / paywall funnels,
RevenueCat, App Store Connect). Built as a real inline-CSS ``<table>`` document
straight from the structured ``{asc, revenuecat, firebase}`` payload, NOT by
dumping Markdown pipe tables into a ``<pre>`` block.

Section order (identical shape to Focusity, domain-mapped to Rewire):
  1. 今日の要点                          (Focusity: 今日の要点)
  2. サマリー（前日 vs 直近7日平均）      (Focusity: サマリー)
  3. 回復ファンネル（SOS）               (Focusity: 集中ファンネル)
  4. 収益ファンネル（ペイウォール→購入） (Focusity: 建築とクラフト)
  5. オンボーディング（初回設定）        (Focusity: オンボーディング)
  6. 振り返り・記録                      (Focusity: タブ利用)
  7. 共有                                (Focusity: 共有)
  8. 収益（RevenueCat）                  (Rewire-specific — Focusity has none)
  9. リテンション（継続率）              (Focusity: リテンション)
 10. 全イベント発火状況（計測ギャップ検出）(Focusity: 全イベント発火状況)
 11. App Store 取得（媒体別・ASC）        (Focusity: App Store 取得)
 12. 用語集 / 13. 注記                    (Focusity: 用語集 / 注記)

2026 HTML-email best practice: table layout, inline critical styling (Gmail
strips <style> on forward), 600px container, total < 102KB, color-scheme meta +
explicit #ffffff backgrounds so dark-mode inversion stays legible, severity
carried by glyph (✅/⚠️/🚨, ▲▼→) as well as color. Fully deterministic → free,
unit-testable. When a source fetch fails, its sections degrade to a readable
"取得できませんでした" row rather than vanishing.

Preview from a saved metrics JSON (ASC only; revenuecat/firebase are live):
    python3 -m scripts.analytics.html_report docs/analytics/daily-metrics-<date>.json
"""
from __future__ import annotations

import html as _html
import re
from datetime import date
from typing import List, Optional, Tuple

from scripts.analytics.firebase_ga4_client import REWIRE_KEY_EVENTS

# --- palette & style constants (all backgrounds explicit for dark-mode) -----

INK = "#1f2328"
GREY = "#57606a"
BORDER = "#d0d7de"
TH_BG = "#f0f0f2"
GREEN = "#1a7f37"
RED = "#d1242f"
AMBER = "#d97706"
WARN_BG = "#fdecec"
WARN_INK = "#842029"
OK_BG = "#e7f6ec"
OK_INK = "#0f5132"
ATT_BG = "#fff4e5"
ATT_INK = "#7a4f01"
AMBER_BG = "#fff4e5"
ACCENT = "#2f6fed"  # Rewire brand-ish blue for section rules

FONT = ("-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN',"
        "'Yu Gothic',Meiryo,sans-serif")

TABLE = f"border-collapse:collapse;width:100%;font-size:14px;color:{INK};margin:4px 0 12px 0;"
TH = (f"background-color:{TH_BG};color:{INK};text-align:left;padding:8px 10px;"
      f"border:1px solid {BORDER};font-weight:700;")
TD = f"padding:8px 10px;border:1px solid {BORDER};color:{INK};"
TD_NUM = TD + "text-align:right;"
TD_WARN = (f"padding:8px 10px;border:1px solid {BORDER};background-color:{WARN_BG};"
           f"color:{WARN_INK};font-weight:700;")
TD_AMBER = (f"padding:8px 10px;border:1px solid {BORDER};background-color:{AMBER_BG};"
            f"color:{ATT_INK};")
SECTION = (f"font-size:15px;font-weight:700;color:{INK};padding:20px 0 8px 0;"
           f"border-bottom:2px solid {ACCENT};margin:0;")

# --- jargon → natural Japanese ---------------------------------------------

# GA4 event id → 自然な日本語（英語IDは本文に出さず用語集にのみ載せる）。
EVENT_JP = {
    "paywall_viewed": "ペイウォール表示",
    "paywall_dismissed": "ペイウォール離脱",
    "pro_purchase_completed": "Pro購入完了",
    "benefits_screen_viewed": "特典画面表示",
    "benefits_cta_tapped": "特典CTAタップ",
    "onboarding_step_viewed": "初回設定ステップ表示",
    "onboarding_complete": "初回設定完了",
    "breathing_started": "呼吸エクササイズ開始",
    "breathing_completed": "呼吸エクササイズ完了",
    "reflection_opened": "振り返りを開く",
    "reflection_completed": "振り返り完了",
    "relapse_recorded": "再発の記録",
    "panic_button_tapped": "パニックボタン押下",
    "panic_screen_viewed": "パニック画面表示",
    "safari_demo_tapped": "Safariデモ起動",
    "safari_demo_skipped": "Safariデモをスキップ",
    "recovery_trigger_selected": "回復トリガー選択",
    "share_tapped": "共有（シェア）",
    "review_prompt_shown": "レビュー依頼表示",
    "review_prompt_rated": "レビュー評価",
    "survey_prompt_accepted": "アンケート開始",
    "survey_completed": "アンケート完了",
    "post_purchase_step_viewed": "購入後オンボ表示",
    "post_purchase_onboarding_skipped": "購入後オンボをスキップ",
    "lesson_started": "レッスン開始",
    "lesson_completed": "レッスン完了",
    "quick_action_tapped": "クイックアクション",
    "achievements_opened": "実績画面を開く",
    "badge_unlocked": "バッジ獲得",
    "plan_selected": "プラン選択",
    "purchase_initiated": "購入開始",
    "purchase_failed": "購入失敗",
    "restore_tapped": "購入の復元をタップ",
    "restore_completed": "購入の復元完了",
    "notification_permission": "通知許可",
    "notification_scheduled": "通知を予約",
    "notification_opened": "通知を開封",
    # automatic GA4 events
    "first_open": "初回起動",
    "session_start": "セッション開始",
    "user_engagement": "利用時間",
    "screen_view": "画面表示",
}

# RevenueCat metric id → 日本語ラベル。未知IDは overview の name にフォールバック。
REVENUE_JP = {
    "mrr": "MRR（月次経常収益）",
    "revenue": "売上",
    "active_subscriptions": "有効なサブスク",
    "active_trials": "トライアル中",
    "new_customers": "新規顧客",
    "active_users": "アクティブユーザー",
    "active_subscribers": "サブスク登録者",
}

AUTOMATIC_EVENTS = ("first_open", "session_start", "user_engagement", "screen_view")


# --- small helpers ----------------------------------------------------------

def _esc(v) -> str:
    return _html.escape(str(v))


def _fmt(v) -> str:
    try:
        f = float(v)
        return str(int(f)) if f == int(f) else f"{f:g}"
    except (TypeError, ValueError):
        return str(v)


def _event_jp(name: str) -> str:
    return EVENT_JP.get(name, name)


def _kind(name: str) -> str:
    if name in REWIRE_KEY_EVENTS:
        return "カスタム"
    if name in AUTOMATIC_EVENTS:
        return "自動"
    return "その他"


def _period_jp(period: str) -> str:
    """ISO-8601 duration → plain Japanese suffix. P0D=現時点, P28D=過去28日。"""
    mapping = {"P0D": "現時点", "P1D": "1日", "P7D": "過去7日", "P28D": "過去28日",
               "P30D": "過去30日", "P90D": "過去90日"}
    return mapping.get(period, period or "")


def _fb(payload: dict) -> Optional[dict]:
    """The Firebase/GA4 snapshot dict, or None when the fetch failed/absent."""
    if payload.get("firebase_error"):
        return None
    return payload.get("firebase") or None


def _count(fb: Optional[dict], name: str) -> int:
    if not fb:
        return 0
    return (fb.get("events", {}).get(name) or {}).get("count", 0)


def _cu(fb: Optional[dict], name: str) -> Tuple[int, int]:
    if not fb:
        return 0, 0
    e = fb.get("events", {}).get(name) or {}
    return e.get("count", 0), e.get("users", 0)


def _rate_text(fb: Optional[dict], num: str, denom: str) -> str:
    if not fb:
        return "—（GA4取得失敗）"
    d = _count(fb, denom)
    n = _count(fb, num)
    if d <= 0:
        return "—（分母0）"
    if n > d:  # cross-day attribution / GA4 lag — show counts, not a bogus %
        return f"{n}/{d}（日跨ぎ/GA4遅延の可能性）"
    return f"{n / d * 100:.1f}%（{n}/{d}）"


def _pct(part, whole) -> str:
    try:
        return f"{100 * float(part) / float(whole):.1f}%" if whole else "—"
    except (TypeError, ValueError, ZeroDivisionError):
        return "—"


def _change_cell(y, avg) -> str:
    """Day-vs-7day-avg change cell; direction glyph carries the meaning."""
    try:
        y, avg = float(y), float(avg)
    except (TypeError, ValueError):
        return f'<span style="color:{GREY};">—</span>'
    if not avg or avg <= 0:
        return f'<span style="color:{GREY};">—</span>'
    delta = (y - avg) / avg
    if abs(delta) < 0.005:
        return f'<span style="color:{GREY};">→ 0%</span>'
    text = f"{delta * 100:+.0f}%"
    color, arrow = (GREEN, "▲") if delta > 0 else (RED, "▼")
    return f'<span style="color:{color};font-weight:700;">{arrow} {text}</span>'


# --- table builders (mirror Focusity) --------------------------------------

def _table(headers: List[str], rows: List[List[str]],
           num_cols=(), warn_flags: Optional[List[bool]] = None) -> str:
    num = set(num_cols)
    head = "".join(f'<th style="{TH}">{h}</th>' for h in headers)
    body = []
    for idx, row in enumerate(rows):
        warn = bool(warn_flags[idx]) if warn_flags else False
        tds = []
        for i, cell in enumerate(row):
            if warn:
                style = TD_WARN + ("text-align:right;" if i in num else "")
            else:
                style = TD_NUM if i in num else TD
            tds.append(f'<td style="{style}">{cell}</td>')
        body.append("<tr>" + "".join(tds) + "</tr>")
    return (f'<table role="presentation" cellspacing="0" cellpadding="0" class="rw-table" '
            f'style="{TABLE}"><thead><tr>{head}</tr></thead>'
            f'<tbody>{"".join(body)}</tbody></table>')


def _kv_table(pairs) -> str:
    """Header-less 2-column table. Each pair is (label, value[, flag])."""
    body = []
    for p in pairs:
        label, value = p[0], p[1]
        flag = p[2] if len(p) > 2 else None
        if flag == "warn":
            lst = TD_WARN + "white-space:nowrap;width:1%;"
            vst = TD_WARN
        elif flag == "amber":
            lst = f'{TD}font-weight:600;width:45%;'
            vst = TD_AMBER
        else:
            lst = f'{TD}font-weight:600;width:45%;'
            vst = TD
        body.append(f'<tr><td style="{lst}">{label}</td><td style="{vst}">{value}</td></tr>')
    return (f'<table role="presentation" cellspacing="0" cellpadding="0" class="rw-table" '
            f'style="{TABLE}"><tbody>{"".join(body)}</tbody></table>')


def _section(title: str) -> str:
    return f'<div style="{SECTION}">{_esc(title)}</div>'


def _fb_fallback_kv(error: Optional[str] = None) -> str:
    if error:
        return _kv_table([("取得状況",
                           f"⚠️ 取得できませんでした: {_esc(error)}", "warn")])
    return _kv_table([("取得状況", "⚠️ 取得できませんでした（GA4認証エラー）。"
                       "App Store / RevenueCat のセクションは表示されています。", "warn")])


# --- ASC helpers ------------------------------------------------------------

def _asc_installs(payload: dict) -> Optional[int]:
    asc = payload.get("asc") or {}
    m = asc.get("metrics") or {}
    if "app_units" in m:
        return m.get("app_units", 0)
    return None


# --- the TL;DR one-liner ----------------------------------------------------

def headline(payload: dict) -> dict:
    """Natural-Japanese TL;DR: ``{"level": "ok"|"attention"|"warn", "text": str}``.

    Precedence: source fetch failure → App Store funnel bottleneck → clean.
    Deterministic; no network.
    """
    if payload.get("firebase_error") or payload.get("revenuecat_error"):
        missing = []
        if payload.get("firebase_error"):
            missing.append("アプリ内行動（Firebase）")
        if payload.get("revenuecat_error"):
            missing.append("収益（RevenueCat）")
        return {"level": "warn",
                "text": (f"{'・'.join(missing)}のデータを取得できませんでした。"
                         "下の該当セクションをご確認ください。")}

    m = (payload.get("asc") or {}).get("metrics", {}) or {}
    imp = m.get("impressions", 0) or 0
    pv = m.get("product_page_views", 0) or 0
    dl = m.get("app_units", 0) or 0
    if imp <= 0:
        return {"level": "attention",
                "text": "App Store の表示回数が0でした。計測または配信状況をご確認ください。"}
    if pv > 0 and dl <= 0:
        return {"level": "attention",
                "text": (f"表示{imp}回・ページ閲覧{pv}件までは来ていますが、"
                         "ダウンロードが0でここが最大のボトルネックです。")}
    if dl > 0:
        return {"level": "ok",
                "text": f"本日はダウンロード{dl}件。ファンネルは動いています。"}
    return {"level": "ok", "text": "本日は大きな異常はありません。"}


# --- sections (Focusity order) ---------------------------------------------

def _banner(h: dict) -> str:
    style_map = {
        "ok": (OK_BG, OK_INK, GREEN, "✅"),
        "attention": (ATT_BG, ATT_INK, AMBER, "⚠️"),
        "warn": (WARN_BG, WARN_INK, RED, "🚨"),
    }
    bg, ink, accent, glyph = style_map.get(h["level"], style_map["ok"])
    return (f'<!--headline--><div style="background-color:{bg};color:{ink};'
            f'border-left:4px solid {accent};padding:16px 20px;font-size:16px;'
            f'font-weight:700;line-height:1.5;border-radius:4px;margin:8px 0 4px 0;">'
            f'{glyph} {_esc(h["text"])}</div>')


def _title(target_date: date) -> str:
    d = _esc(target_date.isoformat())
    return (f'<div style="font-size:20px;font-weight:800;color:{INK};padding:4px 0 2px 0;">'
            f'Rewire 日次レポート {d}</div>'
            f'<div style="font-size:12px;color:{GREY};padding:0 0 8px 0;">'
            f'対象日: {d}（App Store Connect / GA4 は 24–48h 遅延のため前日対象）</div>')


def _highlights_section(payload: dict) -> str:
    fb = _fb(payload)
    b = (fb or {}).get("basics", {}) or {}
    rs = (fb or {}).get("retention_summary", {}) or {}
    rows = []
    for label, key in (("アクティブユーザー", "active_users"),
                       ("新規ユーザー", "new_users"),
                       ("セッション", "sessions")):
        s = b.get(key, {}) or {}
        if fb:
            rows.append([_esc(label), _esc(s.get("yesterday", 0)),
                         _change_cell(s.get("yesterday", 0), s.get("prior_week_avg", 0))])
        else:
            rows.append([_esc(label), "—", f'<span style="color:{GREY};">—</span>'])
    rows.append(["呼吸エクササイズ 完遂率",
                 _esc(_rate_text(fb, "breathing_completed", "breathing_started")), ""])
    rows.append(["翌日継続率（D1）", _esc(rs.get("d1", "N/A") if fb else "—（GA4取得失敗）"), ""])
    installs = _asc_installs(payload)
    if installs is not None:
        rows.append(["新規ダウンロード（直近ウィンドウ）", _esc(installs), ""])
    if fb:
        fired = {e["name"] for e in (fb.get("all_events", []) or []) if e.get("count", 0) > 0}
        if not fired:  # fall back to the key-events snapshot when all_events absent
            fired = {n for n in REWIRE_KEY_EVENTS if _count(fb, n) > 0}
        missing = [n for n in REWIRE_KEY_EVENTS if n not in fired]
        if missing:
            rows.append(["未発火のイベント",
                         f'<span style="color:{RED};font-weight:700;">⚠️ {len(missing)} 件</span>', ""])
    return _section("今日の要点") + _table(["項目", "値", "前日比"], rows, num_cols=(1, 2))


def _summary_section(payload: dict) -> str:
    out = [_section("サマリー（前日 vs 直近7日平均）")]
    fb = _fb(payload)
    if not fb:
        out.append(_fb_fallback_kv(payload.get("firebase_error")))
        return "".join(out)
    b = fb.get("basics", {}) or {}
    rows = []
    for label, key in (("アクティブユーザー", "active_users"),
                       ("新規ユーザー", "new_users"),
                       ("セッション", "sessions")):
        s = b.get(key, {}) or {}
        rows.append([_esc(label), _esc(s.get("yesterday", 0)),
                     _esc(_fmt(s.get("prior_week_avg", 0))),
                     _change_cell(s.get("yesterday", 0), s.get("prior_week_avg", 0))])
    rows.append(["平均利用時間", f"{b.get('avg_session_duration_seconds', 0) or 0:.0f} 秒",
                 "—", f'<span style="color:{GREY};">—</span>'])
    rows.append(["画面表示回数", _esc(b.get("screen_page_views", 0)),
                 "—", f'<span style="color:{GREY};">—</span>'])
    out.append(_table(["指標", "前日", "7日平均", "変化"], rows, num_cols=(1, 2, 3)))
    return "".join(out)


def _recovery_section(payload: dict) -> str:
    """回復ファンネル（SOS）— maps to Focusity's 集中ファンネル."""
    out = [_section("回復ファンネル（SOS）")]
    fb = _fb(payload)
    if not fb:
        out.append(_fb_fallback_kv())
        return "".join(out)
    panic_c, panic_u = _cu(fb, "panic_button_tapped")
    breath_c, breath_u = _cu(fb, "breathing_started")
    pairs = [
        ("パニックボタン押下", f"{panic_c} 回 / {panic_u} 人"),
        ("呼吸エクササイズ開始", f"{breath_c} 回 / {breath_u} 人"),
        ("呼吸 完遂率（完了 / 開始）", _esc(_rate_text(fb, "breathing_completed", "breathing_started"))),
        ("SOS→呼吸 連携率（呼吸開始 / パニック）", _esc(_rate_text(fb, "breathing_started", "panic_button_tapped"))),
        ("回復トリガー選択", f"{_count(fb, 'recovery_trigger_selected')} 回"),
    ]
    out.append(_kv_table(pairs))
    return "".join(out)


def _revenue_funnel_section(payload: dict) -> str:
    """収益ファンネル（ペイウォール→購入）— maps to Focusity's 建築とクラフト."""
    out = [_section("収益ファンネル（ペイウォール→購入）")]
    fb = _fb(payload)
    if not fb:
        out.append(_fb_fallback_kv())
        return "".join(out)
    pv_c, pv_u = _cu(fb, "paywall_viewed")
    pairs = [
        ("ペイウォール表示", f"{pv_c} 回 / {pv_u} 人"),
        ("購入開始", f"{_count(fb, 'purchase_initiated')} 回"),
        ("Pro購入完了", f"{_count(fb, 'pro_purchase_completed')} 回"),
        ("購入CVR（Pro完了 / ペイウォール表示）",
         _esc(_rate_text(fb, "pro_purchase_completed", "paywall_viewed"))),
        ("購入失敗", f"{_count(fb, 'purchase_failed')} 回"),
        ("ペイウォール離脱", f"{_count(fb, 'paywall_dismissed')} 回"),
    ]
    out.append(_kv_table(pairs))
    return "".join(out)


def _onboarding_section(payload: dict) -> str:
    out = [_section("オンボーディング（初回設定）")]
    fb = _fb(payload)
    if not fb:
        out.append(_fb_fallback_kv())
        return "".join(out)
    c, u = _cu(fb, "onboarding_complete")
    pairs = [
        ("初回設定ステップ表示", f"{_count(fb, 'onboarding_step_viewed')} 回"),
        ("初回設定完了", f"{c} 回 / {u} 人"),
        ("Safariデモ起動", f"{_count(fb, 'safari_demo_tapped')} 回"),
        ("Safariデモをスキップ", f"{_count(fb, 'safari_demo_skipped')} 回"),
    ]
    out.append(_kv_table(pairs))
    return "".join(out)


def _reflection_section(payload: dict) -> str:
    """振り返り・記録 — maps to Focusity's タブ利用."""
    out = [_section("振り返り・記録")]
    fb = _fb(payload)
    if not fb:
        out.append(_fb_fallback_kv())
        return "".join(out)
    pairs = [
        ("振り返りを開く", f"{_count(fb, 'reflection_opened')} 回"),
        ("振り返り完了率（完了 / 開く）",
         _esc(_rate_text(fb, "reflection_completed", "reflection_opened"))),
        ("再発の記録", f"{_count(fb, 'relapse_recorded')} 回"),
    ]
    out.append(_kv_table(pairs))
    return "".join(out)


def _share_section(payload: dict) -> str:
    out = [_section("共有")]
    fb = _fb(payload)
    if not fb:
        out.append(_fb_fallback_kv())
        return "".join(out)
    return "".join(out) + _kv_table([("共有（シェア）", f"{_count(fb, 'share_tapped')} 回")])


def _revenuecat_section(payload: dict) -> str:
    out = [_section("収益（RevenueCat）")]
    if payload.get("revenuecat_error"):
        out.append(_kv_table([("取得状況",
                               f"⚠️ 取得できませんでした: {_esc(payload['revenuecat_error'])}",
                               "warn")]))
        return "".join(out)
    rc = payload.get("revenuecat") or {}
    if not rc:
        out.append(_kv_table([("取得状況", "（RevenueCat 未設定 / データなし）")]))
        return "".join(out)
    ordered = [k for k in REVENUE_JP if k in rc] + [k for k in rc if k not in REVENUE_JP]
    rows = []
    for mid in ordered:
        info = rc.get(mid) or {}
        value = info.get("value")
        if value is None:
            continue
        prefix = "$" if info.get("unit", "") == "$" else ""
        label = REVENUE_JP.get(mid, info.get("name", mid))
        rows.append([_esc(label), _esc(f"{prefix}{_fmt(value)}"),
                     _esc(_period_jp(info.get("period", "")))])
    if not rows:
        out.append(_kv_table([("取得状況", "（RevenueCat データなし）")]))
        return "".join(out)
    out.append(_table(["指標", "値", "期間"], rows, num_cols=(1,)))
    return "".join(out)


def _retention_section(payload: dict) -> str:
    out = [_section("リテンション（継続率）")]
    fb = _fb(payload)
    if not fb:
        out.append(_fb_fallback_kv())
        return "".join(out)
    rs = fb.get("retention_summary", {}) or {}
    if not rs:
        out.append(_kv_table([("取得状況", "（リテンション未取得）")]))
        return "".join(out)
    rows = [
        ["翌日継続率（D1）", _esc(rs.get("d1", "N/A"))],
        ["7日後継続率（D7）", _esc(rs.get("d7", "N/A"))],
        ["30日後継続率（D30）", _esc(rs.get("d30", "N/A"))],
        ["対象人数（コホート）", _esc(rs.get("cohort_size", 0))],
    ]
    out.append(_table(["指標", "値"], rows, num_cols=(1,)))
    return "".join(out)


def _events_section(payload: dict) -> str:
    out = [_section("全イベント発火状況（計測ギャップ検出）")]
    fb = _fb(payload)
    if not fb:
        out.append(_fb_fallback_kv())
        return "".join(out)
    all_events = fb.get("all_events", []) or []
    key_snapshot = fb.get("events", {}) or {}
    # Prefer the unfiltered all_events scan; fall back to the key-events snapshot.
    fired = {e["name"]: e for e in all_events}
    rows: List[List[str]] = []
    warn_flags: List[bool] = []
    for name in REWIRE_KEY_EVENTS:
        e = fired.get(name) or key_snapshot.get(name)
        if e and e.get("count", 0) > 0:
            rows.append([_esc(_event_jp(name)), _esc(e["count"]), _esc(e.get("users", 0)), "カスタム"])
            warn_flags.append(False)
        else:
            rows.append([f"{_esc(_event_jp(name))} ⚠️", "0", "0", "カスタム"])
            warn_flags.append(True)
    expected = set(REWIRE_KEY_EVENTS)
    for e in [x for x in all_events if x["name"] not in expected][:30]:  # size cap
        rows.append([_esc(_event_jp(e["name"])), _esc(e.get("count", 0)),
                     _esc(e.get("users", 0)), _kind(e["name"])])
        warn_flags.append(False)
    out.append(_table(["イベント", "回数", "人数", "種別"], rows, num_cols=(1, 2),
                      warn_flags=warn_flags))
    return "".join(out)


def _asc_section(payload: dict) -> str:
    out = [_section("App Store 取得（媒体別・ASC）")]
    asc = payload.get("asc") or {}
    m = asc.get("metrics") or {}
    if not m:
        out.append(_kv_table([("取得状況",
                               "⏳ ASC の取得データがまだありません（生成待ち）。"
                               "翌日以降のメールに反映されます。")]))
        return "".join(out)
    imp = m.get("impressions", 0) or 0
    tap = m.get("taps", 0) or 0
    pv = m.get("product_page_views", 0) or 0
    ins = m.get("app_units", 0) or 0
    funnel = [
        ["表示回数（インプレッション）", _esc(imp), "—"],
        ["タップ数", _esc(tap), _pct(tap, imp)],
        ["プロダクトページ閲覧", _esc(pv), _pct(pv, imp)],
        ["新規ダウンロード", _esc(ins), _pct(ins, imp)],
    ]
    out.append(_table(["指標", "値", "対 表示回数"], funnel, num_cols=(1, 2)))

    sources = asc.get("sources", {}) or {}
    ranked = sorted(sources.items(),
                    key=lambda kv: (kv[1] or {}).get("impressions", 0), reverse=True)
    media = []
    for name, s in ranked:
        s = s or {}
        if not any(s.get(k, 0) for k in ("impressions", "product_page_views",
                                         "taps", "app_units")):
            continue  # skip all-zero noise sources
        media.append([_esc(name), _esc(s.get("impressions", 0)), _esc(s.get("taps", 0)),
                      _esc(s.get("product_page_views", 0)), _esc(s.get("app_units", 0))])
    if media:
        media.append([f"<b>合計</b>", f"<b>{_esc(imp)}</b>", f"<b>{_esc(tap)}</b>",
                      f"<b>{_esc(pv)}</b>", f"<b>{_esc(ins)}</b>"])
        out.append(_table(["媒体", "表示", "タップ", "ページ閲覧", "DL"], media,
                          num_cols=(1, 2, 3, 4)))
    return "".join(out)


# --- LLM narrative (横断分析 / 改善提案) → HTML -----------------------------
#
# send_daily always runs the payload through Claude (report_generator.py) to
# get the qualitative cross-source analysis and action items the raw tables
# above can't produce on their own — this is the content that "was always in
# the email" before the Focusity-style table redesign. The data tables stay
# fully deterministic; only this narrative comes from the LLM.

_INLINE_BOLD = re.compile(r"\*\*(.+?)\*\*")


def _inline(text: str) -> str:
    """Escape, then re-enable **bold** as <strong> (the only inline markup we emit)."""
    out, last = [], 0
    for match in _INLINE_BOLD.finditer(text):
        out.append(_esc(text[last:match.start()]))
        out.append(f"<strong>{_esc(match.group(1))}</strong>")
        last = match.end()
    out.append(_esc(text[last:]))
    return "".join(out)


def _render_markdown_block(lines: List[str]) -> str:
    """Render a run of markdown lines (bullets + paragraphs) to HTML."""
    html_parts: List[str] = []
    bullets: List[str] = []

    def flush_bullets():
        if bullets:
            lis = "".join(
                f'<li style="margin:3px 0;line-height:1.5;">{b}</li>' for b in bullets)
            html_parts.append(
                f'<ul style="font-size:14px;color:{INK};padding-left:20px;margin:4px 0 12px 0;">'
                f'{lis}</ul>')
            bullets.clear()

    for raw in lines:
        line = raw.strip()
        if not line:
            flush_bullets()
            continue
        if line.startswith(("- ", "* ")):
            bullets.append(_inline(line[2:].strip()))
        else:
            flush_bullets()
            html_parts.append(
                f'<p style="font-size:14px;color:{INK};line-height:1.6;margin:4px 0 10px 0;">'
                f'{_inline(line)}</p>')
    flush_bullets()
    return "".join(html_parts)


# Narrative sections we lift out of the LLM markdown (the data tables are
# already rendered deterministically above, so we only keep the human insight).
_NARRATIVE_HEADINGS = ("横断分析", "改善提案")


def _insights_section(insights_md: Optional[str]) -> str:
    if not insights_md:
        return ""
    # Split the markdown into (heading, body-lines) chunks on `## ` boundaries.
    chunks: List[tuple] = []
    current_heading: Optional[str] = None
    current_lines: List[str] = []
    for raw in insights_md.splitlines():
        if raw.startswith("## "):
            if current_heading is not None:
                chunks.append((current_heading, current_lines))
            current_heading = raw[3:].strip()
            current_lines = []
        elif current_heading is not None:
            current_lines.append(raw)
    if current_heading is not None:
        chunks.append((current_heading, current_lines))

    out = []
    for heading, lines in chunks:
        if not any(key in heading for key in _NARRATIVE_HEADINGS):
            continue
        block = _render_markdown_block(lines)
        if block:
            out.append(_section(heading) + block)
    return "".join(out)


def _glossary() -> str:
    ev_rows = [[_esc(_event_jp(n)), _esc(n)]
               for n in list(REWIRE_KEY_EVENTS) + list(AUTOMATIC_EVENTS)]
    defs = [
        ("継続率（D1 / D7 / D30）", "使い始めた人のうち、翌日・7日後・30日後にもう一度使った割合。"),
        ("コホート", "同じ期間に使い始めた利用者のまとまり。継続率の母数です。"),
        ("MRR（月次経常収益）", "サブスクから毎月見込める収益。"),
        ("インプレッション（表示回数）", "App Store で検索・閲覧されて表示された回数。"),
        ("対 表示回数", "各段階の件数を、表示回数で割った通過率。"),
    ]
    return ("<!--glossary-->" + _section("用語集")
            + f'<div style="font-size:12px;color:{GREY};padding:0 0 6px 0;">'
              "英語のイベント名は本文には出していません。対応は下表のとおりです。</div>"
            + _table(["日本語表記", "元のイベント名（GA4）"], ev_rows)
            + _kv_table([(d[0], _esc(d[1])) for d in defs]))


def _notes() -> str:
    items = [
        "App Store Connect / GA4 標準レポートは 24–48h 遅延（本レポートは前日対象）。",
        "TestFlight / シミュレータのイベントは即時反映されません。本番ビルドの実機データが必要です。",
        "RevenueCat の「現時点」はスナップショット、「過去28日」は直近28日間の集計です。",
    ]
    lis = "".join(f'<li style="margin:2px 0;">{_esc(t)}</li>' for t in items)
    return (_section("注記")
            + f'<ul style="font-size:12px;color:{GREY};padding-left:18px;margin:4px 0;">{lis}</ul>')


# --- document ---------------------------------------------------------------

def _document(inner: str) -> str:
    return (
        "<!DOCTYPE html>\n"
        '<html lang="ja"><head>'
        '<meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<meta name="color-scheme" content="light dark">'
        '<meta name="supported-color-schemes" content="light dark">'
        "<style>@media only screen and (max-width:600px){"
        ".rw-table td,.rw-table th{font-size:12px!important;padding:6px!important;}"
        ".rw-wrap{width:100%!important;}}</style>"
        "</head>"
        '<body style="margin:0;padding:0;background-color:#f4f4f5;">'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        'style="background-color:#f4f4f5;"><tr><td align="center" style="padding:16px;">'
        '<table role="presentation" class="rw-wrap" width="600" cellpadding="0" cellspacing="0" '
        f'style="width:100%;max-width:600px;margin:0 auto;background-color:#ffffff;'
        f'border-radius:8px;padding:20px;font-family:{FONT};color:{INK};">'
        f'<tr><td>{inner}</td></tr>'
        "</table></td></tr></table></body></html>"
    )


def build_html(payload: dict, target_date: date,
               insights_md: Optional[str] = None) -> str:
    """Render the full inline-CSS HTML email for one day's Rewire report.

    Mirrors Focusity's section order/headings/table shapes for every data table.
    ``payload`` is the ``{asc, revenuecat, firebase}`` dict assembled by
    ``send_daily`` (with ``*_error`` keys when a source fetch failed).
    ``insights_md`` is the Claude-written Markdown from ``report_generator.py``;
    its 横断分析 / 改善提案 sections are rendered as an additional section after
    the data tables — the qualitative analysis that was always part of the
    email, on top of (not instead of) the deterministic tables.
    """
    h = headline(payload)
    inner = "".join([
        _title(target_date),
        _banner(h),
        _highlights_section(payload),
        _summary_section(payload),
        _recovery_section(payload),
        _revenue_funnel_section(payload),
        _onboarding_section(payload),
        _reflection_section(payload),
        _share_section(payload),
        _revenuecat_section(payload),
        _retention_section(payload),
        _events_section(payload),
        _asc_section(payload),
        _insights_section(insights_md),
        _glossary(),
        _notes(),
    ])
    return _document(inner)


def main() -> None:
    """Preview from a saved metrics JSON (ASC only; revenuecat/firebase live)."""
    import json
    import sys

    if len(sys.argv) < 2:
        print("usage: python3 -m scripts.analytics.html_report <daily-metrics-<date>.json>")
        raise SystemExit(2)
    path = sys.argv[1]
    with open(path, encoding="utf-8") as fh:
        asc = json.load(fh)
    target_date = date.fromisoformat(asc["date"])
    out = build_html({"asc": asc}, target_date)
    out_path = path.replace("daily-metrics-", "daily-report-").replace(".json", ".html")
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(out)
    print(f"wrote {out_path} ({len(out.encode('utf-8'))} bytes)")


if __name__ == "__main__":
    main()
