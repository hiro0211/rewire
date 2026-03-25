# タスク1: App Store Review Guidelines リサーチ結果

## 調査日: 2026-03-22

---

## Guideline 5.1.1 — データ収集と保存

### ガイドライン要旨
- プライバシーポリシーを App Store Connect メタデータとアプリ内の両方に設置する義務
- ポリシーで「何のデータを、どう収集し、どう使うか」を明記する義務
- サードパーティ（Firebase等）へのデータ共有がある場合、そのサードパーティも同等のデータ保護を提供することを明記する義務
- データ保持/削除ポリシーと同意撤回方法の説明義務
- ユーザー同意なしのデータ収集は禁止

### 現状の問題（CRITICAL）
**プライバシーポリシーが実態と大きく乖離している:**
- `locales/ja.ts` s4Body: 「すべてのデータはユーザーのデバイス上にローカルで保存され、暗号化されています。**外部サーバーへのデータ送信は行いません。**」
- `locales/en.ts` s4Body: "All data is stored locally on your device and is encrypted. **No data is transmitted to external servers.**"

**実際に外部送信しているデータ:**
1. Firebase Analytics — 20種以上のカスタムイベント（画面遷移、ユーザー行動）
2. Firebase Analytics — setUserId(), setUserProperty() でユーザー識別情報
3. Firestore — アンケート回答（surveyService.ts → firestoreClient.submitSurvey()）
4. Firestore — プロモコード検証・redemption記録（promoFirestoreClient.ts）

### 必要な修正
1. プライバシーポリシーを全面的に書き直し
   - Firebase Analyticsの利用を明記
   - Firestoreへのアンケートデータ送信を明記
   - Google（Firebase親会社）のデータ保護について記載
   - データ保持期間と削除方法を記載
2. Web版プライバシーポリシー（hiro0211.github.io/rewire-support/#privacy）も同様に更新
3. オンボーディングの同意ステップ（ConsentStep.tsx）の説明文も更新
   - 現在: 「デバイスにローカルで保存」と説明
   - 修正: Analytics、アンケートのサーバー送信を説明

---

## Guideline 5.1.2 — データの利用とシェアリング

### ガイドライン要旨
- 個人データの利用・送信・共有前にユーザーの許可を得る義務
- サードパーティ（AI含む）へのデータ共有先を明示し、明確な許可を得る義務
- App Tracking Transparency API が必要な場合はその利用
- 一つの目的で収集したデータを別目的に流用する場合は追加同意が必要

### 現状の評価
- Firebase Analyticsはファーストパーティ分析として利用 → ATT不要（トラッキングではない）
- NSUserTrackingUsageDescription は削除済み → OK（トラッキングしていないため）
- しかし、プライバシーポリシーにFirebaseへのデータ送信が**未記載** → CRITICAL
- アンケートの自由記述をFirestoreに送信していることの告知も**不十分**

---

## Guideline 1.2 — ユーザー生成コンテンツ

### ガイドライン要旨
UGCがある場合:
1. 不適切コンテンツのフィルタリング機能
2. 問題コンテンツの報告メカニズム
3. ユーザーブロック機能
4. 連絡先の公開

### 現状の評価: 適合（LOW RISK）
- アンケートの自由記述はFirestoreに保存されるが、他のユーザーに**公開されない**
- アプリ内で他ユーザーのコンテンツを閲覧する機能はない
- UGCの定義には該当しないと判断 → フィルタリング等は不要

---

## Guideline 3.1.1 — App内課金

### ガイドライン要旨
- アプリ内で機能やコンテンツをアンロックする場合、**必ずIAPを使用**する義務
- ライセンスキー、QRコード、暗号通貨等の**独自のアンロック機構は禁止**

### 現状の問題（CRITICAL）
**プロモコードシステムがGuideline 3.1.1に直接違反:**
- `app/promo.tsx` + `lib/promo/promoFirestoreClient.ts` で独自のプロモコードシステムを実装
- Firestoreの `promoCodes` コレクションでコード検証
- 検証成功 → アンケート回答 → `isPro: true` を設定してPro機能解放
- これはAppleのIAPシステムを**完全にバイパス**している

**Appleのフォーラムでも明確に:**
> "the app uses a promo code to unlock or enable paid features in store" → リジェクト事例

### 必要な修正
**選択肢:**
1. **プロモコード機能を完全に削除** — 最も安全
2. **RevenueCatのPromo Offer / Offer Codeに置き換え** — Appleの仕組みを使う
3. **プロモコードでアンロックする範囲を「無料機能のみ」に限定** — Pro解除をやめる

---

## Guideline 5.6 — デベロッパの行動規範（レビュー誘導）

### ガイドライン要旨
- レビューの操作、チャートランキングの水増し、有料/インセンティブ付き/フィルタ済み/偽のフィードバックの使用は禁止
- 違反した場合、Apple Developer Program から除名される可能性

### 現状の評価: 適合（OK）
- `useReviewPromptActions.ts`: 星4以上 → `expo-store-review` の `requestReview()` を呼ぶ
  - これはApple公式のSKStoreReviewControllerを使用 → OK
- 星3以下 → メールフィードバックを提案（App Store外への誘導） → OK
- レビューに対するインセンティブ提供はない → OK
- ただし、`reviewPromptEligibility.ts` の条件（7日以上、5回以上チェックイン、最大3回表示）も適切

**注意点:** 自前の星評価UIを表示してから `requestReview()` を呼ぶパターンは、Appleの「rating gate」とみなされるリスクがある。ただし、現在のところ明示的に禁止はされていない。

---

## Guideline 4.4 — Extensions（コンテンツブロッカー）

### ガイドライン要旨
- Safari拡張はシステムUIやSafari UIの要素を妨害してはならない
- 悪意のある/誤解を招くコンテンツやコードを含んではならない
- 必要以上のWebサイトへのアクセスを要求してはならない

### 現状の評価: 要確認
- コンテンツブロッカー自体のコードは今回の監査対象外だが、設定画面からSafari設定への誘導がある（`settings.tsx`）
- `App-Prefs:SAFARI` スキームの使用 → プライベートAPIの可能性あり（要確認）

---

## Guideline 2.3.6 — 年齢制限

### ガイドライン要旨
- App Store Connectの年齢制限の質問に正直に回答する義務

### 現状の評価: 要確認（タスク3でApp Store Connect確認）
- アプリの内容（ポルノ依存回復）から **17+** が適切
- 性的行動のトラッキング、メンタルヘルスデータの取り扱いがある

---

## 優先度サマリー

| 問題 | 重要度 | ステータス |
|------|--------|-----------|
| プライバシーポリシーが実態と不一致 | CRITICAL | 要修正 |
| プロモコードがIAPバイパス | CRITICAL | 要修正 |
| ConsentStep説明文が不正確 | HIGH | 要修正 |
| Web版プライバシーポリシーの更新 | HIGH | hiro手動対応 |
| App-Prefs:SAFARIスキーム | MEDIUM | 要確認 |
| 年齢制限設定 | MEDIUM | タスク3で確認 |
| レビュー誘導（rating gate） | LOW | 現状OK、要注意 |
