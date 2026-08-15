"""Renders the retention / engagement / segment / blocker sections.

Pure rendering — takes the dataclasses from the `bq_*` modules and returns HTML
strings. Split out of `dashboard_html.py` so that file stays the page assembler
rather than growing a second job.

The recurring rule across every section: **an unknown must not look like a
zero**. An immature retention offset, a segment of one device, a blocker metric
whose events have not shipped — each renders as "—" or an explicit note, never
as 0%. Getting this wrong is how a dashboard becomes actively misleading.
"""
from dataclasses import dataclass
from typing import List, Optional, Sequence, Tuple

from scripts.analytics.bq_blocker import BlockerFunnel, HoldoutBucket
from scripts.analytics.bq_data_quality import PROVISIONAL_DAYS, DataQuality
from scripts.analytics.bq_engagement import DwellCoverage, ScreenDwell, SessionStats
from scripts.analytics.bq_retention import LifespanBucket, RetentionCohort, summarise_offset
from scripts.analytics.bq_segments import MIN_SEGMENT_DEVICES, Segment
from scripts.analytics.bq_time_usage import WEEKDAY_LABELS, FeatureTimeProfile, WeekSplit
from scripts.analytics.dashboard_charts import heatmap_html, rate_cell
from scripts.analytics.html_report import _esc, _kv_table, _section, _table

_EMPTY = "該当なし"


@dataclass(frozen=True)
class Insights:
    """Everything the new sections need, gathered by `build_dashboard`.

    One object rather than a dozen keyword arguments on `build_dashboard_html`,
    so adding a section does not change that function's signature again.
    """

    retention_cohorts: List[RetentionCohort]
    lifespan: List[LifespanBucket]
    retention_offsets: Sequence[int]
    heatmap: List[List[int]]
    feature_profiles: List[FeatureTimeProfile]
    week_split: WeekSplit
    session_stats: SessionStats
    screen_dwell: List[ScreenDwell]
    dwell_coverage: DwellCoverage
    #: (title, segments) pairs — channel, country, language.
    segments: List[Tuple[str, List[Segment]]]
    blocker_funnel: BlockerFunnel
    holdout: List[HoldoutBucket]
    quality: Optional[DataQuality]

    @property
    def device_count(self) -> int:
        return self.quality.eligible_devices if self.quality else 0


def _note(text: str) -> str:
    return f'<p style="color:#71717a;font-size:13px;margin:4px 0 12px">{_esc(text)}</p>'


def _empty(reason: str) -> str:
    return _note(f"{_EMPTY}（{reason}）")


def _pct(value: Optional[float]) -> str:
    return rate_cell(value)


# --- Retention --------------------------------------------------------------


def retention_section(
    cohorts: Sequence[RetentionCohort],
    lifespan: Sequence[LifespanBucket],
    offsets: Sequence[int],
) -> str:
    """Pooled retention per offset, plus how long devices stick around."""
    if not cohorts:
        return _empty("インストール日コホートに該当する端末がありません")

    rows = []
    for offset in offsets:
        summary = summarise_offset(cohorts, offset)
        rows.append([
            f"D{offset}",
            _pct(summary.rate),
            f"{summary.retained}/{summary.total}" if summary.total else "—",
            str(summary.immature_cohorts),
        ])

    html = [
        _table(
            ["経過日", "継続率", "端末", "未成熟コホート"],
            rows,
            num_cols=(1, 2, 3),
        ),
        _note(
            "オフセットごとに分母が違う。D7 を語れるのは7日以上経過したコホートだけなので、"
            "D3 と D7 で母集団が異なり、D7 のほうが高く出ることがある。改善ではない。"
            "「未成熟コホート」はその日数がまだ経過しておらず集計から除いた数。"
        ),
    ]

    if lifespan:
        html.append(
            _table(
                ["初回から最終利用までの日数", "端末", "割合"],
                [[b.label, str(b.devices), f"{b.share * 100:.1f}%"] for b in lifespan],
                num_cols=(1, 2),
            )
        )
    return "".join(html)


# --- Engagement -------------------------------------------------------------


def engagement_section(
    stats: SessionStats,
    dwell: Sequence[ScreenDwell],
    coverage: DwellCoverage,
) -> str:
    """Session length, and screen dwell when it can be trusted."""
    html = [
        _kv_table([
            ("セッション", f"{stats.sessions} 回 / {stats.devices} 端末"),
            (
                "1セッションの長さ",
                f"中央値 {stats.median_wall_sec:.0f} 秒 ・ 平均 {stats.mean_wall_sec:.0f} 秒",
            ),
            (
                "うち実操作時間",
                f"中央値 {stats.median_engaged_sec:.0f} 秒 ・ 平均 {stats.mean_engaged_sec:.0f} 秒",
            ),
            (
                "1セッションの画面数",
                f"中央値 {stats.median_screens:.0f} ・ 平均 {stats.mean_screens:.1f}"
                # 滞在時間を壊しているのと同じ自動収集ノイズが、この画面数も
                # 水増ししている。片方だけ警告して片方を素の数字で出さない。
                + ("" if coverage.is_reliable else "（参考値・自動収集ぶんを含む）"),
            ),
        ]),
        _note(
            "平均と中央値を併記している。放置されたセッションが平均を押し上げるため、"
            "実態に近いのは中央値のほう。"
        ),
    ]

    if not coverage.is_reliable:
        # Withhold the table entirely. A ranking built from 0.7% of the
        # measured time is not a weak signal, it is a different question.
        html.append(
            _kv_table([
                (
                    "画面別の滞在時間",
                    f"計測できていない（ルートに紐づいた滞在時間は全体の "
                    f"{coverage.share * 100:.1f}%）",
                    "warn",
                ),
            ])
        )
        html.append(
            _note(
                "iOS の自動 screen 収集が「現在の画面」を RNSScreen などの内部クラス名で"
                "上書きするため、滞在時間の大半がルートに紐づいていない。"
                "2.4.0（自動収集を無効化したビルド）が行き渡ると解消する。"
            )
        )
        return "".join(html)

    html.append(
        _table(
            ["画面", "合計", "1回あたり", "回数", "端末"],
            [
                [
                    _esc(d.screen),
                    f"{d.total_sec / 60:.1f} 分",
                    f"{d.mean_sec_per_view:.1f} 秒",
                    str(d.views),
                    str(d.devices),
                ]
                for d in dwell
            ],
            num_cols=(1, 2, 3, 4),
        )
    )
    return "".join(html)


# --- When ------------------------------------------------------------------

#: Below this many devices behind the grid, the heatmap is one person's diary.
_HEATMAP_MIN_DEVICES = 10


def time_section(
    heatmap: Sequence[Sequence[int]],
    profiles: Sequence[FeatureTimeProfile],
    split: WeekSplit,
    devices: int,
) -> str:
    """Day-of-week × hour grid, plus each feature's shape across the day."""
    if not any(any(row) for row in heatmap):
        return _empty("集計対象のイベントがありません")

    html = [heatmap_html(heatmap, WEEKDAY_LABELS)]

    if devices < _HEATMAP_MIN_DEVICES:
        html.append(
            _kv_table([
                (
                    "母数の注意",
                    f"このグリッドの背後にいるのは {devices} 端末。"
                    "特定の曜日・時間帯が濃く出ていても、数人の生活リズムでしかない",
                    "warn",
                ),
            ])
        )

    html.append(
        _kv_table([
            (
                "平日 / 週末",
                f"平日 {split.weekday_events} 件（{split.weekday_per_day:.0f} 件/日）・ "
                f"週末 {split.weekend_events} 件（{split.weekend_per_day:.0f} 件/日）",
            ),
        ])
    )
    html.append(_note("平日は5日・週末は2日あるため、総数ではなく1日あたりで比べている。"))

    if profiles:
        html.append(
            _table(
                ["機能", "回数", "端末", "ピーク時刻", "深夜 22-4時"],
                [
                    [
                        _esc(p.label),
                        str(p.total),
                        str(p.devices),
                        f"{p.peak_hour} 時台",
                        f"{p.night_share * 100:.0f}%"
                        if p.devices >= _MIN_PROFILE_DEVICES
                        else "サンプル不足",
                    ]
                    for p in profiles
                ],
                num_cols=(1, 2, 3, 4),
            )
        )
        html.append(
            _note(
                "衝動には時間帯がある。深夜に偏る機能があるなら、通知やリマインダーの"
                "時刻をそこに合わせる余地がある。"
            )
        )
    return "".join(html)


#: Night-share needs more than a couple of devices to mean anything — measured,
#: "トリガー選択の深夜率 67%" was 6 events from a single person.
_MIN_PROFILE_DEVICES = 3


# --- Segments ---------------------------------------------------------------


def segment_section(title: str, segments: Sequence[Segment]) -> str:
    """One breakdown (channel / country / language) with return rates."""
    if not segments:
        return _empty(f"{title}別に分類できる端末がありません")

    rows = [
        [
            _esc(s.key),
            str(s.devices),
            f"{s.share * 100:.0f}%",
            _pct(s.return_rate)
            if s.return_rate is not None
            else f"サンプル不足（{MIN_SEGMENT_DEVICES}台未満）",
        ]
        for s in segments
    ]
    return _table([_esc(title), "端末", "構成比", "復帰率"], rows, num_cols=(1, 2, 3))


# --- Content blocker --------------------------------------------------------


def blocker_section(
    funnel: BlockerFunnel, holdout: Sequence[HoldoutBucket]
) -> str:
    """Porn-blocking abandonment: how long it lasts, and whether the gate helps."""
    if not funnel.has_data:
        return _kv_table([
            (
                "コンテンツブロッカー",
                "まだ計測されていない。この計測は 2.4.0 から入るため、"
                "配信が行き渡るまでデータは 0 件のまま",
                "warn",
            ),
        ])

    html = [
        _kv_table([
            ("ブロックを開始した端末", f"{funnel.enabled_devices} 台"),
            (
                "解除まで行った（挫折）",
                f"{funnel.disable_confirmed_devices} 台 ・ 挫折率 {_pct(funnel.abandonment_rate)}",
                "amber",
            ),
            (
                "解除ボタンを押した",
                f"{funnel.disable_requested_devices} 台",
            ),
            (
                "呼吸ゲートで思いとどまった",
                f"{funnel.disable_cancelled_devices} 台 ・ 引き止め率 "
                f"{_pct(funnel.gate_save_rate)}",
            ),
        ]),
        _note(
            "引き止め率は「解除ボタンを押した人のうち、3呼吸のゲートを経て解除をやめた割合」。"
            "ゲートを挟んでいることの効果そのもの。"
        ),
    ]

    if holdout:
        html.append(
            _table(
                ["ブロックが続いた時間", "端末", "割合"],
                [[b.label, str(b.devices), f"{b.share * 100:.1f}%"] for b in holdout],
                num_cols=(1, 2),
            )
        )
        html.append(
            _note("解除まで行った端末について、最初の解除までに持ちこたえた時間。")
        )
    return "".join(html)


# --- Data quality -----------------------------------------------------------


def data_quality_section(quality: Optional[DataQuality]) -> str:
    """What the numbers above cannot be trusted to say."""
    if quality is None:
        return _empty("エクスポートにデータがありません")

    gaps = (
        "、".join(d.isoformat() for d in quality.missing_dates)
        if quality.has_gaps
        else "欠測なし"
    )
    return _kv_table([
        (
            "データ範囲",
            f"{quality.first_date} 〜 {quality.last_date}（{quality.days_covered} 日分）",
        ),
        ("欠測日", gaps, "warn" if quality.has_gaps else None),
        (
            "暫定扱い",
            f"{quality.provisional_from} 以降。GA4 は最大 {PROVISIONAL_DAYS * 24} 時間、"
            "遅れて届いたイベントで日次テーブルを更新し続けるため確定値ではない",
            "warn",
        ),
        (
            "集計対象",
            f"全 {quality.total_devices} 端末のうち {quality.eligible_devices} 端末。"
            f"エクスポート開始前にインストールした {quality.excluded_devices} 端末は"
            "初日のデータが存在せず、コホートの起点を決められないため除外している",
        ),
        (
            "集計単位",
            "端末（user_pseudo_id）。GA4 の user_id は全行 NULL のため、"
            "再インストールや機種変更は別端末として数えられる",
            "warn",
        ),
    ])


# --- Page assembly ----------------------------------------------------------


def render_insights(insights: Insights) -> str:
    """All new sections, in the order a reader should meet them.

    Retention first, because "84% never came back" is the finding everything
    else exists to explain. Data quality last, because it is the footnote to
    every number above it — but never omitted.
    """
    return "".join([
        _section("④ リテンション（インストール日コホート）"),
        retention_section(
            insights.retention_cohorts, insights.lifespan, insights.retention_offsets
        ),
        _section("⑤ いつ使われているか（曜日 × 時間帯・JST）"),
        time_section(
            insights.heatmap,
            insights.feature_profiles,
            insights.week_split,
            insights.device_count,
        ),
        _section("⑥ どれくらい使われているか"),
        engagement_section(
            insights.session_stats, insights.screen_dwell, insights.dwell_coverage
        ),
        _section("⑦ コンテンツブロッカー（ポルノ禁の継続と挫折）"),
        blocker_section(insights.blocker_funnel, insights.holdout),
        _section("⑧ セグメント別の復帰率"),
        "".join(
            segment_section(title, segments) for title, segments in insights.segments
        ),
        _section("⑨ データの限界"),
        data_quality_section(insights.quality),
    ])
