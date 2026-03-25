# タスク2 追加: rewire-support Web版プライバシーポリシー・利用規約の調査

## 調査日: 2026-03-22
## リポジトリ: hiro0211/rewire-support (GitHub Pages)

---

## 1. Web版 vs アプリ内 プライバシーポリシー比較

### Web版 (index.html) — 既に更新済み
- ✅ Firebase/Firestoreへのデータ送信を明記（セクション2, 4, 5, 6）
- ✅ アンケートデータ、プロモコード使用記録のサーバー送信を記載
- ✅ Firebase Analytics利用を明記
- ✅ RevenueCat利用を明記
- ✅ 第三者サービスへのデータ送信リストを記載
- ✅ FAQ にもサーバー送信について記載
- 最終更新日: 2026年3月22日

### アプリ内 (locales/ja.ts, locales/en.ts) — 古い内容のまま
- ❌ 「外部サーバーへのデータ送信は行いません」（s4Body）
- ❌ 「課金サービスを除き、第三者への提供なし」（s6Body）
- ❌ Firebase Analytics/Firestoreの記載なし
- ❌ アンケートデータのサーバー送信の記載なし
- 最終更新日: 2026年2月26日

### 必要なアクション: アプリ内プライバシーポリシーをWeb版に合わせて更新

---

## 2. 発見された問題

### a. アプリ名の不一致（MEDIUM）
- Web版: **Ridatu**（旧名）
- アプリ: **Rewire**（現在の名前）
- タイトル、ヘッダー、FAQ、利用規約すべてで「Ridatu」を使用
- → Web版のアプリ名を「Rewire」に統一する必要あり（hiro手動対応）

### b. ATTに関する記述の不整合（MEDIUM）
Web版 セクション5:
> 「iOSではApp Tracking Transparency (ATT)の許可を求める場合がありますが、これはアナリティクスの精度向上を目的としたものであり…」

- NSUserTrackingUsageDescriptionは既に削除済み → ATTは表示されない
- この記述は不正確 → 削除するか「ATTの許可は求めません」に修正

### c. ATT不要にした場合のFirebase Analytics設定（LOW）
- ATTなしでもFirebase Analyticsは動作する（IDFAなし）
- プライバシーポリシーでATTに言及する必要はない

### d. プロモコードの記載（INFO）
- Web版の利用規約にプロモコード関連の記述はない
- プライバシーポリシーにはプロモコード使用記録の送信を記載済み
- プロモコード機能自体が3.1.1違反のため、削除した場合はこの記載も不要になる

---

## 3. Web版で正しく記載されている内容（参考）

### プライバシーポリシー（正しい構造）
1. はじめに
2. 収集するデータ（デバイス上 / サーバー送信の2カテゴリに分離）
3. 利用目的
4. データの保存場所（ローカル / Firebase の説明）
5. 課金サービス・分析ツールについて（Firebase Analytics, RevenueCat明記）
6. 第三者への提供（App Store, RevenueCat, Firebase Analytics, Firebase Firestoreを列挙）
7. データの削除
8. お問い合わせ

### 利用規約（正しい構造）
1. 利用規約の適用
2. 利用条件
3. 免責事項
4. 禁止事項
5. データの取り扱い（Firebase送信を記載）
6. アプリ内課金について
7. 規約の変更
8. 準拠法

---

## 4. 対応まとめ

| # | 項目 | 対応者 | 優先度 |
|---|------|--------|--------|
| 1 | アプリ内プライバシーポリシー(ja.ts/en.ts)をWeb版に合わせて更新 | Claude Code | CRITICAL |
| 2 | アプリ内利用規約(ja.ts/en.ts)をWeb版に合わせて更新 | Claude Code | HIGH |
| 3 | Web版のアプリ名「Ridatu」→「Rewire」に統一 | hiro手動 | MEDIUM |
| 4 | Web版のATT記述を修正（ATTは使わないので削除/修正） | hiro手動 | MEDIUM |
| 5 | プロモコード削除後、関連記述も削除 | 両方 | 要判断 |
