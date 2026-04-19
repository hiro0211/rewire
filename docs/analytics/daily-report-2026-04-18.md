# Rewire Daily Analytics Report — 2026-04-18

> **Pipeline status**: Scheduled run at 2026-04-19 09:24 JST.
> ASC fetch for 2026-04-18 failed on the S3 segment download step (HTTP 400 on the presigned URL for `APP_STORE_ENGAGEMENT`, and no usable instance returned for `APP_USAGE`). This is the same S3 download issue flagged on 2026-04-17 and still unresolved.
> Analysis below uses the most recent successfully cached data — Apple impression/engagement events from **2026-04-03 through 2026-04-12** (10 days). No new data was added to `data/analytics/` today.

## Funnel Summary (what the local cache can tell us)

| Stage | Count (10-day cache) | Notes |
|-------|----------------------|-------|
| Impressions | 62 | Only the top-of-funnel side of the funnel is in the cache |
| → Page Views | 13 | Page-view rate 21.0% — below the 25–35% benchmark band |
| → Taps | 7 | 53.8% of page views tap through (healthy within-page signal) |
| Downloads | — | `app_downloads_standard.tsv` only exists for 2026-04-06; no value for yesterday |
| Trial Starts | — | Subscription events only cached for 2026-04-03 |
| Paid Conversions | — | Same — no fresh subscription data |
| Churn | — | Not computable without fresh subscription events |

The funnel from Download → Trial → Paid cannot be recomputed for 2026-04-18 because the ASC API did not deliver `APP_USAGE`, `app_downloads_standard`, or `subscription_events` reports for that date. The generated `docs/analytics/daily-report-2026-04-13.md` shows zeros for the same reason.

## Bottleneck Analysis

- **Data-pipeline bottleneck (critical)**: For the third consecutive day (2026-04-16 → 2026-04-18) the daily fetch is unable to complete a full report set. The S3 presigned URL that ASC hands back for `APP_STORE_ENGAGEMENT` is returning HTTP 400, and the `APP_USAGE` category is returning no matching instance for the target date. This blocks funnel analysis end-to-end.
- **Funnel signal (from cache)**: Among the 10 days that are cached, the impression → page-view conversion rate sits at 21.0% — under the RevenueCat 25–35% benchmark. This suggests the App Store listing (screenshots, subtitle, first impression) is the most likely product-side lever once the data pipeline is healthy again.

## Channel Breakdown (10-day cache)

| Source | Impressions | Page Views | Taps |
|--------|-------------|------------|------|
| App Store Search | 59 | 12 | 2 |
| App Store Browse | 3 | 0 | 5 |
| App Referrer | 0 | 1 | 0 |

Search dominates impressions (95%). Browse is tiny but has a disproportionate tap count (5 of 7 taps), consistent with users who browse being more intent-driven than those who scroll search results. No TikTok / Web Referrer events are present in the recent cache — either TikTok traffic has dried up, or those rows are only captured in the `app_downloads_standard` / subscription reports that failed to download.

## Top Territories (10-day cache)

| Territory | Impressions | Page Views | Taps |
|-----------|-------------|------------|------|
| JP | 48 | 13 | 7 |
| AU / PH / IN / VN / CN | 2 each | 0 | 0 |
| Others (US, HK, PK, CO, IQ, etc.) | ≤1 each | 0 | 0 |

JP is effectively the entire funnel — 100% of page views and 100% of taps. That aligns with the product positioning but also means any conversion-rate optimization should be JP-first.

## TikTok vs Organic Performance

**Not computable for 2026-04-18.** The last day where subscription / download channel data existed locally is 2026-04-03, already reported previously (TikTok trial→paid 40.0% vs organic 48.8%). No new signal is available until the S3 download issue is fixed.

## Top 3 Recommended Actions

1. **Unblock the ASC → S3 download path (highest priority).** `scripts/analytics/asc_client.download_segment` is re-sending the auth-bearer JWT header when it calls the presigned S3 URL, which can invalidate the S3 signature. Try calling `requests.get(url)` without any extra headers (the presigned URL already embeds its own auth). This is the most plausible cause of the consistent HTTP 400 on the same S3 path pattern. Once fixed, re-fetch 2026-04-14 through 2026-04-18 with `--date` to backfill.
2. **Teach `scripts.analytics.main` to reuse an existing ONGOING request.** Today's first call failed with a 409 because an ONGOING request (`394c257b-c76e-4779-9257-30c74024383a`) already exists. The scheduled run only recovered because we manually passed `--request-id`. The script should `GET /v1/apps/{id}/analyticsReportRequests` first and fall back to creating one only when none exists, so the cron works unattended.
3. **Improve the App Store page-view conversion.** Given the 21% impression → page-view rate against a 25–35% benchmark, set up a JP-focused A/B test on the subtitle and the first two screenshots, since JP is where all real signal lives. This is the one product-side lever worth moving while the data pipeline is being repaired.

## Data Pipeline Status

- **Target date**: 2026-04-18 (yesterday)
- **Report Request ID**: `394c257b-c76e-4779-9257-30c74024383a` (reused via `--request-id`)
- **Initial POST /analyticsReportRequests**: ❌ 409 Conflict (ONGOING request already exists — script lacks reuse logic)
- **API Authentication (JWT ES256)**: ✅ Working
- **Report Discovery**: ✅ Working (instances listed for target date)
- **Segment Download (S3 presigned)**: ❌ 400 Bad Request for `APP_STORE_ENGAGEMENT`; `APP_USAGE` returned no rows for 2026-04-18
- **Local cache written today**: None
- **Newest cached date**: 2026-04-13 (partial — discovery/engagement only)
- **Missing dates**: 2026-04-14, 2026-04-15, 2026-04-16, 2026-04-17, 2026-04-18

*Report generated: 2026-04-19 09:25 JST (automated scheduled task)*
