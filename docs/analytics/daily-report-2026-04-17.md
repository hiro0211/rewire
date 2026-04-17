# Rewire Daily Analytics Report — 2026-04-17

> **Note**: API data download from S3 failed for Apr 14-16 (HTTP 400 on presigned URLs).
> Analysis below uses the most recent available data through **Apr 12** (real API data)
> and **Apr 3** seed data for subscription/download metrics.

## Funnel Summary (Composite View)

| Stage | Count | Rate | vs Benchmark |
|-------|-------|------|--------------|
| Impressions | 111 (API) / 14,000 (seed) | — | — |
| → Page Views | 28 (API) / 4,310 (seed) | 25.2% (API) / 30.8% (seed) | ⚠️ Average |
| → Downloads | 1,450 (seed) | 33.6% | ⚠️ Average |
| → Trial Starts | 293 (seed) | 20.2% | ⚠️ Average |
| → Paid | 136 (seed) | 46.4% | ⚠️ Average |
| Churn | 14/440 (seed) | 3.2% | ✅ Good |

## Daily Impression Trend (Real API Data)

| Date | Impressions | Page Views | Taps |
|------|-------------|------------|------|
| 2026-04-03 | 8 | 0 | 0 |
| 2026-04-04 | 22 | 22 | 14 |
| 2026-04-05 | 16 | 0 | 0 |
| 2026-04-06 | 20 | 4 | 0 |
| 2026-04-07 | 7 | 0 | 0 |
| 2026-04-08 | 6 | 0 | 0 |
| 2026-04-09 | 4 | 2 | 0 |
| 2026-04-10 | 12 | 0 | 0 |
| 2026-04-11 | 14 | 0 | 0 |
| 2026-04-12 | 2 | 0 | 0 |
| **Total** | **111** | **28** | **14** |

## Channel Breakdown (Real API Data)

| Source | Impressions | Page Views | Taps |
|--------|-------------|------------|------|
| App Store browse | 6 | 0 | 10 |
| App Store search | 105 | 24 | 4 |
| App referrer | 0 | 2 | 0 |
| Unavailable | 0 | 2 | 0 |

## Channel Breakdown (Seed Data — Apr 3)

| Source | Impressions | Page Views | Downloads | Trials | Paid |
|--------|-------------|------------|-----------|--------|------|
| App Store Search | 8500 | 2800 | 950 | — | — |
| App Store Browse | 3200 | 640 | 180 | — | — |
| Web Referrer (tiktok.com) | 1800 | 720 | 280 | — | — |
| Web Referrer (other) | 500 | 150 | 40 | — | — |
| App Store Search (subs) | — | — | — | 190 | 95 |
| App Store Browse (subs) | — | — | — | 25 | 10 |
| Web Referrer (tiktok.com) (subs) | — | — | — | 70 | 28 |
| Web Referrer (other) (subs) | — | — | — | 8 | 3 |

## Territory Breakdown (Real API Data)

| Territory | Impressions | Page Views | Taps |
|-----------|-------------|------------|------|
| JP | 82 | 26 | 14 |
| VN | 5 | 0 | 0 |
| CN | 5 | 0 | 0 |
| AU | 4 | 0 | 0 |
| PH | 4 | 0 | 0 |
| IN | 3 | 0 | 0 |
| HK | 3 | 0 | 0 |
| US | 2 | 0 | 0 |
| CO | 2 | 0 | 0 |
| PK | 1 | 0 | 0 |
| IQ | 0 | 2 | 0 |

## Bottleneck Analysis

All funnel stages are at or above benchmark. No critical bottleneck detected.

## TikTok vs Organic Performance (Seed Data)

- **TikTok**: 70 trials → 28 paid (40.0% conversion)
- **Organic (App Store)**: 215 trials → 105 paid (48.8% conversion)
- TikTok conversion is **8.8% lower** than organic — users from TikTok are less committed.

## Top 3 Recommended Actions

1. **Fix the S3 download issue**: The presigned URL downloads are returning HTTP 400. This may be a network/proxy issue or expired tokens. Investigate the download_segment method in asc_client.py.
2. **Expand data collection**: Only Discovery & Engagement reports are downloading. Ensure APP_USAGE reports (sessions, active devices) are also being fetched.
3. **Analyze TikTok ROI**: With TikTok trial-to-paid at 40.0% vs organic at 48.8%, evaluate if TikTok ad spend is justified given the lower conversion quality.

## Data Pipeline Status

- **Report Request ID**: `394c257b-c76e-4779-9257-30c74024383a`
- **API Authentication**: ✅ Working (JWT ES256)
- **Report Discovery**: ✅ Working (finding instances for all dates)
- **Data Download**: ❌ Failing (S3 presigned URLs returning HTTP 400)
- **Available Date Range**: 2026-04-03 to 2026-04-13 (local cache)
- **Missing Dates**: 2026-04-14 to 2026-04-16 (download failures)

*Report generated: 2026-04-17 09:05 (automated pipeline)*