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

## 2026-04-16

### 作業内容
ホーム画面ダッシュボードのオーブカルーセル化（QUITTR風）+ 経過時間表示から日数を削除

### 完了した作業（TDDサイクルで全Phase完了）

#### Phase A: `formatStopwatchTime` 拡張
- `FormatStopwatchOptions { includeDays?: boolean }` を追加
- `includeDays: false` で日パートを省略（例: `{days:45, hours:22, minutes:9}` → `"22時間9分"` / `"22h 9m"`）
- 既存の `buildShareText` (`lib/share/shareService.ts`) は options 省略で従来通り `"45日22時間9分"` を維持
- テスト6件追加（日本語/英語/時間0/days=0/デフォルト互換）

#### Phase B: `useStopwatch` に `formattedShort` 追加
- `UseStopwatchResult` に `formattedShort` プロパティ追加
- `formatStopwatchTime(time, isJapanese, { includeDays: false })` を2重呼び出しで生成（O(文字列連結)程度、60秒ごとなので負荷なし）

#### Phase C: `OrbCarouselItem` 新規作成
- プロップス: `badge, itemWidth, activeOrbSize, isActive, onLongPress`
- アクティブ: `<AnimatedOrb chapterId={badge.chapter} size={200} />` + TouchableOpacity 長押し
- 非アクティブ: `LinearGradient` 3色角丸円 + scale 0.55 + opacity 0.4
- `React.memo` で wrap（毎分のuseStopwatch tickによる再描画を防ぐ）
- 日本語/英語単数形対応（`1 day` vs `N days`）
- a11y: アクティブは `role="button"`/`label`/`state.selected=true`、非アクティブは `role="image"`

#### Phase D: `OrbCarousel` 新規作成
- `FlatList horizontal` + `snapToInterval={itemWidth}` + `snapToAlignment="center"` + `decelerationRate="fast"`
- `ITEM_WIDTH = activeOrbSize(200) + 80 = 280`、左右ピーク設計
- `useWindowDimensions()` で回転対応
- `getBadgeByDay(currentDays)` で初期 `initialScrollIndex` 解決
- `getItemLayout` 提供 + `onScrollToIndexFailed` は `requestAnimationFrame` + `listRef.scrollToOffset` で適切に retry
- `windowSize=3`, `initialNumToRender=3`, `maxToRenderPerBatch=3`
- `removeClippedSubviews` は付けない（iOS horizontal FlatList で blank cell バグ既知）

#### Phase E: `StatsRow` 置換
- `AnimatedOrb` 直接描画 → `<OrbCarousel currentDays={streakDays} onLongPress={openEdit} />`
- `useCallback` で `openEdit`/`closeEdit`/`handleSave` をメモ化（毎分の再レンダーで OrbCarousel の renderItem 閉包が invalidate しないように）
- 不要になった `usePressAnimation`, `getStreakTier`, `AnimatedOrb` import 削除

#### Phase F: 経過時間表示変更
- `app/(tabs)/index.tsx:135`: `elapsed={stopwatch.formatted}` → `elapsed={stopwatch.formattedShort}`
- シェアテキスト（ShareWidgetCard）は従来通り `stopwatch.formatted`（日数含む）

### テスト結果
- 新規追加: `formatStopwatchTime` includeDays:false 6件、`useStopwatch` formattedShort 1件、`OrbCarouselItem` 7件、`OrbCarousel` 7件、`StatsRow` 更新3件 = 計24件
- 全体テスト: **232スイート / 1599テスト全パス**（以前の MEMORY.md に記載の10失敗は後続コミットで解消済みだった）
- `npx tsc --noEmit`: 変更ファイルに新規エラーなし
- `npm run lint`: 変更ファイルに新規エラーなし（既存の warning のみ）

### 注意事項
- `FormatStopwatchOptions` は optionsオブジェクトパターン（boolean 1つだけだが計画仕様に従った）
- `OrbCarouselItem` は `React.memo` が必須 — `useStopwatch` が 60秒ごとに `StatsRow` を再レンダーするため、memo なしだと FlatList 内の全 mounted アイテム（~3）が毎分再描画される
- `StatsRow` の callbacks は `useCallback` 必須 — インラインアローだと毎分新しい参照になり、`OrbCarousel.renderItem` の deps が invalidate する
- `useWindowDimensions()` を `Dimensions.get('window')` の代わりに使用（回転・split-screen 対応）
- `onScrollToIndexFailed` は `requestAnimationFrame` + `scrollToOffset` で retry（`getItemLayout` 提供済みなので本来稀だが、安全網として実装）
- 英語単数形: `1 day` vs `N days`（Nebula の `day=1` のみ影響）
- QUITTR風UI: アクティブ 200px Skia シェーダー + グロー + パーティクル、非アクティブ scale 0.55 flat LinearGradient
- Skia オーブはアクティブ1個のみ（18個すべて Skia は確実にフレーム落ち）
- 実データへの副作用なし（カルーセル内部 state のみ更新、streak 等は unchanged）

### 新規ファイル
- `components/dashboard/OrbCarousel.tsx`
- `components/dashboard/OrbCarouselItem.tsx`
- `components/dashboard/__tests__/OrbCarousel.test.tsx`
- `components/dashboard/__tests__/OrbCarouselItem.test.tsx`

### 変更ファイル
- `lib/stats/statsCalculator.ts` — `FormatStopwatchOptions` 追加、`formatStopwatchTime` 拡張
- `lib/stats/__tests__/statsCalculator.test.ts` — `includeDays:false` テスト追加
- `hooks/dashboard/useStopwatch.ts` — `formattedShort` プロパティ追加
- `hooks/dashboard/__tests__/useStopwatch.test.ts` — `formattedShort` テスト追加
- `components/dashboard/StatsRow.tsx` — `OrbCarousel` に置換、`useCallback` 導入
- `components/dashboard/__tests__/StatsRow.test.tsx` — `animated-orb` → `orb-carousel` テスト更新
- `app/(tabs)/index.tsx` — `stopwatch.formatted` → `stopwatch.formattedShort`（SegmentedStreakCard 経過時間のみ、ShareWidgetCard は維持）

### 未コミット状態
ユーザー側でレビュー後コミット予定

## 2026-04-16（追補）: OrbCarousel 中央揃え修正 + 前後天体ピーク表示

### 作業内容
実機スクショで確認した2つの視覚的不具合を修正（TDDサイクルで実装）:
1. **中心ずれ**: アクティブオーブが画面中央から右に16pxずれる
2. **ピーク不在**: 左右の前/次の天体がほぼ表示されない

### 根本原因
- `useWindowDimensions()` で画面幅 390 を基準に `sidePadding` 算出していたが、FlatList は親の `scrollContent { padding: SPACING.lg (=16) }` 内側にあり実ビューポート幅は 358 → 差分 16px がずれ
- `itemWidth = 200 + 80 = 280` で隣接アイテム中心が画面外に大きくはみ出し、非アクティブオーブ実効径 110 では可視領域ゼロ

### 修正内容
#### OrbCarousel.tsx
- `useWindowDimensions` 削除 → `listWidth` state + `onLayout` 実測ベースに変更
- `sidePadding = listWidth > 0 ? (listWidth - itemWidth) / 2 : 0`（onLayout 前は 0）
- `ITEM_WIDTH_PADDING`: `80` → `20`（itemWidth=220）
  - 画面幅 390 で隣接アイテム中心が ±220 → 左右約30pxの天体ピーク

#### OrbCarouselItem.tsx
- `styles.container` / `styles.orbArea` に `overflow: 'visible'` 追加（AnimatedOrb のグロー領域 320px が cell 220px を超えるため）

### テスト
- 追加テスト4件（onLayout 前の paddingHorizontal=0 / onLayout 後 69 / snapToInterval=220 / getItemLayout.length=220）
- 初回 Red（4失敗）→ 実装 Green（11/11 passed）
- 全体: 232スイート / 1603テスト 全パス
- tsc/lint: 変更ファイルに新規エラー・警告なし

### 変更ファイル
- `components/dashboard/OrbCarousel.tsx`
- `components/dashboard/OrbCarouselItem.tsx`
- `components/dashboard/__tests__/OrbCarousel.test.tsx`

### 注意事項
- `onLayout` 発火前の初回フラッシュで一瞬 item が左寄せに見える可能性あり（実害は最小、initialScrollIndex の自動スクロールと同フレーム発火のため）
- `onScrollToIndexFailed` 既存 retry が sidePadding=0 状態の initial scroll 失敗を吸収

### 未コミット状態
ユーザー側でレビュー後コミット予定

## 2026-04-16

### 作業内容
Achievements画面を「Stellar Path（恒星の航路）」デザインにリデザイン。
従来の章ヘッダー＋縦線＋ドット形式の CosmosProgressTimeline を、
18バッジそれぞれが発光Orb + SVG蛇行線で繋がる縦タイムラインに置換。

### TDD で実装した新規コンポーネント（全テスト通過）
1. `components/achievements/GravityThread.tsx` — 2バッジ間を繋ぐS字SVG曲線（3テスト）
2. `components/achievements/BadgeOrb.tsx` — バッジ固有色のOrb。unlocked=Skia/Reanimated/パーティクル付きフル演出、locked=LinearGradient静止ゴースト（opacity 0.3）（4テスト）
3. `components/achievements/BadgeOrbRow.tsx` — Orb + バッジ名 + Day N + メッセージの1行。ジグザグ配置対応（3テスト）
4. `components/achievements/AchievementsHeader.tsx` — X close ボタン + Achievements タイトルのカスタムヘッダー（2テスト）
5. `components/achievements/StellarPathTimeline.tsx` — 18バッジ縦並び + 17個のGravityThread（3テスト）

### 変更ファイル
- `app/achievements.tsx` — CosmosProgressTimeline → StellarPathTimeline、AchievementsHeader 組込、SafeAreaView + expo-router の useRouter で back()
- `app/_layout.tsx` — achievements の `headerShown: true` → `false`（カスタムヘッダー使用のため）
- `app/__tests__/achievements.test.tsx` — 新しい画面構造にテストを更新（AchievementsHeader/StellarPathTimeline モック）

### 検証結果
- テスト: 238スイート / 1626テスト全通過（実装前 1619 → +7）
- Lint: 新規ファイル 0 error（warnings のみ、既存の AnimatedOrb.tsx と同パターン）
- 12 個の既存lint errorは今回の変更と無関係（他テストファイルのdisplay-name等、リグレッションなし）

### 未完了タスク・次回やるべきこと
- 既存 `components/profile/CosmosProgressTimeline.tsx` と対応テスト (`components/profile/__tests__/CosmosProgressTimeline.test.tsx`) は未削除。現在はどこからも参照されていないので別PRで削除検討
- Expo development build / iOS シミュレータでの実機確認（Skia の Orb 描画、ジグザグ配置、S字曲線、60fpsスクロール）は未実施
- パフォーマンス検証（streak=0〜1095 の2シナリオで FPS 測定）も未実施

### 設計判断・注意事項
- BadgeOrb は AnimatedOrb の構造をコピーして `colors` プロップで色を上書きする別コンポーネントとして実装（SRP優先）。将来 AnimatedOrb を colors プロップ対応に拡張すれば統合可能
- GravityThread のアクティブ判定は「前のバッジがunlocked」を使用。stroke は active = `badge.colors.glow`、inactive = `rgba(255,255,255,0.1)`
- ジグザグ配置: index=0 は center、以降は odd=left (-20px)、even=right (+20px)
- 背景ルール遵守: AuroraBackground + StarryOverlay をそのまま維持、SafeAreaWrapper の gradients.background は触っていない
- テスト時の react-native-svg モック: `default` コンポーネントに testID を渡すと上書きされるので、GravityThread では Svg に testID を付けない設計にした

### 変更したファイル一覧（主要）
新規:
- `components/achievements/GravityThread.tsx`
- `components/achievements/BadgeOrb.tsx`
- `components/achievements/BadgeOrbRow.tsx`
- `components/achievements/AchievementsHeader.tsx`
- `components/achievements/StellarPathTimeline.tsx`
- `components/achievements/__tests__/GravityThread.test.tsx`
- `components/achievements/__tests__/BadgeOrb.test.tsx`
- `components/achievements/__tests__/BadgeOrbRow.test.tsx`
- `components/achievements/__tests__/AchievementsHeader.test.tsx`
- `components/achievements/__tests__/StellarPathTimeline.test.tsx`

変更:
- `app/achievements.tsx`
- `app/_layout.tsx`
- `app/__tests__/achievements.test.tsx`

### 未コミット状態
ユーザー側でレビュー後コミット予定


## 2026-04-16: OrbCarousel 未達成天体の視認性改善

### 作業内容
ホーム画面の OrbCarousel で、未達成（locked）の天体が達成済みのように見える問題を修正。`isActive` のみで判定していたところに `isUnlocked = badge.day <= currentDays` を導入し、4ケース（active/inactive × unlocked/locked）で opacity と AnimatedOrb 描画を切り替えるようにした。

### 仕様
- A: active+unlocked → `<AnimatedOrb>`（フル glow / pulse / particle）
- B: active+locked → 大きい static Orb + opacity 0.25（静止、AnimatedOrb なし）
- C: inactive+unlocked → 小さい static Orb + opacity 0.4 + scale 0.55（現状維持）
- D: inactive+locked → 小さい static Orb + opacity 0.15 + scale 0.55
- accessibilityLabel に locked のとき「（未達成）」/「(locked)」を追加
- accessibilityState に `disabled: !isUnlocked` を追加

### 変更ファイル
- `components/dashboard/OrbCarouselItem.tsx` — `currentDays: number` prop 必須化、`resolveStaticOpacity` ヘルパー、`formatA11yLabel` ヘルパー追加
- `components/dashboard/OrbCarousel.tsx` — `currentDays` を OrbCarouselItem に流し込み、useCallback 依存配列に追加
- `components/dashboard/__tests__/OrbCarouselItem.test.tsx` — 4ケース + a11y テスト追加（合計 12 テスト）
- `components/dashboard/__tests__/OrbCarousel.test.tsx` — 既存スクロールテストを「locked へスクロール → animated-orb 消える」に書き換え、新規 2 テスト追加

### TDD ステップ
1. Red: 4 ケースのテスト追加 → 4 失敗確認
2. Green: OrbCarouselItem 改修 → 12 テスト全パス
3. Refactor: OrbCarousel 連携 + 全 1643 テスト通過 + lint 差分なし

### 注意点
- `currentDays` は必須 prop（型安全性優先、デフォルト値なし）
- FlatList virtualization のジェスト挙動: `initialScrollIndex` と `windowSize=3` の関係でスクロール後に rendered window が変わる。テスト書き換え時は注意
- BadgeOrb（Achievements 画面）の locked 表現（opacity 0.3）と数値が異なる：ホームは情報密度が高いため active/inactive で opacity を分ける必要あり
- 影響範囲: ホーム画面 StatsRow 内の OrbCarousel のみ。他画面・SOS・背景には影響なし

### 未コミット状態
hiro 側で iOS Simulator 目視確認後コミット予定。


## 2026-04-16（追補2）: StaticOrb で locked 天体に radial beam の面影を残す

### 背景
前項の opacity による locked 表現はフラットな LinearGradient グラデーションを使っていたため、QUITTR のサンプルと比べて「のっぺり」して見えた。hiro からの指示:
> もう少し面影が見えるように修正して添付のビデオのようなイメージです

### 対応
新規コンポーネント `StaticOrb` を追加。AnimatedOrb と同じ Skia shader (`ORB_SHADER`) を `time=1.2`（beam パターンが最も見やすい位相）で固定描画する。pulse / glow / particle は省略し、AnimatedOrb の「面影」だけを残す構造。

### OrbCarouselItem の opacity チューニング（視認性強化）
- INACTIVE_OPACITY: 0.4 → **0.55**
- LOCKED_ACTIVE_OPACITY: 0.25 → **0.4**
- LOCKED_INACTIVE_OPACITY: 0.15 → **0.3**

Skia shader の明暗差が LinearGradient よりコントラスト強いため opacity を上げても達成感との線引きが崩れない。hiro の目視確認で微調整前提。

### 新規ファイル
- `components/dashboard/StaticOrb.tsx` — Skia shader 固定描画（Skia 利用不可環境は LinearGradient にフォールバック）
- `components/dashboard/__tests__/StaticOrb.test.tsx` — size 適用 / Canvas 描画（Skia モック環境）の 2 テスト

### 変更ファイル
- `components/dashboard/OrbCarouselItem.tsx` — LinearGradient を `StaticOrb` に差し替え、opacity 定数を更新
- `components/dashboard/__tests__/OrbCarouselItem.test.tsx` — opacity 期待値を 0.55 / 0.4 / 0.3 に更新

### 注意事項
- `StaticOrb` の Skia shader uniforms は **必ず `useDerivedValue` 経由** で渡す必要がある（`useSharedValue` でないと Skia が受け付けない）。`time` は 1.2 で固定するが、それでも `useSharedValue` + `useDerivedValue` のラッパが必須
- `ORB_SHADER` を静的に使うため、AnimatedOrb の `time` 変化を省略。これで CPU / GPU 負荷なく 18 個分を描画可能
- Skia JSX の型エラーは AnimatedOrb.tsx にも存在する pre-existing（TS2604/TS2786）。今回新規に増やしたものではない
- Jest の `__mocks__/@shopify/react-native-skia.tsx` は RuntimeEffect.Make を truthy で返すため Canvas パスが描画される → テストは Canvas 描画を検証

### 検証結果
- 全テスト 239 スイート / 1645 テスト パス
- Orb 系 30 テスト（OrbCarousel 14 + OrbCarouselItem 14 + StaticOrb 2）パス
- lint: StaticOrb.tsx に `require()` warning 1件（AnimatedOrb と同パターン、意図的）のみ
- TS: Skia JSX 型エラーは pre-existing、新規導入なし

### 未コミット状態
hiro 側で iOS Simulator 目視確認（locked オーブの beam 見え方、active + locked の輝度感）後コミット予定。

## 2026-04-18: 18バッジシステム Phase 0〜3 実装完了

### 作業内容
Kent Beck TDD (Red→Green→Refactor) で Phase 0〜3 を全て実装し、各フェーズ完了後に main にコミット＆プッシュ。

### 完了した作業

#### Phase 0: デッドコード削除
- `components/profile/CosmosProgressTimeline.tsx` 削除（StellarPathTimeline に置換済み）
- `components/profile/__tests__/CosmosProgressTimeline.test.tsx` 削除
- コミット: `refactor: remove unused CosmosProgressTimeline`

#### Phase 1: バッジ固有アニメーション設定
- **新規**: `constants/badges/badgeAnimations.ts`
  - `BadgeAnimationOverride = Partial<OrbTierConfig>` 型
  - `BADGE_ANIMATION_OVERRIDES: Record<BadgeId, BadgeAnimationOverride | undefined>`（18バッジ分）
  - `getBadgeAnimConfig(badgeId, chapterId): OrbTierConfig` — chapterConfigにoverrideをスプレッド
  - Stardust: undefined（chaos デフォルト 4000ms のまま）、Cosmos: 1500ms（最速）
- **新規**: `constants/badges/__tests__/badgeAnimations.test.ts`（12テスト）
- **変更**: `constants/badges/index.ts`（エクスポート追加）
- **変更**: `components/achievements/BadgeOrb.tsx`（`badgeId?: BadgeId` prop追加、getBadgeAnimConfig使用）
- **変更**: `components/achievements/BadgeOrbRow.tsx`（`badgeId={badge.id}` を BadgeOrb に渡す）
- コミット: `feat: add per-badge animation overrides`

#### Phase 2: 土星の環（SaturnRing）描画
- `BadgeOrb` に `SaturnRing` サブコンポーネント追加（react-native-svg Ellipse）
- `badgeId === 'SolarSystem'` のとき locked/unlocked 両方で描画
- 2層楕円（後ろ 0.45 opacity, 前 arc 0.7 opacity）、-20° 傾け
- ring 色は badge.glow カラー
- `StellarPathTimeline.test.tsx` の SVG モックに `Ellipse` 追加
- コミット: `feat: add Saturn ring special visual for SolarSystem badge`

#### Phase 3: 恒星系の軌道（StellarSystemOverlay）描画
- `BadgeOrb` に `StellarSystemOverlay` + `PlanetDot` サブコンポーネント追加
- `badgeId === 'BinaryStars'` のとき unlocked 状態で描画
- 3本の orbital ring（SVG Circle, stroke-only, opacity 0.28）+ 3つの PlanetDot
- PlanetDot: `Animated.View` 全体を回転（withRepeat + withTiming + Easing.linear）でドットが等速円運動
- 周期: inner 4000ms / mid 7000ms / outer 11000ms
- コミット: `feat: add stellar system orbital overlay for BinaryStars badge`

### テスト状況
- Phase 0 後: 248スイート / 1690テスト
- Phase 1 後: 249スイート / 1702テスト（+12テスト）
- Phase 2 後: 249スイート / 1707テスト（+5テスト）
- Phase 3 後: 249スイート / 1712テスト（+5テスト）

### 重要な注意事項
- `jest テスト実行`: worktree から `npx jest --testPathIgnorePatterns "/node_modules/"` で実行（jest.config.js の `testPathIgnorePatterns` に `/\.claude/worktrees/` があるため `--passWithNoTests` ではなくこのフラグが必要）
- `react-native-svg` モック: BadgeOrb を使うテストでは `Ellipse` と `Circle` の両方が必要。StellarPathTimeline.test.tsx 等は更新済み
- `BadgeId 'stellarSystem'` は存在しない。Phase 3 の軌道描画は `'BinaryStars'` バッジに実装
- `SaturnRing` は locked/unlocked 両方で表示、`StellarSystemOverlay` は unlocked のみ（アニメーションあり）
- 各フェーズ完了後に main へ fast-forward merge & push 済み

### 変更ファイル一覧
- `components/profile/CosmosProgressTimeline.tsx`（削除）
- `components/profile/__tests__/CosmosProgressTimeline.test.tsx`（削除）
- `constants/badges/badgeAnimations.ts`（新規）
- `constants/badges/__tests__/badgeAnimations.test.ts`（新規）
- `constants/badges/index.ts`（変更）
- `components/achievements/BadgeOrb.tsx`（変更: badgeId prop、SaturnRing、StellarSystemOverlay）
- `components/achievements/BadgeOrbRow.tsx`（変更: badgeId 渡し）
- `components/achievements/__tests__/BadgeOrb.test.tsx`（変更: Phase2/3テスト追加）
- `components/achievements/__tests__/StellarPathTimeline.test.tsx`（変更: Ellipse モック追加）

## 2026-04-18: バッジシステム Phase 4-9 完了

### 作業内容
hardcore-goodall worktreeに実装済みだったPhase 4-9をmainにff-mergeしてプッシュ

### 完了した作業
- **Phase 4 (Galaxy Spiral)**: `BadgeOrb.tsx`に`GalaxySpiral`サブコンポーネント追加。対数螺旋2本(r=a*e^(bθ))をSVG Pathで描画、Reanimated 8000msで回転
- **Phase 5 (StarCluster)**: `StarClusterOverlay` + `SatelliteStar` — 中央コア+周辺6個小球、各小球に独立した透明度ゆらぎアニメーション
- **Phase 6 (Cosmos)**: `CosmosOverlay` — 黄金角らせん配置で25個の多色光点、全18バッジカラーパレットから選択、各点に点滅アニメーション
- **Phase 7 (BadgeUnlock)**: `hooks/achievements/useNewlyUnlockedBadge.ts`（AsyncStorage `seen_badge_ids`で既読管理）+ `components/achievements/BadgeUnlockModal.tsx`（BadgeOrb+名前+説明+閉じるボタン）
- **Phase 8 (NextBadgeProgress)**: `components/dashboard/NextBadgeProgress.tsx`（BadgeOrb(size=32)+名前+LinearProgressバー）
- **Phase 9 (最終検証)**: 252スイート / 1739テスト全パス、TypeScriptエラーは既存のもののみ（新規ファイルゼロ）

### 変更ファイル
- `components/achievements/BadgeOrb.tsx`（GalaxySpiral/StarClusterOverlay/CosmosOverlay追加）
- `components/achievements/BadgeUnlockModal.tsx`（新規）
- `components/achievements/__tests__/BadgeUnlockModal.test.tsx`（新規）
- `components/achievements/__tests__/BadgeOrb.test.tsx`（Phase4-6テスト追加）
- `components/dashboard/NextBadgeProgress.tsx`（新規）
- `components/dashboard/__tests__/NextBadgeProgress.test.tsx`（新規）
- `hooks/achievements/useNewlyUnlockedBadge.ts`（新規）
- `hooks/achievements/__tests__/useNewlyUnlockedBadge.test.ts`（新規）
- `lib/storage/asyncStorageClient.ts`（getItem/setItem追加）
- `app/(tabs)/index.tsx`（NextBadgeProgress + BadgeUnlockModal 組み込み）

### 未完了タスク・次回やるべきこと
- 特になし。バッジシステム全フェーズ完了
- 将来: BadgeOrb と AnimatedOrb の統合（SRP上は別コンポーネントが適切だが、コア描画ロジックの共通化余地あり）

---

## 2026-04-19: Daily Reflection Sheet 実装

### 作業内容
orbrefactor.md の仕様 + QUITTR 風スクリーンショットを基に、`/checkin` 画面を Bottom Sheet ベースの Daily Reflection Sheet に刷新。オンボーディングで指定した時刻にローカル通知が飛び、タップで下からせり上がる2ステップ(+完了画面)のシートが表示される。完了時にダッシュボードのストリーク演出（Haptics Success + 未完了バッジ消失）が発火。

### 完了した作業
- **reflectionStore 新規** (stores/reflectionStore.ts) — lastReflectionDate を settings AsyncStorage キーにマージ保存
- **useReflectionSheet フック** (hooks/reflection/useReflectionSheet.ts) — zustand store で visible/step/formState/isSubmitting を一元管理。submit 時に checkinService.processCheckin → addCheckin → loadUser → markCompleted
- **useReflectionTrigger フック** (hooks/reflection/useReflectionTrigger.ts) — 通知タップで sheet を open（warm/cold start 両対応）
- **ReflectionSheet** + ReflectionStepContainer + Relapse/Urge/Complete の5コンポーネント — reanimated で translateY + overlay opacity、BlurView、Fade+Slide step transition
- **旧 /checkin 削除** — app/checkin/, components/checkin/, hooks/checkin/, ROUTES.checkin(Complete), Stack.Screen checkin
- **SegmentedStreakCard に todayReflectionCompleted prop 追加** — 未完了時 '✨ 今日の振り返りを完了しよう' バッジ表示、false→true transition で Haptics Success
- **notificationClient に data payload {action:'open_reflection'} 追加**
- **jest.setup.js に expo-notifications 共通 safe mock 追加**（Dashboard 系テストが useReflectionTrigger 経由でクラッシュ回避）
- **locales/ja,en に reflection ブロック + dashboard.reflectionPending 追加**

### テスト結果
- 263スイート / 1836テスト全通過（+11スイート / +80テスト程度追加）
- lint: 21 errors（全て pre-existing display-name / unescaped-entities、新規 reflection ファイルからのエラーは 0）

### 未完了タスク・次回やるべきこと
- オンボーディング完了時に `scheduleDailyReminder(notifyTime)` が呼ばれているか未確認（現在は settings 変更時のみ）→ 要調査
- elapsed テキストの「据え置き」表示は未実装（celebration 演出に集中）
- ReflectionStepComplete に QUITTR 風「他の人の気分統計」は未実装（コミュニティ API 無）
- 実機で通知→シート起動→ストリーク演出の end-to-end 検証を推奨
- 未コミット状態

### 注意事項
- **jest.setup.js の global expo-notifications mock**: 新規テストで response を返したい場合は `jest.mock('expo-notifications', ...)` で上書き
- **checkinForm.* locale ブロックは削除しない**: checkinValidator.ts / usePurchase.ts がまだ参照
- **DailyCheckin スキーマ互換**: 新フローは stressLevel=3 / qualityOfLife=3 / memo='' を埋める
- **ホーム画面の背景色は変更していない**（ルール遵守）

### 変更したファイル一覧（主要）
新規:
- `components/reflection/ReflectionSheet.tsx`, `ReflectionStepContainer.tsx`, `ReflectionStepRelapse.tsx`, `ReflectionStepUrge.tsx`, `ReflectionStepComplete.tsx` + 各テスト
- `hooks/reflection/useReflectionSheet.ts`, `useReflectionTrigger.ts` + 各テスト
- `stores/reflectionStore.ts` + テスト

変更:
- `app/(tabs)/index.tsx` — ReflectionSheet マウント + useReflectionTrigger + todayReflectionCompleted
- `components/dashboard/QuickActionGrid.tsx` — qa-checkin → openReflection
- `components/dashboard/SegmentedStreakCard.tsx` — todayReflectionCompleted prop + celebration haptic
- `hooks/useAppInitialization.ts` — loadReflectionState
- `lib/notifications/notificationClient.ts` — data payload
- `app/_layout.tsx` — Stack.Screen checkin 削除
- `lib/routing/routes.ts` — ROUTES.checkin(Complete) 削除
- `jest.setup.js` — expo-notifications global mock
- `locales/ja.ts`, `locales/en.ts` — reflection + reflectionPending

削除:
- `app/checkin/index.tsx`, `complete.tsx`, __tests__/*
- `components/checkin/BinaryQuestion.tsx`, `LevelSelector.tsx`, `MemoInput.tsx`, LevelSelector.test
- `hooks/checkin/useCheckinForm.ts`, `useCheckinSubmit.ts`
