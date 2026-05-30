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
report in Japanese Markdown summarising the metrics for {date_str}.

Source payload structure:
- `asc`: App Store Connect funnel from `analyze_funnel.py`
  (impressions / product_page_views / app_units / taps / trial_starts /
   paid_conversions / cancellations / active_subscriptions, plus
   `funnel` rates and per-channel `sources`).
- `revenuecat` (optional): snapshot from RevenueCat V2 metrics/overview.
  Each value is `{{value, unit, period, name}}`. Periods are ISO durations
  (P0D = current snapshot, P28D = trailing 28 days).
- `revenuecat_error` (optional): present when the RevenueCat fetch failed —
  call out the gap so hiro knows tomorrow's number may differ.

Required structure:
1. `# Rewire 日次レポート YYYY-MM-DD` heading
2. `## App Store ファンネル` table (Impressions / Page Views / Taps /
   Downloads / Trial Starts / Paid). Mark suspicious zeros with ⚠️.
3. `## 収益 (RevenueCat)` — only when `revenuecat` is present: MRR / Active
   Subscriptions / Active Trials / New Customers (28日) / Active Users (28日).
   Include the period suffix. If `revenuecat_error` is present, replace this
   section with a single line "⚠️ RevenueCat取得失敗: <error>".
4. `## 今日の所感` — at most 3 bullet points, ≤2 sentences each. Look for
   cross-source signals (e.g. ASC traffic up but RevenueCat new_customers flat
   = sign-up friction). If ASC data is all zero, note "ASC TSV未処理の可能性".
5. `## 明日のアクション` — exactly one concrete action.

Rules:
- Do not invent numbers. Use only the JSON provided.
- Keep the whole report under 500 Japanese characters.
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
