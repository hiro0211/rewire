# タスク2: プライバシー設定とコードの乖離チェック結果

## 調査日: 2026-03-22

---

## 1. コードで収集している全データの洗い出し

### A. Firebase Analytics イベント（analyticsClient.logEvent）

| イベント名 | パラメータ | ファイル |
|---|---|---|
| benefits_screen_viewed | source | app/onboarding/benefits.tsx |
| benefits_cta_tapped | — | app/onboarding/benefits.tsx |
| review_prompt_shown | — | app/(tabs)/index.tsx |
| onboarding_complete | goal_days | app/onboarding/goal.tsx |
| checkin_submitted | isClean, stress, urge | app/checkin/index.tsx |
| recovery_trigger_selected | trigger | app/recovery/index.tsx |
| breathing_completed | urge_resolved | app/breathing/ask.tsx |
| breathing_started | — | app/breathing/index.tsx |
| survey_completed | questionCount | features/survey/surveyService.ts |
| promo_redeemed | code, source | features/survey/surveyService.ts |
| promo_code_entered | code | app/promo.tsx |
| promo_code_validated | code, source | app/promo.tsx |
| sos_tapped | — | components/dashboard/SOSButton.tsx |
| review_prompt_rated | stars | hooks/review/useReviewPromptActions.ts |
| review_prompt_feedback_tapped | — | hooks/review/useReviewPromptActions.ts |
| review_prompt_dismissed | — | hooks/review/useReviewPromptActions.ts |
| share_tapped | — | hooks/dashboard/useShareWidget.ts |
| paywall_viewed | source, offering | hooks/paywall/usePaywallOrchestration.ts |
| pro_purchase_completed | offering | hooks/paywall/usePaywallOrchestration.ts |
| survey_prompt_accepted | — | hooks/survey/useSurveyPromptActions.ts |
| survey_prompt_dismissed | — | hooks/survey/useSurveyPromptActions.ts |

### B. Firebase Analytics ユーザー識別

| API | データ | ファイル |
|---|---|---|
| setUserId() | ユーザーID文字列 | lib/tracking/analyticsClient.ts（定義） |
| setUserProperty('goal_days') | 目標日数 | hooks/useAppInitialization.ts |
| setUserProperty('is_pro') | Pro状態 | hooks/useAppInitialization.ts |
| logScreenView() | 画面名 | lib/tracking/analyticsClient.ts（定義） |

### C. Firestore データ送信

| コレクション | データ内容 | ファイル |
|---|---|---|
| surveys | userId, responses(全回答), completedAt, appVersion, platform, promoCode?, promoSource? | features/survey/surveyService.ts → lib/survey/firestoreClient.ts |
| promoRedemptions | userId, code, source, redeemedAt, platform, appVersion | lib/promo/promoFirestoreClient.ts |
| promoCodes | 読み取りのみ（コード検証） | lib/promo/promoFirestoreClient.ts |

### D. その他

| データ | 用途 | ファイル |
|---|---|---|
| RevenueCat購入情報 | サブスクリプション管理 | react-native-purchases SDK |
| expo-store-review | App Store評価の誘導 | hooks/review/useReviewPromptActions.ts |
| expo-notifications | プッシュ通知トークン | （通知設定機能） |

---

## 2. App Store Connect プライバシー設定との突合

### 前回設定済み（確認済み）

| データタイプ | 目的 | トラッキング | ステータス |
|---|---|---|---|
| デバイスID | アナリティクス | なし | ✅ 設定済み |
| 製品の操作 | アナリティクス | なし | ✅ 設定済み |
| おおよその場所 | アナリティクス | なし | ✅ 設定済み |
| クラッシュデータ | アナリティクス | なし | ✅ 設定済み |
| その他のユーザコンテンツ | アプリの機能 | なし | ✅ 設定済み |
| ユーザID | アプリの機能 | なし | ✅ 設定済み |

### 追加確認が必要な項目

| コードの収集データ | 該当するデータタイプ | ステータス | 備考 |
|---|---|---|---|
| 星評価（review_prompt_rated, stars パラメータ） | 「製品の操作」に含まれる | ⚠️ 要確認 | analyticsイベントとして送信 |
| プロモコードredemption（Firestore送信） | 「その他のユーザコンテンツ」に含まれる | ⚠️ 要確認 | ※プロモ機能自体が3.1.1違反 |
| アンケート回答（Firestore送信） | 「その他のユーザコンテンツ」 | ✅ 設定済み | 自由記述含む |
| setUserProperty（goal_days, is_pro） | 「製品の操作」に含まれる | ✅ カバー済み | — |

### 結論
星評価とプロモredemptionは既存のデータタイプ（「製品の操作」「その他のユーザコンテンツ」）にカバーされる。**プライバシー設定自体は概ね問題なし。**

ただし、**プロモコード機能自体がGuideline 3.1.1違反のため、削除した場合はプロモ関連のデータタイプ申告も不要になる。**

---

## 3. プライバシーポリシーとコードの乖離（CRITICAL）

### 現在のプライバシーポリシー内容

```
s2 (収集データ): 性的行動記録、メンタルヘルスデータ、呼吸エクササイズ記録、
                  回復進捗記録、ニックネーム、アプリ内設定
s4 (保存場所): 「すべてのデータはユーザーのデバイス上にローカルで保存。外部サーバーへの送信なし」
s6 (第三者提供): 「課金サービスを除き、第三者への提供なし」
```

### 実態との乖離

| ポリシーの記述 | 実態 | 乖離 |
|---|---|---|
| 「外部サーバーへのデータ送信なし」 | Firebase Analytics, Firestoreに送信 | ❌ 完全に矛盾 |
| 「第三者への提供なし」 | Google（Firebase）に送信 | ❌ 矛盾 |
| 収集データリストにAnalytics未記載 | 20種以上のイベント＋ユーザープロパティ | ❌ 未記載 |
| 収集データリストにアンケート未記載 | アンケート5問の回答をFirestore送信 | ❌ 未記載 |
| データ保持/削除ポリシー未記載 | 5.1.1(i)の要件 | ❌ 欠落 |
| 同意撤回方法の説明未記載 | 5.1.1(i)の要件 | ❌ 欠落 |

---

## 4. その他のコードレベル問題

### a. eas.json にAPIキーがハードコード

```json
// eas.json line 11, 17, 26
"EXPO_PUBLIC_REVENUECAT_API_KEY_IOS": "appl_QNlmHdDhxCrkCyiQxKDblEFaBmy"
```
- RevenueCat公開APIキーはクライアントサイドで使用されるものなので、セキュリティリスクは低い
- ただし、eas.jsonはgitにコミットされるため、EAS Secrets移行が望ましい

### b. ConsentStep の説明文が不正確

```
// locales/ja.ts onboarding.consent.dataDescription
「Rewireはあなたの旅路をサポートするため、以下のデータをデバイスにローカル保存します。」
```
- 「ローカル保存」のみと記述しているが、実際にはFirebaseにも送信
- ユーザーは「ローカルのみ」と理解して同意している可能性

### c. appVersion ハードコード

```typescript
// features/survey/surveyService.ts line 26, 59
appVersion: '1.0.0',
```
- v1.1.0なのに '1.0.0' がハードコードされている

### d. settings.tsx のバージョン表示

```typescript
// app/settings.tsx line 190
<Text>Version 1.0.0 (Build 1)</Text>
```
- ハードコードされている

---

## 5. 対応優先度マトリックス

| # | 問題 | 重要度 | 対応方法 |
|---|------|--------|----------|
| 1 | プライバシーポリシー全面書き直し | CRITICAL | コード修正（ja.ts/en.ts） + Web版更新（hiro手動） |
| 2 | プロモコード機能のIAPバイパス | CRITICAL | 機能削除 or RevenueCat Offer Code化 |
| 3 | ConsentStep説明文の修正 | HIGH | コード修正（ja.ts/en.ts） |
| 4 | appVersion ハードコード修正 | MEDIUM | app.config.ts から取得に変更 |
| 5 | eas.json APIキー | LOW | EAS Secrets移行（任意） |
