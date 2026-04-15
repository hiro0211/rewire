# Rewire Daily Analytics - 2026-04-13 (data through 2026-04-12)

## Data Availability Note

Today's fetch from App Store Connect returned **409 Conflict** on the analytics report request endpoint
(an ONGOING request already exists for this app). No new TSV was ingested today. The existing
`data/analytics/2026-04-13/` directory was populated yesterday and contains events dated
2026-04-10 through 2026-04-12. This is consistent with ASC's ~1 day processing lag.

The most recent date with data is **2026-04-12** (2 impressions).

## Funnel Summary (2026-04-12)

| Stage | Count | Conversion Rate | vs Benchmark |
|-------|-------|----------------|--------------|
| Impressions | 2 | — | — |
| → Page Views | 0 | 0.0% | 🔴 Below (25-35%) |
| → Downloads | 0 | N/A | — |
| → Trial Starts | 0 | N/A | — |
| → Paid | 0 | N/A | — |

## 3-Day Impression Trend

| Date | Impressions | Source |
|------|-------------|--------|
| 2026-04-10 | 4 | App Store search |
| 2026-04-11 | 7 | App Store search |
| 2026-04-12 | 2 | App Store search |

Impressions dropped ~71% day-over-day (7 → 2). This is an extremely low volume and the trend
is moving in the wrong direction.

## Channel Breakdown (across 4/10–4/12)

| Channel | Impressions | Page Views | Downloads |
|---------|-------------|------------|-----------|
| App Store Search | 13 | 0 | 0 |
| App Store Browse | 0 | 0 | 0 |
| TikTok | 0 | 0 | 0 |
| Web Referral | 0 | 0 | 0 |

100% of impressions came from App Store Search. Zero browse/editorial visibility and no
external traffic (TikTok / web) during this window.

## Bottleneck Analysis

The dominant bottleneck remains at the **top of funnel (discovery)**. With only 2 impressions
yesterday and zero page views, there is no opportunity for mid-funnel or conversion optimization
to move the needle. Fixing impression volume is prerequisite to learning anything about the
page-view and download rates.

## Top 3 Improvement Actions

1. **ASO keyword expansion** — Search-only visibility at 2–7 impressions/day indicates very
   narrow keyword coverage. Research competitor keywords in the wellness/habit-tracking space
   and add relevant long-tail keywords to the app subtitle and keyword field this week.

2. **Restart paid acquisition** — With zero TikTok or web-referral traffic detected, even a
   small test budget (¥10k–¥30k) on TikTok or Apple Search Ads would meaningfully diversify
   acquisition and surface page-view / download rates for the first time.

3. **Resolve the 409 on the ASC analytics request** — The daily fetch has been failing with
   a conflict. Check `scripts/analytics/` for the existing ONGOING request ID and either
   reuse it or delete-and-recreate, so fresh data lands automatically each day.

*Report generated: 2026-04-15 09:05 (enriched from event-based TSV)*
