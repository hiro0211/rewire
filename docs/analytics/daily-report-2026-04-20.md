# Rewire Daily Analytics - 2026-04-20

> ⚠️ Note: the ASC "ongoing" report batch dated **2026-04-20** actually contains event rows
> for dates **2026-04-17 → 2026-04-19** (Apple's pipeline ships data with a 1–2 day delay).
> The funnel below is aggregated across those three days, with the most-recent day (2026-04-19)
> broken out separately.
>
> ⚠️ Known script bug: `analyze_funnel.py` expects wide-format columns (`Impressions`, `App Units`, …)
> but ASC now returns long/event-format TSVs (`Event`, `Counts`). The stock report showed all
> zeros — this summary is produced from a direct re-parse of the raw TSVs.

## Funnel Summary (2026-04-17 → 2026-04-19, aggregated)

| Stage | Count | Conversion Rate | vs Benchmark (RevenueCat) |
|-------|-------|----------------|---------------------------|
| Impressions | 38 | — | — |
| → Page Views | 10 | 26.3% | ⚠️ Average (low end of 25–35%) |
| → Downloads (Get tap) | 1 | 10.0% | 🔴 Below (benchmark 30–40%) |
| → Trial Starts | n/a | n/a | subscription report not in this batch |
| → Paid | n/a | n/a | subscription report not in this batch |

### Most-recent day (2026-04-19) only
- Impressions: **9**
- Page Views: **1** (11.1%)
- Get taps: **1** (100% of page views)
- Still sample-too-small for statistical conclusions.

## Bottleneck Analysis

**Biggest drop-off is Page-View → Download.** Only 1 of 10 product-page viewers tapped Get
(10% vs RevenueCat's 30–40% benchmark). Page-view rate from impressions is inside the benchmark
range but sits at the low end.

Caveat: absolute volumes are tiny (38 impressions over 3 days), so any single user's behaviour
swings the conversion numbers several percentage points. Treat this as directional, not conclusive.

## Channel Comparison (by ASC Source Type)

| Channel | Impressions | Page Views | Get Taps | Page-View Rate |
|---------|-------------|-----------|----------|----------------|
| App Store Search | 33 | 6 | 0 | 18.2% 🔴 |
| App Store Browse | 5 | 2 | 1 | 40.0% ✅ |
| Web Referral | 0 | 1 | 0 | — |
| Unavailable | 0 | 1 | 0 | — |

Highlights:
- **App Store Search** drove ~87% of all impressions but only 60% of page views; its
  impression→page-view rate (18%) is well below benchmark. Keyword/title mismatch suspected.
- **App Store Browse** is the strongest converter in this sample — 40% page-view rate and the
  only channel that generated a Get tap, despite only 5 impressions.
- **TikTok**: no TikTok-tagged source rows appeared in this batch. Either TikTok-attributed
  traffic hasn't flowed in yet, or campaign links aren't tagging `ct=tiktok` for ASC attribution.
- Subscription metrics (trial starts / paid conversions / churn) are not available — the
  `APP_USAGE` category reports returned no data, and no SUBSCRIPTION category is currently
  requested by the ongoing report.

## Top 3 Improvement Actions

1. **Fix App Store Search ASO.** Search drives most impressions but converts to page views at
   18% (vs 25–35% benchmark). Review title/subtitle keywords, screenshots shown in search
   thumbnails, and consider A/B testing the icon — users are seeing the listing but not clicking.
2. **Investigate the page-view → download gap.** 9/10 product-page viewers left without tapping
   Get. Audit the first 3 screenshots and the app preview video for clarity of value prop in
   the first 2 seconds, and check if the "Japanese" localisation string matches the search
   queries bringing users in (76% of traffic is JP).
3. **Confirm TikTok attribution is wired up.** No TikTok source rows appeared. Verify campaign
   URLs include `ct=tiktok&mt=8` (or a custom product-page token) so App Store Connect can
   attribute the traffic, and add the TikTok pixel → App Store conversion tracking.

## Follow-ups

- Patch `analyze_funnel.py` to parse the long/event format (Events × Counts) so future daily
  runs produce a non-zero stock report. (Bug: it currently looks for wide-format column names.)
- Add `SUBSCRIPTION` category to `REPORT_CATEGORIES` so trial/paid/churn metrics flow through.
- Volumes are very low — consider aggregating to a weekly or 7-day-rolling window for
  statistically meaningful funnel rates.

*Report generated: 2026-04-21 09:03 (manual re-parse after stock script produced all-zeros output)*
