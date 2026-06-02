"""Generate the daily analytics report via the headless Claude CLI.

We shell out to `claude -p` (print mode) instead of using the Anthropic Python
SDK so that the Max plan subscription is consumed via OAuth — no separate
ANTHROPIC_API_KEY billing required.
"""
import json
import subprocess
from datetime import date
from typing import Optional


_SYSTEM_TEMPLATE = """You are Rewire's analytics editor. Write a concise daily
report in Japanese Markdown summarising the cross-source metrics for {date_str}.

Source payload structure:
- `asc`: App Store Connect funnel from `analyze_funnel.py`
  (impressions / product_page_views / app_units / taps / trial_starts /
   paid_conversions / cancellations / active_subscriptions, plus
   `funnel` rates and per-channel `sources`).
- `revenuecat` (optional): snapshot from RevenueCat V2 metrics/overview.
  Each value is `{{value, unit, period, name}}`. Periods are ISO durations
  (P0D = current snapshot, P28D = trailing 28 days).
- `revenuecat_error` (optional): present when the RevenueCat fetch failed.
- `firebase` (optional): GA4 snapshot with three sections:
    `basics`     — {{active_users, new_users, sessions, ...}} each as
                   {{yesterday, prior_week_avg}}.
    `events`     — {{event_name: {{count, users}}}} for Rewire's instrumented
                   events: paywall_viewed, pro_purchase_completed,
                   benefits_screen_viewed, onboarding_complete,
                   breathing_started, breathing_completed, panic_button_tapped,
                   safari_demo_tapped, recovery_trigger_selected, etc.
    `top_screens` — list of {{name, views, engagement_seconds}}.
- `firebase_error` (optional): present when the GA4 fetch failed.

Required structure:
1. `# Rewire 日次レポート YYYY-MM-DD` heading.
2. `## App Store ファンネル` table (Impressions / Page Views / Taps /
   Downloads / Trial Starts / Paid). Mark suspicious zeros with ⚠️.
3. `## 収益 (RevenueCat)` — only when `revenuecat` is present: MRR /
   Active Subscriptions / Active Trials / New Customers (28日) /
   Active Users (28日). Include the period suffix. If `revenuecat_error`
   is present, replace this section with "⚠️ RevenueCat取得失敗: <error>".
4. `## ユーザー活動 (Firebase)` — only when `firebase` is present:
   - DAU 表: yesterday vs prior_week_avg, 増減率を明示
   - 主要イベント発火数: count と users を併記
   - 計算済の比率を出す: paywall_viewed→pro_purchase_completed の CVR、
     breathing_started→breathing_completed の完遂率、
     panic_button_tapped→breathing_started の連携率
   - 滞在画面 Top 5 (`top_screens` を views 降順で）
   If `firebase_error` is present, single line "⚠️ Firebase取得失敗: <error>".
5. `## 横断分析` — at most 3 bullets. **Must contrast at least two sources**:
   - 例: ASC Impression↑ かつ GA4 active_users 横ばい → 流入は来てるが定着していない
   - 例: GA4 paywall_viewed↑ かつ RevenueCat new_customers 同期しない →
     web 経由購入 or iOS 内購入の遅延
   - 例: GA4 breathing_completed↓ → SOS フロー離脱 → 翌日の Voluntary churn 予兆
   If only one source is available, say so explicitly and note the gap.
6. `## 改善提案` — output as 3 layered bullets:
   - **今日(即実装)**: コード変更1つで今日中に出せる施策 (例: パイルウォール文言調整)
   - **今週(着手)**: TDD含めて5日以内にPR作成・マージできるサイズの施策
   - **今月(計画)**: A/Bテスト設計、ターゲット指標、必要なログイベント追加 等

Rules:
- Do not invent numbers. Use only the JSON provided.
- iOS development builds and Expo Go return no-op for `logEvent`, so very low
  GA4 event counts during a TestFlight period are expected — note this rather
  than treating it as a bug.
- Keep total length under 800 Japanese characters.
- Output Markdown only. No code fences. No preamble like "Here is the report:".

Source metrics JSON:
```json
{metrics_json}
```
"""

_WITH_EXISTING_SUFFIX = """

For continuity, here is the previously rendered report for the same day.
Feel free to refine wording but the numbers MUST match the JSON above.

```markdown
{existing_report}
```
"""


def build_prompt(
    target_date: date,
    metrics: dict,
    existing_report: Optional[str],
) -> str:
    """Build the prompt sent to Claude on stdin."""
    body = _SYSTEM_TEMPLATE.format(
        date_str=target_date.isoformat(),
        metrics_json=json.dumps(metrics, ensure_ascii=False, indent=2),
    )
    if existing_report:
        body += _WITH_EXISTING_SUFFIX.format(existing_report=existing_report)
    return body


def generate_report(
    claude_cmd: str,
    target_date: date,
    metrics: dict,
    existing_report: Optional[str],
) -> str:
    """Run `claude -p` headless and return the generated Markdown report.

    Raises:
        RuntimeError: when the CLI exits non-zero.
    """
    prompt = build_prompt(target_date, metrics, existing_report)
    proc = subprocess.run(
        [claude_cmd, "-p"],
        input=prompt,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(
            f"claude CLI failed (exit {proc.returncode}): {proc.stderr.strip()}"
        )
    return proc.stdout.strip()
