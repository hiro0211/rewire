# Rewire Daily Analytics (Corrected) - 2026-05-22

_Processing date: 2026-05-22. Data window inside the fetched reports: 2026-05-19 -> 2026-05-21 (standard 1-3 day ASC reporting lag; the requested day 2026-05-22 is not yet present)._

> WARNING: the skill's `analyze_funnel.py` reported all zeros again. Its column mappings (`Impressions`, `Product Page Views`, ...) do not match the actual ASC TSV format, which is long-format: an `Event` column with values `Impression` / `Page view` / `Tap` plus a `Counts` column. The numbers below are the re-aggregated truth, computed in Python. Same bug as `daily-report-2026-05-08-corrected.md`, `-05-17-`, `-05-20-`, and `-05-21-` -- now **five consecutive runs**, still unfixed.

## Funnel Summary (3-day window, 2026-05-19 -> 2026-05-21)

| Stage | Count | Conversion Rate | vs Benchmark |
|-------|-------|-----------------|--------------|
| Impressions | 65 | — | — |
| → Page Views | 8 | 12.3% | 🔴 Below (benchmark 25-35%) |
| → Taps ("Get") | 3 | — | — |
| → Downloads | n/a | — | not in fetched reports |
| → Trial Starts | n/a | — | not in fetched reports |
| → Paid | n/a | — | not in fetched reports |

Only the first funnel stage (Impression → Page View) is measurable. **Downloads, Trial Starts, and Paid conversions are not present** in the fetched data — the App Store Discovery & Engagement reports do not contain them. The App Usage and Commerce/Subscription report categories were not returned for this request, so the full Impressions → Page Views → Downloads → Trial → Paid funnel cannot be measured. "Taps" (Get-button taps) are a download-*intent* proxy, not actual downloads.

## Per-day breakdown

| Date | Status | Impressions | Page views | Taps | Page-view rate |
|------|--------|-------------|------------|------|----------------|
| 2026-05-19 | finalized | 21 | 8 | 2 | 38.1% |
| 2026-05-20 | finalized | 26 | 0 | 0 | 0.0% |
| 2026-05-21 | preliminary | 18 | 0 | 1 | 0.0% |

"Finalized" means the day's counts are identical to the previous run's fetch (stable across two fetches a day apart). "Preliminary" is the newest day in the window — ASC posts impressions first and page-view/tap data lags, so 2026-05-21's zero page views are very likely an artifact of incomplete data, not a real zero.

Note: 2026-05-20 now reads 26 impressions / 0 page views and is **unchanged** from when it was the bleeding-edge day in the prior run. Two stable fetches strongly suggest this is a genuine zero-page-view day, not a lag artifact — 26 impressions produced no product-page visits at all.

Because 05-21 is still preliminary, the 3-day window rate (12.3%) is dragged down by an incomplete day. The finalized-only portion (05-19 + 05-20: 8 page views / 47 impressions) is **17.0%** — still below the 25-35% benchmark, but the more reliable read.

## Window-over-window comparison

| Window | Dates | Impressions | Page views | Page-view rate |
|--------|-------|-------------|------------|----------------|
| Current | 2026-05-19 → 05-21 | 65 | 8 | 12.3% |
| Prior   | 2026-05-18 → 05-20 | 70 | 10 | 14.3% |

Source: prior figures from `daily-metrics-2026-05-21-corrected.json`. The two windows overlap on 05-19 and 05-20, so this is a rolling view, not a clean week-over-week comparison. Impression volume is roughly flat (70 → 65); the page-view rate slipped (14.3% → 12.3%), but much of that slip is the still-preliminary 05-21 day. No clear trend change — volume and conversion are both weak and stable.

## Channel Comparison

| Channel | Impressions | Page views | Taps | Page-view rate |
|---------|-------------|------------|------|----------------|
| App Store Search | 53 | 8 | 2 | 15.1% |
| App Store Browse | 12 | 0 | 1 | 0.0% |

All traffic is organic. **No TikTok-attributed impressions and no web-referral impressions** appear in this window. The separate App Store Web Preview report shows just **1 page view** (Chrome Mobile, JP, source "Unavailable"). For the fifth run in a row there is effectively no measurable paid/social acquisition — the TikTok-vs-organic comparison the pipeline is meant to produce cannot be made because no TikTok campaign-link traffic is being captured.

## Territory breakdown (3-day window)

| Territory | Impressions | Page views | Taps |
|-----------|-------------|------------|------|
| TH | 27 | 0 | 0 |
| JP | 24 | 8 | 3 |
| IL | 9 | 0 | 0 |
| NP | 2 | 0 | 0 |
| LK | 1 | 0 | 0 |
| AU | 1 | 0 | 0 |
| MN | 1 | 0 | 0 |

**JP carries the entire funnel**: all 8 page views and all 3 taps come from JP (24 impressions → 33.3% page-view rate, comfortably within benchmark). Every other territory converts at 0%. **TH is the single biggest waste**: 27 impressions — more than any other market — and zero page views, zero taps.

## Bottleneck

**Impression → Page View** is the bottleneck: 8 / 65 = **12.3%** over the window (17.0% on finalized days only), against the 25-35% RevenueCat benchmark — a gap of roughly 8-13 points. The problem is geographic, not global: JP converts impressions to page views at a healthy 33.3%, while TH (27 impressions) and IL (9 impressions) convert at 0%. The funnel is not leaking everywhere — it is leaking in the non-JP markets, which together account for 41 of 65 impressions.

## Top 3 Improvement Actions

1. **Localize the App Store listing for the markets that are getting impressions but no clicks.** App Store Search drives 53 of 65 impressions (82%) and ~85% never reach the product page. JP (the only converting market) is at 33.3% — lock that in. TH and IL receive 36 combined impressions and convert nobody. Add localized screenshots / metadata for TH, or, if TH is not a target market, treat action 2 first.

2. **Investigate the TH impression block.** 27 TH impressions with 0 engagement is the clearest inefficiency in the funnel. Check which keywords/terms surface Rewire in TH and whether they are relevant; if the app is appearing for off-target searches, prune those keywords. Decide explicitly whether TH is a target market — right now it is the #1 impression source and a 0% converter.

3. **Fix the analytics pipeline (5th consecutive run hitting the same issues).** (a) Persist the report-request ID `394c257b-c76e-4779-9257-30c74024383a` (e.g. in config) so the fetch step stops failing with a 409 Conflict on `POST /v1/analyticsReportRequests`. (b) Fix `analyze_funnel.py` to aggregate the long-format ASC TSV on `Event` + `Counts` instead of expecting wide-format columns. (c) Expand `REPORT_CATEGORIES` in `scripts/analytics/asc_client.py` to include App Usage and Commerce/Subscription so Downloads / Trial Starts / Paid become measurable — until then, three of the five funnel stages are blind.

## Caveats

- **Tiny samples.** ~20 impressions/day means single events swing the rates wildly (05-19's 38.1% rests on just 8 page views). Treat day-level rates as directional only; the window total is the more stable figure.
- **Three of five funnel stages are unmeasured.** This is an Impression→Page-View report, not a full marketing-funnel report, until the missing ASC report categories are added.

## Pipeline notes (autonomous run)

- `python3 -m scripts.analytics.main` first failed with **`409 Conflict`** on `POST /v1/analyticsReportRequests` — an `ONGOING` report request already exists. Recovered by listing existing requests via `GET /v1/apps/6759087214/analyticsReportRequests`, finding the existing id `394c257b-c76e-4779-9257-30c74024383a`, and re-running the fetch with `--request-id`. Fetch then succeeded — 2 reports saved to `data/analytics/2026-05-22/`.
- The skill's `analyze_funnel.py` produced an all-zero report (`daily-report-2026-05-22.md` / `daily-metrics-2026-05-22.json`). This corrected file and `daily-metrics-2026-05-22-corrected.json` supersede those.
- All metrics in this report were computed in Python from the raw TSVs and cross-checked against the row-level data.

*Report generated: 2026-05-23 (automated run)*
