# Rewire 日次レポート 2026-06-01

## App Store ファンネル

| 指標 | 値 |
|---|---|
| Impressions | 60 |
| Page Views | 6 |
| Taps | 1 |
| Downloads | 0 ⚠️ |
| Trial Starts | 0 ⚠️ |
| Paid | 0 ⚠️ |

Page View率10.0%に対しDownload率0.0%。検索流入60→DL0が最大の詰まり。

## 収益 (RevenueCat)

| 指標 | 値 |
|---|---|
| MRR | $8 (P28D) |
| Active Subscriptions | 2 (P0D) |
| Active Trials | 4 (P0D) |
| New Customers | 52 (P28D) |
| Active Users | 53 (P28D) |

## ユーザー活動 (Firebase)

| DAU | 前日 | 前週平均 | 増減 |
|---|---|---|---|
| Active Users | 2 | 4.33 | -53.8% |
| New Users | 2 | 2.83 | -29.3% |
| Sessions | 2 | 5.17 | -61.3% |

主要イベント: paywall_viewed 3回/1人、benefits_screen_viewed 3回/1人、benefits_cta_tapped 3回/1人、onboarding_complete 1回/1人。

比率: paywall→pro_purchase **0%**（pro_purchase_completed未発火）。breathing_started/completed・panic_button_tapped未計測のため完遂率・連携率算出不可。
※TestFlight/devビルドは logEvent が no-op のためイベント過少は想定内。

滞在Top5: (not set) 23 / `/` 3 / `/brand` 3 / `/onboarding` 3 / `/onboarding/benefits` 3。

## 横断分析

- **ASC**: Impression 60→DL 0、かつ **GA4** active_users 前週比-54%。流入はあるが製品ページ・定着の両方で離脱。
- **RevenueCat** new_customers 52(28日累計)に対し当日 **GA4** paywall_viewed は1人・ASC trial 0。当日iOSは静かで、28日窓との時間軸差＋devビルドno-opが影響。
- **GA4** onboarding_complete 1 だが paywall→購入 0。導線は通るが転換ゼロ。

## 改善提案

- **今日(即実装)**: paywall 1人通過で購入0。CTA文言とトライアル訴求を見直し、benefits→paywall の価値接続を1コミットで強化。
- **今週(着手)**: pro_purchase_completed / breathing_started / breathing_completed / panic_button_tapped のログ発火をTDDで実装し、CVR・完遂率を計測可能に。
- **今月(計画)**: スクショ刷新A/Bテスト設計（目標Download率30%）。検索流入のDL転換を主指標に、製品ページLP最適化を回す。