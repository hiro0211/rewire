# タスク4: コードレベルの問題修正 完了報告

## 実施日: 2026-03-22

---

## 1. プロモコード機能の完全削除

### 削除したファイル
- `app/promo.tsx` — プロモコード画面
- `lib/promo/promoFirestoreClient.ts` — Firestoreクライアント
- `lib/promo/__tests__/promoFirestoreClient.test.ts` — テスト
- `types/promo.ts` — 型定義

### 編集したファイル

| ファイル | 変更内容 |
|---|---|
| `features/survey/surveyService.ts` | `submitSurveyWithPromo`メソッド削除、promoFirestoreClientインポート削除 |
| `features/survey/__tests__/surveyService.test.ts` | promo関連テストスイート・モック削除 |
| `hooks/survey/useSurveySubmit.ts` | promo分岐ロジック削除、シンプル化 |
| `app/survey.tsx` | promoパラメータ・isPromo参照削除 |
| `components/survey/SurveyCompletionStep.tsx` | titleOverride/bodyOverride props削除 |
| `app/_layout.tsx` | promo Stack.Screen削除 |
| `lib/routing/routes.ts` | `promo: route('/promo')` 削除 |
| `types/survey.ts` | promoCode/promoSource フィールド削除 |
| `types/models.ts` | promoCode/promoRedeemedAt フィールド削除 |
| `app/settings.tsx` | プロモコードセクション削除 |
| `locales/ja.ts` | promo.*オブジェクト、promoCodeラベル削除 |
| `locales/en.ts` | promo.*オブジェクト、promoCodeラベル削除 |

---

## 2. プライバシーポリシー更新（ja.ts / en.ts）

### 変更点
- s2 (収集データ): デバイス保存 / サーバー送信の2カテゴリに分離
- s3 (利用目的): 匿名利用データの分析目的を追加
- s4 (保存場所): ローカル保存とFirebase送信を明確に記載
- s5 (課金/分析): RevenueCat、Firebase Analytics利用を明記。広告非配信を明記
- s6 (第三者): App Store、RevenueCat、Firebase Analytics、Firebase Firestoreを列挙
- 更新日: 2026年3月22日

---

## 3. ConsentStep（同意画面）説明文の更新

### 変更点
- dataDescription: 「端末内にのみ保存」→「収集・保存」に変更
- dataList: デバイス保存とサーバー送信の2セクションに分離

---

## 4. 利用規約 s5 (データの取り扱い) 更新

### 変更点
- 「外部サーバーへの送信は行いません」を削除
- Firebase送信の記載を追加

---

## 5. app.config.ts — NSUserTrackingUsageDescription削除

ATTは使用しないため、infoPlistから削除。

---

## 6. appVersion ハードコード修正

| ファイル | 変更 |
|---|---|
| `features/survey/surveyService.ts` | `Constants.expoConfig?.version` から取得 |
| `app/settings.tsx` | `Constants.expoConfig?.version` から動的表示 |

---

## 7. テスト結果

```
Test Suites: 179 passed, 1 failed (既存のbrandConfigテスト), 180 total
Tests:       1297 passed, 1 failed (既存), 1298 total
```

brandConfig.test.tsの失敗は今回の変更とは無関係（タイミング値の変更にテストが追従していない既存問題）。

---

## 8. hiro手動対応が必要な項目

| # | 項目 | 備考 |
|---|------|------|
| 1 | Web版(rewire-support)のアプリ名「Ridatu」→「Rewire」に統一 | index.htmlのタイトル、ヘッダー、FAQ等 |
| 2 | Web版のATT記述を修正/削除 | セクション5のATT言及を削除 |
| 3 | Web版からプロモコード関連記述を削除 | プライバシーポリシーs2, s4, s6とFAQ |
| 4 | App Store Connectの「その他のユーザコンテンツ」からプロモ関連を除外する必要があるか確認 | アンケートデータは残る |
| 5 | Firestore: promoCodes / promoRedemptions コレクションの後始末 | 任意 |
