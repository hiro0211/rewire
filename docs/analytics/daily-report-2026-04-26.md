# Rewire Daily Analytics - 2026-04-26

> **Note:** App Store Connect has a ~2-day data processing lag. Analysis uses data through **2026-04-25**.
> Pipeline status: fetch success ✅ (request_id: `394c257b-c76e-4779-9257-30c74024383a`)

## Funnel Summary (latest date: 2026-04-25)

| Stage | Count | Conversion Rate |
|-------|-------|-----------------|
| Impressions | 7 | — |
| → Page Views | 9 | 128.57% |
| → Taps (Get/Open) | 0 | — |

### 10-Day Window (2026-04-16 → 2026-04-25)

| Metric | Value |
|--------|-------|
| Total Impressions | 71 |
| Total Page Views | 25 |
| Total Taps | 4 |
| Avg Page View Rate | 35.21% |

## Bottleneck Analysis

- **Page View Rate (10-day avg):** 35.21% — Above (RevenueCat benchmark: 25–35%)
- **Identified bottleneck:** None at the impression→page-view step.

The next stage to watch is **Page View → Tap**: only 4 taps from 25 page views over the past 10 days (~16%). Caveat: PVR > 100% on 2026-04-25 (9 PVs / 7 impressions) reflects ASC's source-attribution model — page views can originate from non-impression channels (direct links, version-history pages, browse navigation) and are not strictly bounded by impressions.

## Channel Comparison (2026-04-25)

| Channel | Impressions | Page Views | Taps |
|---------|-------------|-----------|------|
| App Store browse | 0 | 1 | 0 |
| App Store search | 7 | 8 | 0 |

> **Note:** No TikTok / Web Referral activity surfaced in the latest snapshot. All traffic is organic App Store discovery (Search + Browse).

## Top 3 Improvement Actions

1. **Push Page View → Tap (the actual current bottleneck).** With 4 taps from 25 page views over 10 days (~16%), conversion off the product page is weak. A/B test the first screenshot, the subtitle, and the "What's New" copy — these are the primary tap drivers once a user lands on the page.
2. **Localize the listing for top territories (JP, ID, IL, CN, AU).** Search impressions span multiple regions; tailored JP/EN copy and localized screenshots typically lift downstream conversion by 15–25%.
3. **Reactivate paid acquisition (TikTok / Web Referral).** Zero traffic from non-organic sources in the latest snapshot. A modest TikTok test (¥10,000–¥30,000/day) would expand top-of-funnel volume and create an A/B baseline against organic search.

*Report generated: 2026-04-27 by automated pipeline*
