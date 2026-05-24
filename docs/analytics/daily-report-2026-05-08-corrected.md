# Rewire Daily Analytics (Corrected) - 2026-05-08

_Window in fetched file: 2026-04-23 → 2026-05-08 (data-lag pattern)_

> ⚠️ The skill's `analyze_funnel.py` script reported zeros because its column mappings (`Impressions`, `Product Page Views`, etc.) don't match the actual ASC TSV format, which uses an `Event` column with values like `Impression`/`Page view`/`Tap` and a `Counts` column. The numbers below are the manually re-aggregated truth.

## Single-day funnel (App Store Discovery & Engagement)

| Stage | Count | Rate | vs Benchmark |
|-------|-------|------|--------------|
| Impressions | 27 | — | — |
| → Page Views | 2 | 7.4% | 🔴 Below (benchmark 25–35%) |
| → Taps (paid promo) | 0 | — | — |

Downloads / Trial Starts / Paid are **not present** in the fetched reports — App Usage and Subscription report categories were not returned by ASC for this request.

## 7-day rolling totals

Window: 2026-04-23 → 2026-05-08

- **Impression**: 96
- **Page view**: 16
- **Tap**: 4

## Source breakdown (single day)

| Source | Impression | Page view | Tap |
|--------|------------|-----------|-----|
| App Store search | 27 | 2 | 0 |

## Territory breakdown (single day)

| Territory | Impression | Page view | Tap |
|-----------|------------|-----------|-----|
| IL | 16 | 0 | 0 |
| TH | 6 | 0 | 0 |
| AZ | 2 | 2 | 0 |
| JP | 2 | 0 | 0 |
| ID | 1 | 0 | 0 |

## Retention messaging (cancel sheet, latest available day)

- **Page views**: 1
- **Cancels**: 1

## Bottleneck

**Page View Rate** is the visible bottleneck: 7.4% on 2026-05-08, well below the RevenueCat 25–35% benchmark. Caveat: traffic volume is very small (only 27 impressions), so day-to-day rate noise is high.

## Top 3 recommended actions

1. **Fix the analytics pipeline first.** Update `scripts/analyze_funnel.py` to aggregate the row-per-event ASC format (`Event` + `Counts`) so future daily runs surface real numbers automatically. Also extend `scripts/analytics/asc_fetch.py` (or its `REPORT_CATEGORIES` list) to pull App Usage and Subscription Events reports — without them the funnel below downloads is invisible.
2. **Improve impression → page view conversion.** Page-view rate has been single-digit % across most recent days. A/B test a clearer subtitle and the first screenshot to win more taps from the App Store search result row.
3. **Push for more impressions.** With only ~20–30 impressions/day, statistical signals are weak. Consider App Store Search Ads on the top-converting keywords, or a small TikTok creator burst, to lift volume into a range where conversion changes are measurable.

*Report generated: 2026-05-10 00:04*