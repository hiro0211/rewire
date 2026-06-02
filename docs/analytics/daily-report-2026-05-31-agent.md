# Rewire 日次レポート 2026-05-31

## App Store ファンネル
| 指標 | 値 |
|---|---|
| Impressions | 77 |
| Page Views | 5 (6.5%) |
| Taps | 1 |
| Downloads | 0 ⚠️ |
| Trial Starts | 0 ⚠️ |
| Paid | 0 ⚠️ |

流入の大半は App Store Search (74 imp)。DL ゼロが最大のボトルネック。

## 収益 (RevenueCat)
- MRR: $4 (P28D) / Revenue: $4 (P28D)
- Active Subscriptions: 1 (P0D)
- Active Trials: 4 (P0D)
- New Customers: 50 (P28D)
- Active Users: 53 (P28D)

## ユーザー活動 (Firebase)
**DAU**: 昨日 4 vs 直近7日平均 3.83（+4.4%）。新規 3 (平均 2.33)。
※TestFlight/開発ビルドは logEvent が no-op のためイベント数は実態より少なめ。

**主要イベント (count / users)**
- paywall_viewed: 2 / 1
- pro_purchase_completed: 1 / 1
- benefits_screen_viewed: 2 / 1
- onboarding_complete: 1 / 1

**計算比率**
- paywall→購入 CVR: 50%（2→1）※母数極小
- breathing_started→completed: データなし
- panic_button→breathing: データなし

**滞在画面 Top5**: (not set) 27 / `/` 5 / `/brand` 3 / `/onboarding` 3 / `/onboarding/benefits` 2

## 横断分析
- ASC Impression 77 に対し GA4 active_users 4・DL 0。ストア露出はあるが製品ページで離脱。スクショ訴求が弱い疑い。
- RevenueCat New Customers 28日 50 / Active Users 53 と GA4 DAU 4 が大きく乖離。多くは web/iOS 外経由か計測漏れ。
- breathing/panic イベントが GA4 に皆無。本番ログ未到達（TestFlight no-op）か導線未使用、要計測確認。

## 改善提案
- **今日(即実装)**: 製品ページ1枚目スクショのコピーをコア価値1行に差し替え、Page View→DL を底上げ。
- **今週(着手)**: breathing_started/completed・panic_button_tapped の発火を本番ビルドで検証するテストを追加し、計測欠落を解消。
- **今月(計画)**: スクショ A/B テスト設計（指標=download_rate 30%目標）+ ASC↔RevenueCat↔GA4 を user_id で突合する横断ログ基盤を整備。