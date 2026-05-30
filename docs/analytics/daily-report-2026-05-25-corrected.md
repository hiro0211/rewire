# Rewire Daily Analytics (CORRECTED) — 2026-05-25

> Manual correction of the auto-generated `daily-report-2026-05-25.md`.
> `analyze_funnel.py` reports Downloads / Trial Starts / Paid / Churn as **0** because
> its `extract_metrics()` only reads rows that have an `Event` column. The COMMERCE
> reports use different schemas — App Downloads = `Download Type`, Subscription Event
> = `Event Name`, Subscription State = `State Metric` — so they are silently dropped.
> The counts below are re-derived directly from the raw TSVs. This is the **8th
> consecutive run** with this bug (see `daily-report-2026-05-24-corrected.md`).

**Data window:** ASC ongoing report, processing date 2026-05-25. Event dates span 2026-05-22 → 2026-05-24.

## Metric counts — auto report vs corrected

| Metric | Auto report | Corrected (raw TSV) |
|--------|------------:|--------------------:|
| Impressions | 103 | 103 |
| Taps (Get button) | 4 | 4 |
| Product page views | 12 | 12 |
| First-time downloads | 0 | **1** |
| Free-trial starts | 0 | **3** |
| Trial→paid conversions | 0 | **1** |
| Voluntary churn | 0 | **7** |
| Active full-price subscriptions | 0 | **1** |

## Funnel reality

- **Top of funnel is tiny:** 103 impressions and only 4 Get-button taps across ~3 event-days.
- Strict stage-to-stage rates are not meaningful at this volume — Downloads / Trials / Paid
  come from separate ASC reports with separate attribution windows, so chaining them as
  multiplicative rates produces misleading artifacts. Use the raw counts.
- Tap rate (intent proxy): 4 / 103 = **3.9%** of impressions tapped Get.
- Impression→page-view: 12 / 103 = 11.7% (auto report's only meaningful rate; below the
  25–35% benchmark, but at n=103 this is noisy).
- Trial→paid: 1 / 3 = **33.3%** — below the 40–60% benchmark.
- **Net subscriber change: 3 new trials − 7 churn = −4** for the window.

## Channels (impressions)

| Source | Impressions | Taps |
|--------|------------:|-----:|
| App Store search | 100 | 3 |
| App Store browse | 3 | 1 |

- 100% of impressions are **organic** (App Store Search + Browse). **No TikTok / paid /
  web-referral traffic** appears in the discovery report.
- However, the Subscription State report shows **2 annual free trials redeemed via offer
  code `REWIRE2026`** (offer `SNS_Campaign_2026_Free1Year`) — so a social/SNS campaign
  *is* driving signups; it is just invisible to the discovery-report channel breakdown
  because the campaign traffic carries no App Store attribution tag.

## Subscription movement (event dates 05-22 → 05-24)

- New free trials: **3** — 2 × annual via SNS offer code `REWIRE2026`, 1 × monthly 3-day intro.
- Trial→paid conversions: **1** — 1 × monthly, full price from free trial.
- Voluntary churn: **7** — all *'Turned off auto-renew'*, mostly on annual plans.
- Churn (7) outnumbers new trials (3) → **net −4** subscribers in this window.

## Top 3 improvement actions

1. **Fix `analyze_funnel.py` (recurring — now the 8th run).** Extend `extract_metrics()`
   and `extract_metrics_by_source()` to parse the COMMERCE reports: map `Download Type`
   → downloads, `Event Name` → trial/paid events, `State Metric` → trial/churn/active.
   Until this lands, every official daily report is misleading below the Page-View stage.
   Per the project's TDD rule, add failing tests for each COMMERCE schema first.
2. **Grow top-of-funnel visibility.** 103 impressions / 4 taps over ~3 days is the real
   constraint. Invest in ASO (keywords, screenshots, icon) and tag the SNS/TikTok campaign
   with proper attribution so its traffic shows up in the channel breakdown — not just as
   anonymous offer-code redemptions.
3. **Address retention.** Voluntary churn (7) exceeded new trials (3); 100% of churn was
   *'Turned off auto-renew'*. Add trial-ending and renewal-reminder push notifications and
   review annual-plan value delivery, since most churn was on annual subscriptions.

*Corrected report generated: 2026-05-26 00:02 (automated scheduled run)*
