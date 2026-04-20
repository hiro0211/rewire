# Rewire Daily Analytics Report — 2026-04-20

> **Pipeline status**: Scheduled run at 2026-04-20 09:04 JST.
> ASC fetch for 2026-04-19 failed again. Same root cause as the last four days: `POST /v1/analyticsReportRequests` returns **409 Conflict** (an ONGOING request already exists), and when the run is retried with `--request-id 394c257b-c76e-4779-9257-30c74024383a`, the `APP_STORE_ENGAGEMENT` segment download from the S3 presigned URL returns **HTTP 400**, and `APP_USAGE` returns no matching instance.
> Analysis below reuses the most recent cached data — Apple impression/engagement events from **2026-04-03 through 2026-04-12** (10 days). No new data was added to `data/analytics/` today. The auto-generated `daily-report-2026-04-13.md` is all zeros because `analyze_funnel.py` expects ASC-dashboard column names (`Impressions`, `Product Page Views`, …) and the cached file uses the newer row-per-event schema (`Event`, `Counts`).

## Funnel Summary (10-day cache, engagement side)

| Stage | Count | Rate | Benchmark | Status |
|-------|-------|------|-----------|--------|
| Impressions | 111 | — | — | — |
| → Page views | 26 | 23.4% | 25–35% | ⚠️ just below |
| → Taps (Get/buy tapped) | 14 | 53.8% of PV | — | ✅ healthy in-page signal |
| Downloads | — | — | 30–40% of PV | ❌ not in cache (only 1 row from 2026-04-04) |
| Trial Starts | — | — | 15–25% of DL | ❌ stale (2026-04-03 only) |
| Paid | — | — | 40–60% of trials | ❌ stale (2026-04-03 only) |
| Churn | — | — | 5–8% monthly | ❌ stale (2026-04-03 only) |

The download → trial → paid portion cannot be recomputed for 2026-04-19 because the ASC API has not delivered `APP_USAGE`, `app_downloads_standard`, or `subscription_events` reports since 2026-04-06 / 2026-04-03 respectively.

### Reference funnel from 2026-04-03 (last complete-funnel day in cache)

| Stage | Rate | Benchmark | Status |
|-------|------|-----------|--------|
| Page View rate | 30.8% | 25–35% | ✅ mid-band |
| Download rate | 33.6% | 30–40% | ✅ mid-band |
| Trial Start rate | 20.2% | 15–25% | ✅ mid-band |
| Trial → Paid rate | 46.4% | 40–60% | ✅ low-mid band |
| Monthly Churn | 3.2% | 5–8% | ✅ better than benchmark |

When the pipeline was working (2026-04-03), every funnel stage was inside or better than the RevenueCat benchmark band — the product economics look fundamentally healthy. The alarm is operational, not product.

## Bottleneck Analysis

1. **Data-pipeline bottleneck — critical, now on day 5.** The daily fetch has been unable to complete a full report set since 2026-04-16. Both failure modes from yesterday's report still reproduce today:
   - `create_report_request()` always 409s because an ONGOING request already exists; the cron only works when a human passes `--request-id`.
   - The presigned S3 URL returned by ASC for `APP_STORE_ENGAGEMENT` returns HTTP 400, which is consistent with the bearer-JWT header being re-sent on the S3 GET and invalidating the S3 signature.
2. **Product-side bottleneck — impression → page view.** From the 10-day cache, 23.4% sits just under the 25–35% band. Note, though, that the richer 2026-04-03 snapshot showed 30.8% — so the recent dip may be sampling noise on very small volumes (111 impressions in 10 days). Worth a JP-focused A/B test on subtitle + first two screenshots, but do not treat it as confirmed until the pipeline is fixed and weekly volumes are restored.

## Channel Breakdown

### From 10-day cache (engagement only)

| Source | Impressions | Page Views | Taps |
|--------|-------------|------------|------|
| App Store Search | 105 (95%) | 24 | 4 |
| App Store Browse | 6 | 0 | 10 |
| App Referrer | 0 | 2 | 0 |

Search is effectively the entire top of funnel. Browse volume is tiny but converts disproportionately at the tap step (10 of 14 taps), consistent with higher-intent browse users — but the sample is too small to act on.

### From 2026-04-03 (full-funnel, for channel economics)

| Source | PV% | DL% | Trial% | T→P% | Monthly Churn |
|--------|----:|----:|-------:|-----:|--------------:|
| App Store Search | 32.9% | 33.9% | 20.0% | **50.0%** | 2.5% |
| App Store Browse | 20.0% | 28.1% | 13.9% | 40.0% | 6.7% |
| Web Referrer (tiktok.com) | **40.0%** | **38.9%** | **25.0%** | 40.0% | 3.3% |
| Web Referrer (other) | 30.0% | 26.7% | 20.0% | 37.5% | 6.7% |

## TikTok vs Organic

From the 2026-04-03 snapshot — still the only day with channel-level subscription data in the cache:

- **TikTok is the best top-of-funnel** on every rate up to Trial: PV 40.0%, DL 38.9%, Trial 25.0%. Traffic quality is excellent.
- **TikTok under-converts at Trial → Paid**: 40.0% vs App Store Search's 50.0%. A ~10-point gap at the final monetization step is the single largest channel lever in the data.
- **TikTok churn is fine**: 3.3% monthly, between Search (2.5%) and Browse (6.7%).

Net read: TikTok is efficiently delivering the right users into Trial, but something between Trial and Paid (paywall offer, onboarding, first-week engagement) drops ~20% more of them than Search. That delta, not CAC, is where TikTok ROI should be fought for.

## Top Territories (10-day cache)

| Territory | Impressions | Page Views | Taps |
|-----------|------------:|-----------:|-----:|
| JP | 82 | 26 | 14 |
| VN / CN | 5 each | 0 | 0 |
| AU / PH | 4 each | 0 | 0 |
| IN / HK | 3 each | 0 | 0 |
| Others (US, PK, CO, IQ, …) | ≤2 each | 0 | 0 |

JP generates 100% of the page views and 100% of the taps. Any listing-level optimization should be JP-first.

## Top 3 Recommended Actions

1. **Fix `scripts/analytics/asc_client.download_segment` (highest priority, day 5).** The `requests.get` call for the presigned S3 URL is being made with `self.headers`, which contains the ASC bearer JWT. Presigned S3 URLs embed their own signature; adding an `Authorization` header causes S3 to 400. Call the URL with no extra headers (e.g. `requests.get(url, timeout=30)`). Once fixed, backfill 2026-04-14 through 2026-04-19 with `python3 -m scripts.analytics.main --date <d> --request-id 394c257b-c76e-4779-9257-30c74024383a`.
2. **Teach `scripts.analytics.main` to reuse the existing ONGOING request.** Today's first call (again) failed with a 409 because the ONGOING request `394c257b-c76e-4779-9257-30c74024383a` already exists. The script should `GET /v1/apps/{id}/analyticsReportRequests` first and fall back to POST only when none exists, so the cron is self-healing instead of depending on a human-supplied `--request-id`.
3. **Prepare (but don't launch yet) a TikTok Trial → Paid experiment.** When the pipeline is healthy again, test a TikTok-specific paywall variant (e.g. extended trial or first-month-discount offer) targeted at the `Web Referrer (tiktok.com)` source to close the 10-point gap vs App Store Search. The economics from 2026-04-03 say this is the single largest addressable channel lever — but do not run the experiment until you can measure it daily.

## Data Pipeline Status

- **Target date**: 2026-04-19 (yesterday)
- **Report Request ID**: `394c257b-c76e-4779-9257-30c74024383a` (reused via `--request-id`; fresh POST returns 409)
- **API Authentication (JWT ES256)**: ✅ working
- **Report Discovery**: ✅ working
- **Segment Download (S3 presigned)**: ❌ HTTP 400 on `APP_STORE_ENGAGEMENT`; no matching instance for `APP_USAGE`
- **Local cache written today**: none
- **Newest cached date**: 2026-04-13 (engagement only, 12 rows)
- **Missing dates**: 2026-04-14, 2026-04-15, 2026-04-16, 2026-04-17, 2026-04-18, 2026-04-19
- **Days since last full-funnel data**: 17 (2026-04-03 is the most recent complete snapshot)

*Report generated: 2026-04-20 09:10 JST (automated scheduled task)*
