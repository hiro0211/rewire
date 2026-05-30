# Rewire Daily Analytics (CORRECTED) — 2026-05-24

> Manual correction of the auto-generated `daily-report-2026-05-24.md`.
> `analyze_funnel.py` reports Downloads / Trial Starts / Paid / Churn as **0** because
> its `extract_metrics()` only reads rows that have an `Event` column. The COMMERCE
> reports use different schemas — App Downloads = `Download Type`, Subscription Event
> = `Event Name`, Subscription State = `State Metric` — so they are silently dropped.
> The counts below are re-derived directly from the raw TSVs.

**Data window:** ASC ongoing report, processing date 2026-05-24. Event dates span 2026-05-21 → 2026-05-23.

## Metric counts — auto report vs corrected

| Metric | Auto report | Corrected (raw TSV) |
|--------|------------:|--------------------:|
| Impressions | 58 | 58 |
| Taps (Get button) | 3 | 3 |
| Product page views (web preview) | 1 | 1 |
| First-time downloads | 0 | **1** |
| Free-trial starts | 0 | **3** |
| Trial→paid conversions | 0 | **1** |
| Voluntary churn | 0 | **7** |
| Active subscriptions | 0 | 0 (not present in data) |

## Funnel reality

- **Top of funnel is tiny:** 58 impressions and only 3 taps across ~3 event-days.
- Strict stage-to-stage rates are not meaningful at this volume — Downloads/Trials/Paid
  come from separate ASC reports with separate attribution, so chaining them produces
  >100% artifacts. Use the raw counts, not multiplicative rates.
- Tap rate (intent proxy): 3/58 = 5.2% of impressions tapped Get.
- Trial→paid: 1/3 = 33.3% — below the 40–60% benchmark.
- **Net subscriber change: 3 new trials − 7 churn = -4** for the window.

## Channels (impressions)

| Source | Impressions |
|--------|------------:|
| App Store search | 56 |
| App Store browse | 2 |

- 100% of impressions are **organic** (App Store Search + Browse). **No TikTok / paid / web-referral traffic** appears in the discovery report.
- However, the Subscription State report shows 2 annual free trials redeemed via offer code
  `REWIRE2026` (offer `SNS_Campaign_2026_Free1Year`) — so a social/SNS campaign *is* driving
  signups; it is just invisible to the discovery-report channel breakdown.

## Subscription movement (event dates 05-21 → 05-22)

- New free trials: 3 (2 × annual via SNS offer code, 1 × monthly 3-day intro).
- Trial→paid conversions: 1 (1 × monthly, full price from free trial).
- Voluntary churn: 7 — **all 'Turned off auto-renew'** (mostly annual plans).
- Churn (7) outnumbers new trials (3) → net -4 in this window.

## Top 3 improvement actions

1. **Fix `analyze_funnel.py` (recurring, now 7th run).** Extend `extract_metrics()` /
   `extract_metrics_by_source()` to parse the COMMERCE reports: map `Download Type`→downloads,
   `Event Name`→trial/paid events, `State Metric`→trial/churn/active. Until this lands, every
   official daily report is misleading below the Page-View stage.
2. **Grow top-of-funnel visibility.** 58 impressions / 3 taps over 3 days is the real
   constraint. Invest in ASO (keywords, screenshots, icon) and tag the SNS/TikTok campaign
   with proper attribution so its traffic shows up, not just its offer-code redemptions.
3. **Address retention.** Voluntary churn (7) exceeded new trials (3); all churn was
   'Turned off auto-renew'. Add trial-ending and renewal-reminder notifications and review
   annual-plan value delivery, since most churn was on annual subscriptions.

*Corrected report generated: 2026-05-25 00:06*
