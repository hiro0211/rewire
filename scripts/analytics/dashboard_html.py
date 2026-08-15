"""Render the analytics dashboard as a standalone HTML page.

Pure rendering — takes the dataclasses produced by the `bq_*` modules and
returns a string. No BigQuery, no clock, no file IO, so every visual decision
is testable.

Reuses `html_report`'s table/section helpers and page shell so the dashboard
looks like the daily report rather than introducing a second style system.
"""
from datetime import date
from typing import List, Optional, Sequence, Tuple

from scripts.analytics.bq_cohort import Cohort
from scripts.analytics.bq_onboarding_funnel import FunnelStep, biggest_drop
from scripts.analytics.bq_user_activity import FEATURE_EVENTS, UserActivity
from scripts.analytics.dashboard_insights import Insights, render_insights
from scripts.analytics.html_report import (
    _document,
    _esc,
    _kv_table,
    _section,
    _table,
)


_EMPTY = "該当なし"

#: A drop smaller than both of these is noise, not a finding. Announcing
#: "biggest drop: 6.2% (2 devices)" next to a section showing a 78% drop
#: actively points hiro at the wrong thing.
_NOTABLE_DROP_RATE = 0.10
_NOTABLE_DROP_DEVICES = 5

#: Funnels at or below this length are shown in full — there is nothing to hide
#: and folding costs more clarity than it buys.
COLLAPSE_THRESHOLD = 10

#: Pathnames alone do not say what a screen is. Only routes whose name is not
#: self-explanatory need an entry here.
_ROUTE_LABELS = {
    "/": "ホーム",
    "/brand": "起動スプラッシュ",
    "/learn": "学ぶ",
    "/profile": "プロフィール",
    "/paywall": "ペイウォール",
    "/panic": "パニック",
    "/achievements": "実績",
}


def _empty_note(reason: str) -> str:
    """An explicit 'no rows' marker.

    A blank table cannot be told apart from a broken query, so never emit one.
    """
    return f'<p style="color:#71717a;font-size:14px;margin:4px 0 12px;">{_EMPTY}（{_esc(reason)}）</p>'


def _pct(rate: float) -> str:
    return f"{rate * 100:.1f}%"


def _nw(text: str) -> str:
    """A header that refuses to wrap.

    `_table` sizes columns from content, so a short cell like "2日前" squeezed
    "最終利用" into four stacked characters. Headers are injected as raw HTML by
    `_table`, so the span reaches the `<th>` intact.
    """
    return f'<span style="white-space:nowrap">{_esc(text)}</span>'


def _bar(value: int, peak: int, width: int = 12) -> str:
    """A text bar. Keeps the page dependency-free — no chart library, no CDN."""
    if peak <= 0:
        return ""
    filled = round(width * value / peak)
    return "█" * filled + "·" * (width - filled)


def collapse_unchanged(steps: Sequence[FunnelStep]) -> List[object]:
    """Fold runs of zero-drop steps into a single placeholder.

    The onboarding funnel is 27 steps and 25 of them lose nobody, so a literal
    table buries the two that matter under identical rows. Steps with any drop
    are never folded, and the first and last step always survive so the shape
    of the funnel stays visible.

    Short funnels are returned untouched. The 5-stage conversion funnel has no
    filler to hide, and folding it buried "ペイウォール表示" — one of the two
    stages the dashboard exists to show.

    Returns a list mixing FunnelStep with ``int`` (how many steps were folded).
    """
    if len(steps) <= COLLAPSE_THRESHOLD:
        return list(steps)

    keep = [
        i for i, s in enumerate(steps)
        if s.dropped > 0 or i == 0 or i == len(steps) - 1
    ]
    out: List[object] = []
    previous: Optional[int] = None
    for i in keep:
        gap = i - previous - 1 if previous is not None else 0
        if gap > 0:
            out.append(gap)
        out.append(steps[i])
        previous = i
    return out


def _funnel_table(steps: Sequence[FunnelStep], first_col: str) -> str:
    if not steps:
        return _empty_note("該当イベントが1件も記録されていません")
    peak = max(s.devices for s in steps)
    worst = _notable_drop(steps)
    rows, flags = [], []
    for entry in collapse_unchanged(steps):
        if isinstance(entry, int):
            rows.append([f"⋯ 変化なし（{entry} ステップ）", "", "", "—", "—"])
            flags.append(False)
            continue
        rows.append([
            # The index disambiguates repeated labels — `assessment_yesno`
            # appears six times and is otherwise indistinguishable.
            f"#{entry.step_index} {_esc(str(entry.step_type))}",
            _bar(entry.devices, peak),
            str(entry.devices),
            str(entry.dropped) if entry.dropped else "—",
            _pct(entry.drop_rate) if entry.dropped else "—",
        ])
        flags.append(worst is not None and entry is worst)
    return _table(
        [_nw(first_col), "", _nw("端末数"), _nw("脱落"), _nw("脱落率")],
        rows,
        num_cols=(2, 3, 4),
        warn_flags=flags,
    )


def _notable_drop(steps: Sequence[FunnelStep]) -> Optional[FunnelStep]:
    """The biggest drop, but only if it is big enough to act on."""
    worst = biggest_drop(steps)
    if worst is None or worst.dropped == 0:
        return None
    if worst.drop_rate < _NOTABLE_DROP_RATE and worst.dropped < _NOTABLE_DROP_DEVICES:
        return None
    return worst


def _drop_callout(steps: Sequence[FunnelStep]) -> str:
    worst = _notable_drop(steps)
    if worst is None:
        return ""
    return _kv_table([
        ("最大の脱落点",
         f"{_esc(str(worst.step_type))} で {worst.dropped} 端末が離脱"
         f"（直前段の {_pct(worst.drop_rate)}）", "amber"),
    ])


def _labelled(name: str) -> str:
    """Attach a readable label to an event name or a route.

    `/` on its own tells the reader nothing; `breathing_started` is only
    obvious to whoever wrote it.
    """
    label = FEATURE_EVENTS.get(name) or _ROUTE_LABELS.get(name)
    return f"{_esc(name)}（{_esc(label)}）" if label else _esc(name)


def _top_list(pairs: Sequence[Tuple[str, int]]) -> str:
    if not pairs:
        return "—"
    return "<br>".join(f"{_labelled(name)} × {n}" for name, n in pairs)


def _user_table(activity: Sequence[UserActivity]) -> str:
    if not activity:
        return _empty_note("このコホートに該当する端末がありません")
    # Five columns, not seven: at seven the headers wrapped one character per
    # line and the table became unreadable. The three usage numbers say more
    # together in one cell than they did as three squeezed columns.
    rows = [
        [
            _esc(a.device_id[:8]),
            f"{a.days_since_last_seen}日前",
            f"{a.active_days}日稼働 / {a.sessions}セッション"
            f"（{a.sessions_per_active_day:.1f}回/稼働日）",
            _top_list(a.top_screens[:3]),
            _top_list(a.top_features[:3]),
        ]
        for a in activity
    ]
    return _table(
        [_nw("端末"), _nw("最終利用"), _nw("利用頻度"),
         _nw("よく見る画面"), _nw("よく使う機能")],
        rows,
    )


def _cohort_note(cohort: Cohort) -> str:
    """How many devices are behind section ③, and whether that is enough.

    Sits next to the table it qualifies rather than in a page footer, so the
    warning is read before the numbers instead of after them.
    """
    return _kv_table([
        ("母数の注意",
         f"{_esc(cohort.label)}は {cohort.size} 端末。"
         "統計的な結論ではなく個票の観察として読んでください")
        if cohort.size < 10 else
        ("母数", f"{_esc(cohort.label)} {cohort.size} 端末"),
    ])


def _caveats(cohort: Cohort) -> str:
    """Fallback caveats, used only when the computed section ⑨ is unavailable.

    Section ⑨ supersedes this: it derives the gaps, the provisional window and
    the excluded devices from the export rather than asserting them. What was
    here before included a hardcoded "2026-08-03 のテーブルが存在しない" line —
    correct the day it was written, and guaranteed to contradict the computed
    section the next time a different day goes missing. A caveat that stops
    being true is worse than no caveat, so it is gone.
    """
    return _kv_table([
        ("集計単位",
         "端末（user_pseudo_id）。GA4 の user_id は全行 NULL のため、"
         "再インストールや機種変更は別端末として数えられます", "warn"),
    ])


def build_dashboard_html(
    *,
    generated_on: date,
    cohort: Cohort,
    onboarding_steps: List[FunnelStep],
    conversion_stages: List[FunnelStep],
    activity: List[UserActivity],
    data_range: Optional[str] = None,
    insights: Optional[Insights] = None,
) -> str:
    """Render the whole dashboard.

    ``insights`` carries the retention / timing / engagement / blocker sections.
    It is optional so the funnel-only dashboard still renders when a BigQuery
    call for the newer sections fails — a partial page beats no page.
    """
    header = _kv_table([
        ("生成日", generated_on.isoformat()),
        ("対象コホート", f"{_esc(cohort.label)}（{cohort.size} 端末）"),
        ("データ範囲", _esc(data_range) if data_range else "全期間"),
    ])

    inner = "".join([
        _section("Rewire 利用状況ダッシュボード"),
        header,
        _section("① オンボーディング ステップ別 到達・脱落"),
        _funnel_table(onboarding_steps, "ステップ"),
        _drop_callout(onboarding_steps),
        _section("② オンボ完了 → ペイウォール → 購入"),
        _funnel_table(conversion_stages, "段階"),
        _drop_callout(conversion_stages),
        _section(f"③ {_esc(cohort.label)} の利用実態（最終利用が新しい順）"),
        _user_table(activity),
        _cohort_note(cohort),
        # ⑨ が出るときは旧セクションを重ねない。同じことを2回書くと、
        # どちらが最新なのか読者には区別がつかない。
        render_insights(insights)
        if insights
        else _section("データの読み方・限界") + _caveats(cohort),
    ])
    return _document(inner)
