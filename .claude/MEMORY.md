## 2026-04-04

### 作業内容
App Store Connect API 自動分析パイプラインの構築（Phase 1〜3）

### 完了した作業
1. **~/.config/asc/ セットアップ** — APIキー・秘密鍵の配置完了（hiro実行）
2. **データ取得スクリプト（TDD）** — JWT認証、APIクライアント、データ取得・保存
   - 36テスト全パス
3. **app-analytics Claude Skill** — ファネル分析、ベンチマーク比較、レポート生成
4. **テストデータでの動作確認** — パイプライン全体の通しテスト成功
5. **スケジュールタスク設定** — `rewire-daily-analytics` 毎朝9時自動実行
6. **初回APIリクエスト実行** — Report Request ID: `394c257b-c76e-4779-9257-30c74024383a`

### 未完了タスク・次回やるべきこと
- **データ取得確認**: 初回リクエストから約24時間後（2026-04-05 朝）に実データが取得可能になるはず。明日の自動実行結果を確認
- **スケジュールタスクのツール承認**: サイドバーから「rewire-daily-analytics」を手動実行して承認しておくと今後スムーズ
- **Campaign Links作成**: App Store ConnectでTikTokプロフィール用のCampaign Link（ct=tiktok_profile）を作成
- **Phase 4: TikTokマーケ連携**: TikTok Analyticsの手動入力フローの構築
- **main.pyへの--request-id保存**: 一度作ったrequest IDを再利用する仕組みの改善

### 注意事項
- MacのPython 3.9 (Xcode同梱)を使用。LibreSSL 2.8.3のためurllib3のOpenSSL警告あり（動作に影響なし）
- パッケージはユーザーインストール（/Users/arimurahiroaki/Library/Python/3.9/）
- APIキー・秘密鍵は絶対にプロジェクト内に置かない（~/.config/asc/に格納済み）

### 変更したファイル一覧
- `scripts/__init__.py` (新規)
- `scripts/analytics/__init__.py` (新規)
- `scripts/analytics/jwt_auth.py` (新規) — JWT認証
- `scripts/analytics/asc_client.py` (新規) — APIクライアント
- `scripts/analytics/asc_fetch.py` (新規) — データ取得・保存
- `scripts/analytics/main.py` (新規) — CLIエントリポイント
- `scripts/analytics/tests/__init__.py` (新規)
- `scripts/analytics/tests/test_jwt_auth.py` (新規)
- `scripts/analytics/tests/test_asc_client.py` (新規)
- `scripts/analytics/tests/test_asc_fetch.py` (新規)
- `scripts/analytics/tests/test_analyze_funnel.py` (新規)
- `data/analytics/2026-04-03/` (テストデータ)
- `docs/analytics/daily-report-2026-04-03.md` (テストレポート)
- `~/.claude/skills/app-analytics/SKILL.md` (新規) — 分析Skill
- `~/.claude/skills/app-analytics/scripts/analyze_funnel.py` (新規) — ファネル分析スクリプト

## 2026-04-11

### 作業内容
パニックボタン機能（Phase 0〜6）の TDD 実装完了

### 完了した作業
1. **Phase 0: expo-camera 依存追加** — `npx expo install expo-camera`、`app.config.ts` に NSCameraUsageDescription + expo-camera プラグイン設定
2. **Phase 1: 定数・i18n** — `constants/panic.ts` 新規（SIDE_EFFECTS/TYPEWRITER_MESSAGE_KEYS/TYPEWRITER_CONFIG）、`constants/breathing.ts` に `HOLD_DURATION: 4000` 追加、`locales/ja.ts`/`en.ts` に panic.* + breathing.hold キー追加
3. **Phase 2: 呼吸エンジン強化** — inhale → hold → exhale フロー、`BreathPhase` に `hold` 追加、`cycleCountRef` に refactoring、BreathingTimer 新規（MM:SS + サイクル進捗）
4. **Phase 3: パニック画面フック** — `useCameraPermission`（expo-camera wrapper）、`useTypewriterMessage`（7メッセージ ループ、entering→typing→pausing→exiting→interval フェーズ）
5. **Phase 4: パニック画面コンポーネント** — `PanicHeader`/`CameraPreview`（カメラ許可対応 + フォールバック）/`TypewriterCapsule`/`SideEffectsSection`（6カード）/`PanicActionButtons`（3ボタン）
6. **Phase 5: パニック画面ルート** — `app/panic/index.tsx`、`app/_layout.tsx` に panic 登録、breathing を modal presentation に、`lib/routing/routes.ts` に panic 追加
7. **Phase 6: SOSButton 変更** — `/breathing` → `/panic`、analytics を `sos_tapped` → `panic_button_tapped`
8. **最終検証** — パニック + 呼吸関連テスト 49/49 全パス、DashboardScreen.integration.test.tsx の SOSButton テストも更新

### 注意事項
- `__mocks__/react-native-safe-area-context.ts` の auto-mock は node_modules には自動適用されないため、SafeAreaView の代わりに `useSafeAreaInsets` + 手動 padding を使うのが安全
- 既存の失敗テスト4件（`brandConfig.test.ts`/`indexRouting.test.tsx`/`OnboardingScreen.test.tsx`/`ConsentStep.test.tsx`）はパニックボタン実装とは無関係（既存の `constants/brandConfig.ts`/`app/index.tsx` の未コミット変更と reanimated runtime クラッシュ）
- `jest.config.js` に `testPathIgnorePatterns: ['/\\.claude/worktrees/']` を追加してワークツリー重複実行を回避
- useTypewriterMessage のテストで、`advanceTimersByTime` に巨大な値を渡すと React effect 再実行でネストされた setTimeout が発火しないことがあり、文字ずつ細かく advance する必要がある

### 新規ファイル
- `constants/panic.ts`
- `components/panic/PanicHeader.tsx` + `__tests__/PanicHeader.test.tsx`
- `components/panic/CameraPreview.tsx` + `__tests__/CameraPreview.test.tsx`
- `components/panic/TypewriterCapsule.tsx` + `__tests__/TypewriterCapsule.test.tsx`
- `components/panic/SideEffectsSection.tsx` + `__tests__/SideEffectsSection.test.tsx`
- `components/panic/PanicActionButtons.tsx` + `__tests__/PanicActionButtons.test.tsx`
- `components/breathing/BreathingTimer.tsx` + `__tests__/BreathingTimer.test.tsx`
- `hooks/panic/useCameraPermission.ts` + `__tests__/useCameraPermission.test.ts`
- `hooks/panic/useTypewriterMessage.ts` + `__tests__/useTypewriterMessage.test.ts`
- `hooks/breathing/__tests__/useBreathingEngine.test.ts`
- `components/breathing/__tests__/BreathingText.test.tsx`
- `app/panic/index.tsx` + `__tests__/panicScreen.test.tsx`

### 変更ファイル
- `package.json` / `package-lock.json` — expo-camera 追加
- `app.config.ts` — NSCameraUsageDescription + expo-camera plugin
- `constants/breathing.ts` — HOLD_DURATION 追加
- `locales/ja.ts` / `locales/en.ts` — panic + breathing.hold キー
- `hooks/breathing/useBreathingEngine.ts` — hold フェーズ追加、cycleCountRef refactoring
- `components/breathing/BreathingCircle.tsx` — hold フェーズ scale=1 維持
- `components/breathing/BreathingText.tsx` — hold テキスト対応
- `app/breathing/index.tsx` — BreathingTimer 配置
- `app/_layout.tsx` — panic ルート登録、breathing を modal 化
- `lib/routing/routes.ts` — panic ルート定数
- `components/dashboard/SOSButton.tsx` — `/panic` ルート + `panic_button_tapped` analytics
- `components/dashboard/__tests__/SOSButton.test.tsx` — 新ルート検証
- `app/(tabs)/__tests__/DashboardScreen.integration.test.tsx` — 新ルート検証
- `__mocks__/react-native-safe-area-context.ts` — SafeAreaView エクスポート（最終的に戻した）
- `jest.config.js` — worktree ignore

## 2026-04-12

### 作業内容
ATT（App Tracking Transparency）完全削除 + Firebase Analytics（IDFA なし）復活
Rewire v1.1 build 51 が iPadOS 26.4.1 で ATT ダイアログが表示されないとリジェクトされたため、
Apple の定義上「トラッキング」に該当しない構成にしてリジェクト回避する方針で対応。

### 完了した作業

#### Phase 1: ATT 完全削除（TDD）
- **Red/Green**: `hooks/__tests__/useAppInitialization.test.ts` を更新
  - ATT ブロック削除
  - 「`collectDeviceIdentifiers` が呼ばれない（IDFA 非収集）」検証を追加
- `hooks/useAppInitialization.ts` から ATT ロジックと `Purchases.collectDeviceIdentifiers()` 呼び出しを削除
- `lib/tracking/attClient.ts` と `lib/tracking/__tests__/attClient.test.ts` を削除
- `package.json` から `expo-tracking-transparency` をアンインストール
- `app.config.ts` の plugins から `expo-tracking-transparency` を削除、末尾に `./plugins/withRemoveTrackingDescription` を安全網として配線

#### Phase 2: Firebase Analytics 復活（IDFA なし）
- `@react-native-firebase/analytics@23.8.8` をインストール（peer が `@react-native-firebase/app@23.8.8` に 1:1 固定なので `--legacy-peer-deps` 必須）
- **重要**: `@react-native-firebase/analytics` は **config plugin ではない**（`app.plugin.js` なし）。プラグインリストに加えると prebuild が PluginError。autolinking 経由で Pods が解決される。plugins リストには `@react-native-firebase/app` のみ残す
- `plugins/withFirebaseAnalyticsNoAdId.js` を commit `a953d00^` から復元（`$RNFirebaseAnalyticsWithoutAdIdSupport = true` を Podfile に注入）
- `plugins/__tests__/withFirebaseAnalyticsNoAdId.test.js` も同時復元
- `app.config.ts` の `forceStaticLinking` に `RNFBAnalytics` を追加
- `lib/tracking/analyticsClient.ts` を Firebase Analytics 実装に差し替え（`isExpoGo` ガードで Expo Go では no-op、ネイティブ失敗時は `logger.warn` にフォールバック）
- `lib/tracking/__tests__/analyticsClient.test.ts` を Firebase モックベースに書き換え（`lib/survey/__tests__/firestoreClient.test.ts` と同じパターン）

#### Phase 3: prebuild 検証
- `npx expo prebuild --platform ios --clean` 成功
- `ios/Rewire/Info.plist`: **`NSUserTrackingUsageDescription` なし** ✓（`withRemoveTrackingDescription` 安全網が効いている）
- `ios/Podfile`: **`$RNFirebaseAnalyticsWithoutAdIdSupport = true` あり** ✓
- `ios/Podfile.lock`: `FirebaseAnalytics 12.8.0` + `GoogleAppMeasurement 12.8.0` あり、**`GoogleAppMeasurementIdentitySupport` なし** ✓（IDFA 非収集確認）

#### Phase 4: テスト & buildNumber
- 対象テスト 26 件（useAppInitialization 9、analyticsClient 9、withFirebaseAnalyticsNoAdId 5、withRemoveTrackingDescription 3）全パス
- 全テストスイート: 1444 pass / 10 fail（既存の pre-existing 失敗 4 suites: brandConfig, OnboardingScreen, indexRouting, ConsentStep — いずれも今回の変更とは無関係な reanimated worklets / 値ミスマッチ系）
- `npm run lint`: 13 errors / 310 warnings（すべて `app/+not-found.tsx`、`app/checkin/index.tsx` の pre-existing。今回の変更による新規エラーなし）
- `app.json` の `ios.buildNumber`: `51` → `52`

### 次回やるべきこと（hiro 手動）

**Phase 4-残り（hiro）:**
1. 変更を git commit（panic 関連の uncommitted 変更と合わせてまとめる or 段階コミットに分けるか要判断）
2. `eas build --profile production --platform ios`
3. `eas submit --profile production --platform ios`

**Phase 5: App Store Connect + Apple 返信（hiro 手動）:**
1. App Store Connect > Rewire > App Privacy
   - 「Data Used to Track You」を全て削除 → **No data from this app is used to track the user** を選択
   - 「Data Linked to You」: Firebase Analytics で収集するデータを記載（Product Interaction / Purchase History / User ID / Usage Data）。用途は **Analytics, App Functionality**（Advertising は選ばない）
2. Apple レビュー担当者への返信（英語）
   - ATT framework 削除、`NSUserTrackingUsageDescription` 削除、`$RNFirebaseAnalyticsWithoutAdIdSupport = true` で IDFA 非収集、他社データとの紐付けなし、App Privacy を「Not Used for Tracking」に更新済みを明記
   - 計画書の `5-2. Apple レビュー担当者へのノート（英語）` のテンプレを使用

### 発見した問題点・注意事項

1. **`@react-native-firebase/analytics` は config plugin ではない**: `app.plugin.js` が存在せず、plugins リストに入れると `PluginError: Unable to resolve a valid config plugin` で prebuild 失敗。`@react-native-firebase/app` だけで十分で、analytics は autolinking される
2. **peer dep conflict**: `@react-native-firebase/analytics@24.0.0` は `app@24.0.0` を要求、現状 `app@23.8.8`。latest ではなく `@23.8.8` を `--legacy-peer-deps` 付きでインストールする必要あり。package 全体を 24 系に bump する選択肢もあるが、今回は最小変更で済ませた
3. **`withRemoveTrackingDescription` は必ず plugins 末尾に配置する**: Firebase などの SDK が Info.plist に `NSUserTrackingUsageDescription` を自動注入する可能性があるため、最後に実行されて確実に削除する必要がある
4. **`@react-native-firebase` の jest モック**: `{ __esModule: true, default: <factory function> }` 形式で `jest.mock` すると実際の native import と `require('...').default` パスが一致して動作する。`lib/survey/__tests__/firestoreClient.test.ts` のパターンがそのまま使える
5. **pre-existing 失敗テスト (4 suites)**: 今回の変更とは無関係だが、別途修正すべき:
   - `constants/__tests__/brandConfig.test.ts`: `calculateBrandTimings` の期待値 `4000` vs 実際 `3000` のミスマッチ
   - `app/__tests__/OnboardingScreen.test.tsx` / `indexRouting.test.tsx` / `app/onboarding/__tests__/ConsentStep.test.tsx`: `react-native-reanimated` `FrameCallbackRegistryUI` の `Cannot set properties of undefined (setting 'startTime')` jest 環境の問題

### 変更したファイル

#### 削除
- `lib/tracking/attClient.ts`
- `lib/tracking/__tests__/attClient.test.ts`

#### 修正
- `app.config.ts` — plugins から `expo-tracking-transparency` 削除、`./plugins/withFirebaseAnalyticsNoAdId` と `./plugins/withRemoveTrackingDescription` 追加、`forceStaticLinking` に `RNFBAnalytics` 追加
- `app.json` — buildNumber 51 → 52
- `package.json` / `package-lock.json` — `expo-tracking-transparency` 削除、`@react-native-firebase/analytics@23.8.8` 追加
- `hooks/useAppInitialization.ts` — ATT ロジック削除、`collectDeviceIdentifiers` 削除
- `hooks/__tests__/useAppInitialization.test.ts` — ATT ブロック削除、`collectDeviceIdentifiers` 非呼び出しテスト追加
- `lib/tracking/analyticsClient.ts` — Firebase Analytics 実装に差し替え（`isExpoGo` + エラーハンドリング）
- `lib/tracking/__tests__/analyticsClient.test.ts` — Firebase モックベースに書き換え

#### 新規（復元）
- `plugins/withFirebaseAnalyticsNoAdId.js`（commit `a953d00^` から復元）
- `plugins/__tests__/withFirebaseAnalyticsNoAdId.test.js`（同上）
