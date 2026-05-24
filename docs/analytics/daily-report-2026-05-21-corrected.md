# Rewire Daily Analytics (Corrected) - 2026-05-21

_Processing date: 2026-05-21. Data window inside fetched reports: 2026-05-18 -> 2026-05-20 (standard 1-3 day ASC reporting lag; the requested day 2026-05-21 is not yet present)._

> WARNING: the skill's `analyze_funnel.py` reported zeros again because its column mappings (`Impressions`, `Product Page Views`, ...) don't match the actual ASC TSV format, which is long-format: an `Event` column with values `Impression`/`Page view`/`Tap` plus a `Counts` column. The numbers below are the re-aggregated truth (computed in Python). Same bug as `daily-report-2026-05-08-corrected.md`, `-05-17-`, and `-05-20-` -- still unfixed.

## Single-day funnel (latest complete data = 2026-05-19)

| Stage | Count | Rate | vs Benchmark |
|-------|-------|------|--------------|
| Impressions | 21 | — | — |
| -> Page Views | 8 | 38.1% | ✅ Above (benchmark 25-35%) |
| -> Taps (Get) | 2 | — | — |

The most recent day in the window, **2026-05-20**, currently shows 26 impressions and 0 page views -- it is almost certainly still being finalized by ASC, so 2026-05-19 is used as the latest complete day.

Downloads / Trial Starts / Paid are **not present** in the fetched reports -- the App Usage and Commerce/Subscription report categories were not returned by ASC for this request, so the full funnel cannot be measured.

## 3-day rolling totals (2026-05-18 -> 2026-05-20)

- **Impressions**: 70
- **Page views**: 10  ->  window page-view rate **14.3%** 🔴 Below benchmark
- **Taps**: 2

| Date | Impressions | Page views | Taps | Page-view rate |
|------|-------------|------------|------|----------------|
| 2026-05-18 | 23 | 2 | 0 | 8.7% |
| 2026-05-19 | 21 | 8 | 2 | 38.1% |
| 2026-05-20 | 26 | 0 | 0 | 0.0% |

Prior window (2026-05-17 -> 2026-05-19, from `daily-metrics-2026-05-20-corrected.json`): 64 impressions, 10 page views (rate 15.6%), 4 taps. The two windows overlap on 05-18 and 05-19, so this is a rolling view, not a clean week-over-week comparison. Impression volume edged up (64 -> 70); page-view rate is roughly flat (15.6% -> 14.3%).

## Source breakdown (3-day window)

| Source | Impressions | Page views | Taps | Page-view rate |
|--------|-------------|------------|------|----------------|
| App Store search | 59 | 10 | 1 | 17.0% |
| App Store browse | 11 | 0 | 1 | 0.0% |

All traffic is organic. **No TikTok-attributed and no web-referral impressions** appear in this window -- the App Store Web Preview report shows only 2 page views.

## Territory breakdown (3-day window)

| Territory | Impressions | Page views | Taps |
|-----------|-------------|------------|------|
| JP | 28 | 8 | 2 |
| TH | 18 | 0 | 0 |
| IL | 17 | 1 | 0 |
| AF | 2 | 1 | 0 |
| MN | 2 | 0 | 0 |
| ID | 1 | 0 | 0 |
| AU | 1 | 0 | 0 |
| LK | 1 | 0 | 0 |

## Bottleneck

**Impression -> Page View** is the bottleneck over the 3-day window: 10 / 70 = **14.3%**, below the 25-35% RevenueCat benchmark. JP carries the funnel (8 of 10 page views and all 2 taps). TH and IL together generate 35 impressions but only 1 page view -- impressions there are essentially not converting to product-page visits.

## Top 3 Improvement Actions

1. **Rework App Store search creatives (icon, screenshots, subtitle).** App Store search drives 59 of 70 impressions and ~83% never reach the product page. Prioritize localized screenshots for JP (best converter) and for the high-impression / near-zero-conversion markets (TH, IL).
2. **Confirm the 2026-05-19 page-view spike.** That day hit 38.1% page-view rate vs 8.7% the day before. Check whether a recent ASO change (keywords, screenshots, subtitle) caused it; if so, lock it in and A/B test further. Samples are tiny (~21 impressions/day), so re-verify once days finalize.
3. **Fix the pipeline.** Expand `REPORT_CATEGORIES` in `scripts/analytics/asc_client.py` to include App Usage + Commerce/Subscription so Downloads / Trial / Paid are tracked, fix `analyze_funnel.py` to aggregate on `Event` + `Counts`, and persist the report-request id so the fetch step stops failing with 409.

## Pipeline notes (autonomous run)

- `python3 -m scripts.analytics.main` first failed with `409 Conflict` on `POST /v1/analyticsReportRequests` because an `ONGOING` report request already exists. Re-ran with the existing request id (`394c257b-c76e-4779-9257-30c74024383a`, discovered via `GET /v1/apps/6759087214/analyticsReportRequests`; the bare list endpoint returned 403). Data fetch then succeeded -- 2 reports saved to `data/analytics/2026-05-21/`.
- The skill's `analyze_funnel.py` produced an all-zero report (`daily-report-2026-05-21.md` / `daily-metrics-2026-05-21.json`). This corrected file and `daily-metrics-2026-05-21-corrected.json` supersede those.
- Recurring issue: the 409-conflict workaround and the column-mapping bug have now hit four consecutive runs (05-08, 05-17, 05-20, 05-21).

*Report generated: 2026-05-22 (automated run)*