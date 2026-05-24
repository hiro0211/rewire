# Rewire Daily Analytics (Corrected) - 2026-05-17

_Processing date: 2026-05-17. Data window inside fetched reports: 2026-05-14 → 2026-05-16 (standard 1–3 day ASC reporting lag)._

> ⚠️ The skill's `analyze_funnel.py` script reported zeros because its column mappings (`Impressions`, `Product Page Views`, etc.) don't match the actual ASC TSV format, which uses an `Event` column with values like `Impression`/`Page view`/`Tap` and a `Counts` column. The numbers below are the manually re-aggregated truth (computed in Python).

## Single-day funnel (latest data = 2026-05-16)

| Stage | Count | Rate | vs Benchmark |
|-------|-------|------|--------------|
| Impressions | 21 | — | — |
| → Page Views | 3 | 14.3% | 🔴 Below (benchmark 25–35%) |
| → Taps (paid promo) | 0 | — | — |

Downloads / Trial Starts / Paid are **not present** in the fetched reports — App Usage and Subscription report categories were not returned by ASC for this request.

## 3-day rolling totals (2026-05-14 → 2026-05-16)

- **Impressions**: 53
- **Page views**: 4
- **Taps**: 0

| Date | Impressions | Page views |
|------|-------------|------------|
| 2026-05-14 | 13 | 1 |
| 2026-05-15 | 13 | 0 |
| 2026-05-16 | 21 | 3 |

## Source breakdown (3-day window)

| Source | Impression | Page view |
|--------|------------|-----------|
| App Store search | 46 | 3 |
| App Store browse | 1 | 0 |
| App referrer | 0 | 1 |

No TikTok or web-referral attributed impressions in this window.

## Territory breakdown (3-day window)

| Territory | Impression | Page view |
|-----------|------------|-----------|
| JP | 19 | 3 |
| IL | 14 | 0 |
| TH | 10 | 1 |
| CO | 1 | 0 |
| MN | 1 | 0 |
| US | 1 | 0 |
| UZ | 1 | 0 |

## Bottleneck

**Impression → Page View** is the clear bottleneck: 4 / 53 = **7.5%** over the 3-day window, well below the 25–35% RevenueCat benchmark. JP drives most of the page views (3/4); IL gets impressions but no taps to the product page.

## Top 3 Improvement Actions

1. **Rework App Store search creatives** (icon, screenshots, subtitle) — almost all impressions come from search and 96% of them never click through. JP/IL/TH are the active territories; prioritize localized screenshots there.
2. **Run a screenshot / subtitle A/B test in App Store Connect** focused on the JP audience (highest engagement) to find a treatment that lifts page-view rate toward the 25% benchmark.
3. **Enable App Usage + Subscription report categories** in the ASC pipeline (or expand `REPORT_CATEGORIES` in `scripts/analytics/asc_client.py`) so downloads / trial / paid stages are tracked end-to-end — without them the full funnel can't be measured.

## Pipeline notes (autonomous run)

- `python3 -m scripts.analytics.main` initially failed with `409 Conflict` because an `ONGOING` report request already exists. Re-ran with the existing request id (`394c257b-c76e-4779-9257-30c74024383a`, discovered via `GET /v1/apps/6759087214/analyticsReportRequests`). Data fetch then succeeded.
- The skill's `analyze_funnel.py` still produced an all-zero report (`daily-report-2026-05-17.md`) — this corrected file supersedes it. Same column-mapping bug noted in `daily-report-2026-05-08-corrected.md` is still present; the funnel script needs an update to aggregate on `Event` + `Counts`.

*Report generated: 2026-05-18 (automated run)*
