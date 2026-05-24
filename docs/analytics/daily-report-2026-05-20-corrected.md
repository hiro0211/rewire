# Rewire Daily Analytics (Corrected) - 2026-05-20

_Processing date: 2026-05-20. Data window inside fetched reports: 2026-05-17 → 2026-05-19 (standard 1–3 day ASC reporting lag; the requested day 2026-05-20 is not yet present)._

> ⚠️ The skill's `analyze_funnel.py` script reported zeros again because its column mappings (`Impressions`, `Product Page Views`, …) don't match the actual ASC TSV format, which is long-format: an `Event` column with values `Impression`/`Page view`/`Tap` plus a `Counts` column. The numbers below are the manually re-aggregated truth (computed in Python). This is the same bug noted in `daily-report-2026-05-08-corrected.md` and `daily-report-2026-05-17-corrected.md` — still unfixed.

## Single-day funnel (latest data = 2026-05-19)

| Stage | Count | Rate | vs Benchmark |
|-------|-------|------|--------------|
| Impressions | 21 | — | — |
| → Page Views | 8 | 38.1% | ✅ Above (benchmark 25–35%) |
| → Taps (Get) | 2 | — | — |

Downloads / Trial Starts / Paid are **not present** in the fetched reports — the App Usage and Commerce/Subscription report categories were not returned by ASC for this request, so the full funnel cannot be measured.

## 3-day rolling totals (2026-05-17 → 2026-05-19)

- **Impressions**: 64
- **Page views**: 10  →  window page-view rate **15.6%** 🔴 Below benchmark
- **Taps**: 4

| Date | Impressions | Page views | Taps | Page-view rate |
|------|-------------|------------|------|----------------|
| 2026-05-17 | 20 | 0 | 2 | 0.0% |
| 2026-05-18 | 23 | 2 | 0 | 8.7% |
| 2026-05-19 | 21 | 8 | 2 | 38.1% |

The most recent day (2026-05-19) jumped well above benchmark, but the sample is tiny (21 impressions) and ASC's latest day is often still being finalized — treat the uptick as encouraging but unconfirmed.

## Source breakdown (3-day window)

| Source | Impressions | Page views | Taps |
|--------|-------------|------------|------|
| App Store search | 57 | 10 | 3 |
| App Store browse | 7 | 0 | 1 |

All traffic is organic. **No TikTok-attributed and no web-referral impressions** appear in this window — the App Store Web Preview report shows only 2 page views (Edge browser, JP, 2026-05-18).

## Territory breakdown (3-day window)

| Territory | Impressions | Page views | Taps |
|-----------|-------------|------------|------|
| JP | 29 | 8 | 4 |
| IL | 18 | 1 | 0 |
| TH | 7 | 0 | 0 |
| MN | 3 | 0 | 0 |
| AF | 2 | 1 | 0 |
| NP | 1 | 0 | 0 |
| VN | 1 | 0 | 0 |
| ID | 1 | 0 | 0 |
| AU | 1 | 0 | 0 |
| LK | 1 | 0 | 0 |

## Bottleneck

**Impression → Page View** is the bottleneck over the 3-day window: 10 / 64 = **15.6%**, below the 25–35% RevenueCat benchmark. JP carries the funnel (8 of 10 page views and all 4 taps). IL is the second-largest impression source (18) but converts almost nothing to the product page (1 page view, 0 taps).

## Top 3 Improvement Actions

1. **Rework App Store search creatives (icon, screenshots, subtitle).** 89% of impressions come from search and ~84% never reach the product page over the window. Prioritize localized screenshots for JP (best converter) and IL (high impressions, near-zero page views).
2. **Confirm and capitalize on the 2026-05-19 uptick.** Page-view rate rose 0% → 8.7% → 38.1% across the three days. Check whether a recent ASO change (keywords, screenshots, subtitle) drove it; if so, lock it in and A/B test further. Re-verify once the day finalizes.
3. **Enable the App Usage + Commerce/Subscription report categories** in the ASC pipeline (expand `REPORT_CATEGORIES` in `scripts/analytics/asc_client.py`) so Downloads / Trial / Paid stages are tracked end-to-end, and **fix `analyze_funnel.py`** to aggregate on `Event` + `Counts` instead of non-existent wide-format columns.

## Pipeline notes (autonomous run)

- `python3 -m scripts.analytics.main` first failed with `409 Conflict` on `POST /v1/analyticsReportRequests` because an `ONGOING` report request already exists. Re-ran with the existing request id (`394c257b-c76e-4779-9257-30c74024383a`, discovered via `GET /v1/apps/6759087214/analyticsReportRequests`). Data fetch then succeeded — 2 reports saved to `data/analytics/2026-05-20/`.
- The skill's `analyze_funnel.py` produced an all-zero report (`daily-report-2026-05-20.md` / `daily-metrics-2026-05-20.json`). This corrected file and `daily-metrics-2026-05-20-corrected.json` supersede those.
- Recurring issue: the 409-conflict workaround and the column-mapping bug have now hit three consecutive runs. Worth (a) persisting the report-request id in config, and (b) fixing the funnel parser.

*Report generated: 2026-05-21 (automated run)*
