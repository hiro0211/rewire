# Rewire Daily Analytics - 2026-04-27

> **Note:** App Store Connect has a ~2-day data processing lag. Analysis uses data through **2026-04-26**.
> Pipeline status: fetch success ✅ (request_id: `394c257b-c76e-4779-9257-30c74024383a`)
> 4 reports downloaded: Discovery & Engagement Standard / Detailed, Web Preview Engagement Standard, Retention Messaging.

## Funnel Summary (latest date: 2026-04-26)

| Stage | Count | Conversion Rate |
|-------|-------|-----------------|
| Impressions | 11 | — |
| → Page Views | 1 | 9.09% |
| → Taps (Get/Open) | 0 | 0.00% |

### 10-Day Window (2026-04-17 → 2026-04-26)

| Metric | Value |
|--------|-------|
| Total Impressions | 82 |
| Total Page Views | 26 |
| Total Taps | 4 |
| Avg Page View Rate (PV/Imp) | 31.71% |
| Avg Tap Rate (Tap/PV) | 15.38% |

## Bottleneck Analysis

- **Page View Rate (10-day avg):** 31.71% — Within RevenueCat benchmark band (25–35%). ✅
- **Tap Rate (10-day avg):** 15.38% — Below typical product-page conversion (~25–35% expected on App Store browse/search). ⚠️

**Identified bottleneck:** **Page View → Tap.** Only 4 of 26 page views over the past 10 days produced a tap. PVR is healthy, so users are reaching the product page; the page itself is not converting them to a download attempt.

Single-day caveat: 2026-04-26 PVR dropped to 9.09% (1 PV / 11 impressions) vs the 10-day average of 31.71%. Worth re-checking once 2026-04-27/28 data lands — could be noise on a low-volume day, or the start of an impression-quality regression.

## Channel Comparison (10-day window)

| Channel | Impressions | Page Views | Taps |
|---------|-------------|-----------|------|
| App Store search | 77 | 19 | 0 |
| App Store browse | 5 | 3 | 4 |
| Web referrer | 0 | 4 | 0 |

**Highlights:**
- **App Store search** is the dominant top-of-funnel source (94% of impressions) but **converts 0 taps** in the 10-day window. PVR for search is 24.7% — below benchmark.
- **App Store browse** is small-volume but the **only channel producing taps** (Tap rate ~133% on its own page-view base — taps can fire from impressions/cards directly without a logged page view in this attribution model).
- **Web referrer** drove 4 page views with no impressions logged, indicating direct-link or external-share traffic; no taps.
- **TikTok / paid social:** zero activity again. Same as 2026-04-26.

## Top Territories (10-day window, by event volume)

JP (87) ≫ ID (7), CN (5), US (3), IN (2), MX (2), IL (2), AU (2). JP is overwhelmingly dominant — 80%+ of all events.

## Top 3 Improvement Actions

1. **Fix the product page (Page View → Tap is the bottleneck).** 4 taps from 26 page views (15.4%) over 10 days, and 0 taps from 19 search-driven page views. A/B test: (a) the first screenshot (often the single biggest tap driver), (b) the subtitle (search visitors arrive with intent — make value prop crystal-clear in the first second), (c) the "What's New" copy. Browse vs search conversion gap suggests search visitors find the page and bounce — the listing isn't matching their query intent.
2. **Re-audit JP keyword targeting.** 80%+ of all impressions are JP, but JP search → tap conversion is 0 in the window. Either keywords are pulling in mismatched intent (irrelevant queries surfacing the listing), or the JP listing copy/screenshots aren't earning the tap. Run an ASA search-term report (or pull keyword-level rank in App Store Connect) and prune low-intent keywords.
3. **Reactivate paid/external acquisition.** Two consecutive snapshots with zero TikTok or campaign-tagged traffic. With organic volume this low (8 impressions/day average), the funnel is statistically noisy and any optimization signal is hard to read. A small TikTok or web-campaign test (budget on the order of ¥10,000–¥30,000/day) would both expand top-of-funnel and provide a comparable cohort to A/B against organic search.

*Report generated: 2026-04-28 by automated pipeline (analyze_funnel.py output overridden — script's column-mapping does not match ASC's event-row TSV schema; aggregated directly via Python over the deduped 10-day window across all daily fetches).*
