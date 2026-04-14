# Rewire Daily Analytics - 2026-04-13 (data through 2026-04-12)

## Data Availability Note

The April 13 report instance was successfully fetched from App Store Connect, but the TSV
data rows cover dates through 2026-04-12. This is normal — ASC data processing has a ~1 day
lag. Below is the analysis for the most recent date with data.

The fetched report contains only **Impression** events (from "App Store Discovery and
Engagement Standard"). Product Page Views, Downloads, Trial Starts, and Paid Conversions
are not present in the dataset for this date. The APP_USAGE category reports (Sessions,
Installations, etc.) had no daily instances available yet in ASC.

## Funnel Summary (script output)

| Stage | Count | Conversion Rate | vs Benchmark |
|-------|-------|----------------|--------------|
| Impressions | 0 | N/A | — |
| → Page Views | 0 | N/A | — |
| → Downloads | 0 | N/A | — |
| → Trial Starts | 0 | N/A | — |
| → Paid | 0 | N/A | — |
| Churn Rate | 0/0 | N/A | — |

(The analyze_funnel.py script expects column-based metrics like `Impressions`; the event-row
TSV format returned by ASC does not populate these columns, so the script reports 0. Raw
event-level totals are below.)

## Raw Impression Totals (from TSV)

Total Impression events in file: **13**

| Date | Impressions |
|------|-------------|
| 2026-04-10 | 4 |
| 2026-04-11 | 7 |
| 2026-04-12 | 2 |

## Channel Breakdown

| Channel | Impressions |
|---------|-------------|
| App Store search | 13 |

100% of impressions came from App Store search. No TikTok, web referral, or browse
impressions were recorded.

## Territory Breakdown

| Territory | Impressions |
|-----------|-------------|
| JP | 8 |
| CN | 2 |
| PH | 1 |
| VN | 1 |
| HK | 1 |

Japan continues to be the dominant territory (~62% of impressions).

## Device Breakdown

| Device | Impressions |
|--------|-------------|
| iPhone | 9 |
| iPad | 4 |

## Bottleneck Analysis

Impression volume remains the primary bottleneck — with only 2-7 impressions/day, there is
not enough top-of-funnel traffic to measure downstream conversion meaningfully. The funnel
cannot be optimized until impression volume grows by 1-2 orders of magnitude.

## Top 3 Improvement Actions

1. **Drive impression volume with TikTok/paid channels.** Organic App Store search alone is
   delivering single-digit impressions/day. Launch or re-activate TikTok campaigns to get
   the funnel to a measurable scale (target: 500+ impressions/day).
2. **ASO for Japanese keywords.** JP drives 62% of impressions on very low volume — expand
   Japanese keyword coverage and localize the subtitle/screenshots to capitalize on the
   strongest organic market.
3. **Verify ASC data pipeline.** Product Page Views, Downloads, and subscription metrics
   are absent from the fetched reports. Confirm the ONGOING report request has the right
   report types subscribed, and backfill missing report categories (APP_USAGE daily
   instances were empty).

*Report generated: 2026-04-14*
