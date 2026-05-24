# Rewire Daily Analytics (Corrected) - 2026-05-23

_Processing date: 2026-05-23. Data window inside the fetched reports: 2026-05-20 -> 2026-05-22 (standard 1-3 day ASC reporting lag; the requested day 2026-05-23 is not yet present)._

> WARNING: the skill's `analyze_funnel.py` reported all zeros again — `daily-report-2026-05-23.md` / `daily-metrics-2026-05-23.json`. Its column mappings (`Impressions`, `Product Page Views`, ...) still do not match the actual ASC TSV, which is long-format: an `Event` column with values `Impression` / `Page view` / `Tap` plus a `Counts` column. The numbers below are the re-aggregated truth, computed in Python. Same bug as `daily-report-2026-05-08-corrected.md`, `-05-17-`, `-05-20-`, `-05-21-`, and `-05-22-` — now **six consecutive runs**, still unfixed.

## Funnel Summary (3-day window, 2026-05-20 -> 2026-05-22)

| Stage | Count | Conversion Rate | vs Benchmark |
|-------|-------|-----------------|--------------|
| Impressions | 61 | — | — |
| → Page Views | 0 | 0.0% | 🔴 Below (benchmark 25-35%) |
| → Taps ("Get") | 1 | — | — |
| → Downloads | n/a | — | not in fetched reports |
| → Trial Starts | n/a | — | not in fetched reports |
| → Paid | n/a | — | not in fetched reports |

Only the first funnel stage (Impression → Page View) is measurable, and this window it reads **0.0%** — 61 App Store impressions produced **zero product-page views**. The single engagement event in the whole window is one "Tap" (Get-button tap, JP, 2026-05-21). **Downloads, Trial Starts, and Paid conversions are not present** in the fetched data — the App Store Discovery & Engagement reports do not contain them, and the App Usage / Commerce / Subscription report categories were not returned. Three of the five funnel stages remain blind.

## Per-day breakdown

| Date | Status | Impressions | Page views | Taps | Page-view rate |
|------|--------|-------------|------------|------|----------------|
| 2026-05-20 | finalized | 26 | 0 | 0 | 0.0% |
| 2026-05-21 | finalized | 18 | 0 | 1 | 0.0% |
| 2026-05-22 | preliminary | 17 | 0 | 0 | 0.0% |

"Finalized" means the day's counts are byte-identical across two fetches a day apart (this run vs. the 2026-05-22 fetch). Stability check: 2026-05-20 read `26 impressions` in both fetches; 2026-05-21 read `18 impressions / 1 tap` in both. **Both finalized days genuinely had zero product-page views.** 2026-05-22 is the newest day in the window and still preliminary — ASC posts impressions first and page-view/tap data lags, so its zero is partly an artifact of incomplete data. But the finalized portion alone (05-20 + 05-21 = **44 impressions, 0 page views**) is already a real, reliable 0.0%.

## Window-over-window comparison

| Window | Dates | Impressions | Page views | Page-view rate |
|--------|-------|-------------|------------|----------------|
| Current | 2026-05-20 → 05-22 | 61 | 0 | 0.0% |
| Prior   | 2026-05-19 → 05-21 | 65 | 8 | 12.3% |

Source: prior figures from `daily-metrics-2026-05-22-corrected.json`. Impression volume is essentially flat (65 → 61, ~20/day). Page views, however, dropped from 8 to 0. **All 8 page views in the prior window came from a single day, 2026-05-19** (JP). The current window simply rolled past that one good day — 05-20, 05-21, and 05-22 each produced 0 page views. So this is less a sudden "decline" than confirmation that 05-19 was an isolated spike and the underlying baseline is near-zero page-view activity.

## Channel Comparison

| Channel | Impressions | Page views | Taps | Page-view rate |
|---------|-------------|------------|------|----------------|
| App Store Search | 55 | 0 | 1 | 0.0% |
| App Store Browse | 6 | 0 | 0 | 0.0% |

All traffic is organic. App Store Search drives 90.2% of impressions (55/61) and converts none of them to a page view. The detailed report (`app_store_discovery_and_engagement_detailed.tsv`) carries a `Campaign` column and shows **no campaign attribution** — the only detailed row has a blank campaign. **No TikTok-attributed impressions and no web-referral impressions** appear in this window — the sixth run in a row with zero measurable paid/social acquisition, so the intended TikTok-vs-organic comparison still cannot be made. The separate App Store Web Preview report shows just **1 page view** (Chrome Mobile, JP, source "Unavailable").

## Territory breakdown (3-day window)

| Territory | Impressions | Page views | Taps |
|-----------|-------------|------------|------|
| TH | 30 | 0 | 0 |
| JP | 13 | 0 | 1 |
| IL | 13 | 0 | 0 |
| NP | 2 | 0 | 0 |
| PH | 1 | 0 | 0 |
| TW | 1 | 0 | 0 |
| MN | 1 | 0 | 0 |

Every territory converts impressions to page views at 0%. **The notable change from the prior window is JP**: it carried the entire funnel last window (24 impressions → 8 page views, 33.3%), and this window its 13 impressions produced 0 page views (just 1 Get tap). JP slipping to zero is the single most important signal here — the one market that was working has gone quiet. **TH is again the biggest impression sink**: 30 impressions (49.2% of the total), zero engagement — the same pattern flagged in the last two corrected reports.

## Bottleneck

**Impression → Page View** is the bottleneck, and it is at its worst reading yet: **0.0%** over the window (0.0% on finalized days alone, 44 impressions / 0 page views), against the 25-35% RevenueCat benchmark — a gap of the full ~25 points. Unlike the prior window, the problem is no longer purely geographic: last window JP converted at a healthy 33.3% while TH/IL converted at 0%, so the leak was isolated to non-JP markets. This window **JP also dropped to 0%**, so the leak is now global. With 61 impressions and 0 page views, the app's search-result presentation is failing to earn a single tap-through to the product page across every market.

## Top 3 Improvement Actions

1. **Treat the search-result snippet as the emergency, not the product page.** With 0 page views on 44 finalized impressions, users are seeing Rewire in App Store Search results and not even tapping in. The product page itself can't be the problem — almost nobody reaches it. Focus on what shows in the *search result row*: app icon, app name, and the first 1-3 screenshots that App Store renders inline. A/B test a sharper icon and a screenshot set whose first frame states the value proposition in 3-4 words. This is App Store Product Page Optimization territory and it is the highest-leverage fix.

2. **Diagnose why JP went quiet, then re-pressure-test TH.** JP was the only converting market last window (33.3%) and produced 0 page views this window — find out what changed (ranking drop for a key term, a competitor launch, seasonality, or simply tiny-sample noise on 13 impressions). Separately, TH has now delivered 57 impressions across two windows with zero engagement; decide explicitly whether TH is a target market and, if not, prune the keywords surfacing Rewire there so impression volume reflects real intent.

3. **Fix the analytics pipeline — sixth consecutive run hitting the same three issues.** (a) Persist the report-request ID `394c257b-c76e-4779-9257-30c74024383a` (e.g. in `~/.config/asc/config.json` or a `request_id` file) so the fetch step stops failing with a `409 Conflict` on `POST /v1/analyticsReportRequests` and stops needing a manual `--request-id` recovery. (b) Fix `analyze_funnel.py` to aggregate the long-format ASC TSV on `Event` + `Counts` instead of expecting wide-format columns — it has produced an all-zero report six runs running. (c) Expand `REPORT_CATEGORIES` in `scripts/analytics/asc_client.py` to include App Usage and Commerce/Subscription so Downloads / Trial Starts / Paid become measurable; until then three of five funnel stages are unmeasured.

## Caveats

- **Tiny samples.** ~20 impressions/day means a single event swings the rates wildly. Treat day-level figures as directional only; even the window total (61 impressions) is small.
- **0.0% partly reflects reporting lag on 05-22.** The preliminary day may still gain page views in tomorrow's fetch. But the finalized days (05-20, 05-21) are already a confirmed 0/44, so the headline does not depend on the preliminary day.
- **Three of five funnel stages are unmeasured.** This is an Impression→Page-View report, not a full marketing funnel, until the missing ASC report categories are added.

## Pipeline notes (autonomous run)

- `python3 -m scripts.analytics.main` first failed with **`409 Conflict`** on `POST /v1/analyticsReportRequests` — an `ONGOING` report request already exists and `main.py` always tries to create a new one. `GET /v1/analyticsReportRequests` is not allowed by the API (`FORBIDDEN_ERROR` — collection GET disallowed). Recovered by re-running the fetch with the known request id `394c257b-c76e-4779-9257-30c74024383a` (recorded in the prior corrected report). Fetch then succeeded — 3 reports saved to `data/analytics/2026-05-23/`.
- The skill's `analyze_funnel.py` produced an all-zero report (`daily-report-2026-05-23.md` / `daily-metrics-2026-05-23.json`). This corrected file and `daily-metrics-2026-05-23-corrected.json` supersede those.
- All metrics in this report were computed in Python from the raw TSVs and cross-checked against the row-level data and the prior fetch.

*Report generated: 2026-05-24 (automated run)*
