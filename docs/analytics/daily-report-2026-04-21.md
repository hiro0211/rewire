# Rewire Daily Analytics - 2026-04-21

> ⚠️ **Data coverage**: the ASC ongoing-report batch dated **2026-04-21** contains event
> rows for **2026-04-18 → 2026-04-20** (3 days). Apple's
> analytics pipeline ships with a 1–2 day delay, so **2026-04-21 itself has no data yet**.
> The funnel below is aggregated across the days that arrived, with the most-recent day
> (2026-04-20) broken out separately.
>
> ⚠️ **Stock-script bug**: `analyze_funnel.py` expects wide-format columns (`Impressions`,
> `App Units`, …) but ASC returns long/event-format TSVs (`Event` × `Counts`). The stock
> report showed all zeros — this summary is produced from a direct re-parse of the raw TSV.

## Funnel Summary (2026-04-18 → 2026-04-20, aggregated)

| Stage | Count | Conversion Rate | vs Benchmark (RevenueCat) |
|-------|-------|----------------|---------------------------|
| Impressions | 26 | — | — |
| → Page Views | 3 | 11.5% | 🔴 Below (benchmark 25–35%) |
| → Downloads (Get tap) | 1 | 33.3% | ⚠️ Average (benchmark 30–40%) |
| → Trial Starts | n/a | n/a | subscription report not in this batch |
| → Paid | n/a | n/a | subscription report not in this batch |

### Most-recent day (2026-04-20) only
- Impressions: **12**
- Page Views: **0** (0.0%)
- Get taps: **0**
- Sample is still very small — treat rates as directional.

## Bottleneck Analysis

**Biggest drop-off is Page-View Rate (Impression → Page View)**: 11.5% vs benchmark 25%+ — gap of 13.5 pts.

Caveat: absolute volumes are tiny (26 impressions across 3 days). Individual users swing rates by several percentage points. Directional only.

## Channel Comparison (aggregated over batch)

| Channel | Impressions | Page Views | Get Taps | Impression → Page View |
|---------|-------------|------------|----------|------------------------|
| App Store Browse | 3 | 0 | 1 | 0.0% |
| App Store Search | 23 | 2 | 0 | 8.7% |
| Web Referral | 0 | 1 | 0 | — |

Highlights:
- **App Store Search** drove 23/26 impressions (88%) but only converted at 8.7% to page views if it produced page views — well below benchmark.
- **App Store Browse** is small volume (3 impressions) but produced the only Get tap in the batch.
- **TikTok**: no TikTok-tagged source rows appeared. Either TikTok-attributed traffic hasn't flowed in yet, or campaign links aren't tagging `ct=tiktok` for ASC attribution.
- Subscription metrics (trial starts / paid conversions / churn) are not available — the current ongoing-report request doesn't include the `SUBSCRIPTION` category.

### Top territories by impressions

- JP: 22
- MX: 2
- AE: 1
- IN: 1

## Top 3 Improvement Actions

1. **Fix App Store Search ASO.** Search drives most impressions but the impression→page-view rate is well below the 25–35% benchmark. Review title/subtitle keywords, the thumbnail screenshots shown in search results, and A/B test the icon — users are seeing the listing but not clicking.
2. **Confirm TikTok attribution is wired up.** No TikTok source rows appeared. Verify campaign URLs include `ct=tiktok&mt=8` (or a custom product-page token) so App Store Connect can attribute the traffic, and add the TikTok pixel → App Store conversion tracking.
3. **Patch `analyze_funnel.py` to parse the long/event TSV format** (Events × Counts) so future daily runs produce non-zero stock reports without manual re-parsing. Also add `SUBSCRIPTION` to `REPORT_CATEGORIES` so trial/paid/churn metrics flow through.

## Follow-ups

- Fix `analyze_funnel.py` long-format parser (bug recurring across daily runs).
- Add `SUBSCRIPTION` category to the ongoing ASC report request so full paid-funnel metrics flow through.
- Consider a 7-day-rolling aggregation window for statistically-meaningful conversion rates given current sub-10/day volume.

*Report generated: 2026-04-22 09:04 (auto re-parse after stock script produced all-zeros output)*