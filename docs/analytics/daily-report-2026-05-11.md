# Rewire Daily Analytics - 2026-05-11

> ⚠️ **No fresh data for 2026-05-11 yet.** The App Store Connect fetch returned **409 Conflict** (an analytics report request is already pending or cooling down). Analysis below is based on the latest data we already have on disk (`data/analytics/2026-05-10/`), which contains events for **0 → 1** due to ASC's normal 1–3 day reporting lag.
>
> The skill's `analyze_funnel.py` script reported zeros (known issue: its column mappings expect `Impressions`/`Product Page Views`/... but the ASC TSV is event-based with an `Event` column + `Counts` column). The numbers below are re-aggregated directly from the raw TSV in Python.

## Single-day funnel — 2026-05-09 (latest day with data)

| Stage | Count | Rate | vs Benchmark |
|-------|-------|------|--------------|
| Impressions | 7 | — | — |
| → Page Views | 1 | 14.3% | 🔴 Below (benchmark 25–35%) |
| → Taps (paid promo) | 0 | — | — |

Downloads / Trial Starts / Paid are **not present** in the fetched reports — App Usage and Subscription Events report categories were not returned by ASC for this fetch (same gap as the 2026-05-08 corrected report).

## Rolling window totals — 2026-05-07 → 2026-05-09

| Event | Counts |
|-------|--------|
| Impression | 53 |
| Page view | 5 |
| Tap | 1 |

Window page-view rate: **9.4%** (🔴 Below (benchmark 25–35%))

## Source breakdown — 2026-05-09

| Source | Impression | Page view | Tap |
|--------|-----------:|----------:|----:|
| App Store search | 7 | 0 | 0 |
| Web referrer | 0 | 1 | 0 |

## Territory breakdown — 2026-05-09

| Territory | Impression | Page view | Tap |
|-----------|-----------:|----------:|----:|
| JP | 4 | 1 | 0 |
| TH | 2 | 0 | 0 |
| TT | 1 | 0 | 0 |

## Retention messaging (cancel sheet, window 2026-05-07–2026-05-09)

- **Page views**: 1
- **Cancels**: 1

## Bottleneck

**Page View Rate** remains the visible bottleneck: **14.3%** on 2026-05-09 (window rolling: 9.4%). Both are well below the RevenueCat 25–35% benchmark. Caveat: traffic volume is tiny (7 impressions on 2026-05-09, 53 over the rolling window), so day-to-day rate noise is high and a single page view materially moves the rate.

## Channel comparison highlights

- **TikTok**: no impressions or events attributed to TikTok in this window — the TikTok campaign is either not running or not showing up in App Store Connect's source attribution yet.
- **Organic App Store Search**: dominates impressions (7 on 2026-05-09); no page views attributed to search on 2026-05-09.
- **Web Referrer**: 1 page view on 2026-05-09 with no associated impression in this report — suggests off-platform referral driving directly to the product page.

## Top 3 recommended actions

1. **Resolve the ASC 409 and fix the pipeline gaps.** Investigate the pending analytics report request (clear/cancel the existing ONGOING report if stuck), then extend `scripts/analytics/asc_fetch.py` to also pull **App Usage** and **Subscription Events** categories so Downloads / Trial Starts / Paid are visible. Also fix `analyze_funnel.py`'s column mappings to handle the row-per-event ASC TSV format (`Event` + `Counts`) instead of the legacy wide format — this is the same fix flagged in the 2026-05-08 corrected report and is still outstanding.
2. **Lift impression → page-view conversion.** Page-view rate is single-digit % to mid-teens across recent days, far below the 25–35% benchmark. A/B test a stronger subtitle and the first screenshot to win more taps from App Store search result rows. JP is currently the top impression territory — prioritize Japanese-language creative.
3. **Push for more impressions.** ~7–10 impressions/day is too sparse to detect any real conversion movement. Consider App Store Search Ads on top-converting keywords (Japanese first, given JP volume dominance), or a small TikTok creator burst, to lift volume into a range where conversion changes are statistically measurable.

*Report generated: 2026-05-12 (autonomous scheduled run)*