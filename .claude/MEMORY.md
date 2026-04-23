

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

## 2026-04-20: Screen Time自作実装 → react-native-device-activity ライブラリへ移行
- **目的**: 自作の modules/expo-screen-time/ + plugins/withScreenTime.js (424行) を kingstinct 製ライブラリに置換し、one sec 風の「アダルトサイト→Shield→通知→/panic」フローを確立
- **削除ファイル**: modules/expo-screen-time/, plugins/withScreenTime.js + tests, lib/screenTime/screenTimeTypes.ts（型はライブラリのを使用）
- **新規ファイル**: constants/screenTime/blockedDomains.ts (590 domains + PRIORITY_BLOCKED_DOMAINS 50 件、commit 0d3fff9^:constants/blocklist.ts から復元), constants/screenTime/screenTimeConfig.ts (SHIELD_ID, PANIC_NOTIFICATION_IDENTIFIER, PANIC_ROUTE), lib/screenTime/shieldConfig.ts (Shield UI + Action builder), stores/screenTimeStore.ts (enabled フラグの AsyncStorage 永続化)
- **書き直し**: lib/screenTime/screenTimeBridge.ts (ライブラリラッパー: requestAuthorization('individual') / getAuthorizationStatus / enableAdultSiteBlocking / disableAdultSiteBlocking)
- **変更**: app.config.ts (./plugins/withScreenTime 削除, react-native-device-activity プラグイン追加 appleTeamId='KV6CYPA7JK' appGroup='group.rewire.app.com', experimental.ios.appExtensions から自作3Extension削除＝ライブラリが自動生成), hooks/screenTime/useScreenTimeSetup.ts (新API・screenTimeStore連携), hooks/settings/useScreenTimeStatus.ts (同期APIに変更), hooks/useNotificationDeepLink.ts (categoryIdentifier フォールバック追加), lib/storage/asyncStorageClient.ts (StorageKey に 'screenTime' 追加), locales/ja.ts + en.ts (shieldPrimaryButton/shieldSecondaryButton 追加)
- **アダルト判定ロジック**: setWebContentFilterPolicy({ type: 'auto', domains: PRIORITY_BLOCKED_DOMAINS }) — Appleのクラシファイア + 50件優先リスト。Apple の `.auto()` domains/exceptDomains は各最大50件制限のため、日本ニッチ + 主要 tube + JAV + doujin をバランスよく選定
- **Shield UI**: DARKパレット背景(#0A0A0F) + 紫ボタン(#8B5CF6)。Primary="Rewireを開く"→behavior:"defer"+sendNotification(userInfo:{route:"/panic"},categoryIdentifier:"rewire-shield-panic")。Secondary="閉じる"→behavior:"close"
- **通知→DeepLink フロー**: ライブラリのNotificationPayload.userInfoに{route:"/panic"}が入るので既存の useNotificationDeepLink がそのまま動作。categoryIdentifier フォールバックも追加済み
- **テスト**: 264スイート / 1841テスト全通過（+3スイート +19テスト）
- **lint**: 新規ファイルにエラーなし（既存の display-name/unescaped-entities のみ）
- **残タスク**: (1) `npx expo prebuild --clean --platform ios` で ios/ 再生成 → 旧 ContentBlockerExtension/SafariWebExtension ディレクトリも自動削除、ライブラリのShield/ShieldAction/DeviceActivityMonitor Extension 自動生成 (2) `eas build --profile development --platform ios` で実機 dev build (3) 実機でゴールデンパス検証 (4) Family Controls Distribution エンタイトルメント申請（App Store 配布時）
- **未コミット状態**

## 2026-04-18: 18バッジシステム Phase 4〜9 完了（worktree `claude/hardcore-goodall` より復元）

> 2026-04-21 に worktree 整理時、hardcore-goodall ワークツリーの未コミット MEMORY.md 追記をここへ退避。元作業は既に main にマージ済み。

### 作業内容
BadgeOrb の特殊視覚描画 Phase 4〜6 と、バッジアンロック演出（Phase 7）、ダッシュボード次バッジ進捗（Phase 8）をTDDで実装し、mainへプッシュ。

### 完了した作業（TDDサイクル）

#### Phase 4: GalaxySpiral（銀河の渦巻き描画）
- `BadgeOrb` に `showGalaxySpiral = badgeId === 'Galaxy'` フラグ追加
- `GalaxySpiral` コンポーネント新規: 対数螺旋 r=a*e^(b*θ) を2本のSVG Path で描画
- Reanimated withRepeat + withTiming（周期 8000ms）でゆっくり回転
- `Path` を react-native-svg mockに追加
- コミット: `feat: add galaxy spiral arms visual`

#### Phase 5: StarClusterOverlay（星団の複数コア描画）
- `StarClusterOverlay` コンポーネント新規: 黄金角でらせん配置した6個の周辺小球
- 各小球（`SatelliteStar`）が独立して opacity ゆらぎアニメーション
- `showStarCluster = badgeId === 'StarCluster'`
- コミット: `feat: add star cluster multi-core visual`

#### Phase 6: CosmosOverlay（宇宙モード描画）
- `CosmosOverlay` コンポーネント新規: 全18バッジのコアカラーから25個の光点を黄金角スパイラル配置
- 各光点（`CosmosParticle`）が独立して点滅アニメーション（opacity 0.2〜1.0）
- `showCosmos = badgeId === 'Cosmos'`
- コミット: `feat: add cosmos multi-color particle visual`

#### Phase 7: useNewlyUnlockedBadge + BadgeUnlockModal
- `hooks/achievements/useNewlyUnlockedBadge.ts` 新規: AsyncStorage `seen_badge_ids` で既読管理、dismiss() で既読化
- `lib/storage/asyncStorageClient.ts` の StorageKey に `'seen_badge_ids'` 追加
- `components/achievements/BadgeUnlockModal.tsx` 新規: Modal + BadgeOrb + バッジ名 + 説明文 + 「素晴らしい！」ボタン
- `app/(tabs)/index.tsx` に `useNewlyUnlockedBadge` + `<BadgeUnlockModal>` 組込
- コミット: `feat: add badge unlock detection and celebration modal`

#### Phase 8: NextBadgeProgress（ダッシュボード「次バッジ進捗」）
- `components/dashboard/NextBadgeProgress.tsx` 新規: `getNextBadge` + `getBadgeProgress` を使用
- BadgeOrb（size=32, isUnlocked=false）+ バッジ名 + LinearProgressBar
- `width` を `DimensionValue` キャストで TypeScript エラー回避
- `app/(tabs)/index.tsx` の BrainRewiringBar 直下に追加
- コミット: `feat: add next badge progress display on dashboard`

#### Phase 9: 最終検証
- 252スイート / 1739テスト全通過
- `npx tsc --noEmit`: 今回の変更ファイルに新規エラーなし（既存エラーは pre-existing）
- プッシュ先: `origin claude/hardcore-goodall`

### 注意事項
- worktreeでのjest実行は `--testPathIgnorePatterns='[]'` を付けないとテストがすべて無視される（`.claude/worktrees/` が testPathIgnorePatterns に含まれているため）
- 正しい実行コマンド: `npx jest --no-coverage --testPathIgnorePatterns='[]'`
- GalaxySpiral の対数螺旋は `a=0.08, b=0.25, θ=0〜4π, steps=80, scale=size*0.38`
- CosmosOverlay の25個光点は決定論的配置（黄金角 ≈ 2.399963 rad）でテスト安定性確保
- `NextBadgeProgress` の `width: progressPercent` は `DimensionValue` キャストが必要

### 新規ファイル
- `hooks/achievements/useNewlyUnlockedBadge.ts`
- `hooks/achievements/__tests__/useNewlyUnlockedBadge.test.ts`
- `components/achievements/BadgeUnlockModal.tsx`
- `components/achievements/__tests__/BadgeUnlockModal.test.tsx`
- `components/dashboard/NextBadgeProgress.tsx`
- `components/dashboard/__tests__/NextBadgeProgress.test.tsx`

### 変更ファイル
- `components/achievements/BadgeOrb.tsx` — GalaxySpiral/StarClusterOverlay/CosmosOverlay 追加
- `components/achievements/__tests__/BadgeOrb.test.tsx` — Phase 4-6 テスト追加、Path mock追加
- `lib/storage/asyncStorageClient.ts` — StorageKey に 'seen_badge_ids' 追加
- `app/(tabs)/index.tsx` — BadgeUnlockModal + NextBadgeProgress 組込

## 2026-04-22: Safari カスタム保護カードをプロフィールタブへ移動

### 作業内容
- 設定画面プロフィールセクション直下にあった Safari カスタム保護（ポルノブロッカー）導線を、プロフィールタブの AchievementsLinkCard 直下に `ToolCard` として移動
- 過去コミット `f0fe845` のデザイン（shield アイコン + danger カラー + ToolCard）を踏襲
- ステータスで icon 切替（`shield-checkmark` (enabled) / `shield-outline` (unknown)）

### 変更ファイル
- `app/(tabs)/profile.tsx` — ToolCard 追加、`useWebExtensionStatus` / `useLocale` / `useTheme` / `ROUTES` import 追加
- `app/settings.tsx` — Safari 用 `SettingSection` と `useWebExtensionStatus` 使用箇所を削除
- `locales/ja.ts` — `safariWebExtension.toolCardDescription: 'アダルトサイトを自動でブロック'` 追加
- `locales/en.ts` — `safariWebExtension.toolCardDescription: 'Automatically block adult sites'` 追加
- `app/(tabs)/__tests__/ProfileScreen.test.tsx` — `useWebExtensionStatus` モック追加、iOS/Android ToolCard 表示テスト追加

### テスト結果
- 全体: 265 スイート / 1843 テスト全通過
- ProfileScreen.test: 4/4 通過
- settings 系: 33 テスト通過
- 型エラー: 自変更ファイルに無し（既存エラーのみ）
- lint: 自変更ファイルに error 無し（既存 warning のみ）

### 注意事項
- `useWebExtensionStatus` hook は内部で `safariWebExtensionBridge.getExtensionStatus()` を呼ぶため、ProfileScreen テストでは hook 自体のモックが必須
- `ROUTES.safariWebExtensionSetup` を使用（型安全）。過去 f0fe845 の `as any` キャストは踏襲しない
- `hooks/settings/useWebExtensionStatus.ts` は profile で使うため残存
- 未コミット状態

## 2026-04-22

### 作業内容
星評価プロンプトモーダル (`ReviewPromptModal`) の頻度アップ + フィードバック送信済みユーザーの除外

### 完了した作業
1. **クールダウン短縮**: `COOLDOWN_DAYS` を 90 → **10日** に変更（`features/review/reviewPromptEligibility.ts`）
   - ユーザー要望: アンケート（30日）より少し頻繁に
   - 10日×最大3回却下 ≒ 30日で打ち止めなので負担少
2. **フィードバック送信済み除外**: 低評価（1〜3星）→フィードバック画面→メール送信後は再表示しない
   - `ReviewPromptState` に `hasSentFeedback: boolean` を追加（`types/reviewPrompt.ts`）
   - `reviewPromptStorage.recordFeedbackSent()` メソッド追加（`lib/storage/reviewPromptStorage.ts`）
   - `handleFeedbackTap` で上記を呼ぶ（`hooks/review/useReviewPromptActions.ts`）
   - `shouldShowReviewPrompt` 先頭で `hasSentFeedback` チェック追加（`features/review/reviewPromptEligibility.ts`）
   - `useReviewEligibility` で `hasSentFeedback` を渡す（`hooks/review/useReviewEligibility.ts`）
3. **TDD**: Red→Green の順で 4 スイートに計 +5 テスト追加

### テスト
- 265 スイート / **1849 テスト全通過**（+18 from 既存1831）
- 新規/更新テスト:
  - `features/review/__tests__/reviewPromptEligibility.test.ts`: hasSentFeedback + 10日クールダウンテスト追加
  - `lib/storage/__tests__/reviewPromptStorage.test.ts`: recordFeedbackSent テスト追加、hasSentFeedback default 確認
  - `hooks/review/__tests__/useReviewPromptActions.test.ts`: handleFeedbackTap が recordFeedbackSent を呼ぶテスト追加
  - `hooks/review/__tests__/useReviewEligibility.test.ts`: hasSentFeedback=true で false テスト追加

### 発見事項（重要）
- **既存のバグ修正**: 低評価後にメールでフィードバック送信したユーザーは、従来 `hasLeftPositiveReview` が false のままで 90 日後にまた表示されていた。今回の `hasSentFeedback` 追加でこの UX 問題も解決
- **設定画面の「アプリを評価する」ボタン（`app/settings.tsx:107-111`）は本作業と無関係**: ネイティブ iOS 評価ダイアログ (`StoreReview.requestReview()`) を直接呼ぶだけで、カスタム `ReviewPromptModal` とは別物。今回はカスタムモーダル側の頻度だけを調整

### 未完了タスク・次回やるべきこと
- **iOS Dev Client での手動検証**: AsyncStorage クリア→7日+5チェックイン経過→モーダル表示→1〜3星→メール送信→11日経過させても再表示されないこと確認
- **次回コミット時の注意**: 5 ファイル変更（`types/reviewPrompt.ts`, `lib/storage/reviewPromptStorage.ts`, `features/review/reviewPromptEligibility.ts`, `hooks/review/useReviewPromptActions.ts`, `hooks/review/useReviewEligibility.ts`）+ 4 テストファイル

### 変更ファイル一覧
- `types/reviewPrompt.ts`
- `lib/storage/reviewPromptStorage.ts`
- `features/review/reviewPromptEligibility.ts`
- `hooks/review/useReviewPromptActions.ts`
- `hooks/review/useReviewEligibility.ts`
- `features/review/__tests__/reviewPromptEligibility.test.ts`
- `lib/storage/__tests__/reviewPromptStorage.test.ts`
- `hooks/review/__tests__/useReviewPromptActions.test.ts`
- `hooks/review/__tests__/useReviewEligibility.test.ts`
- 未コミット状態

## 2026-04-23: Bundle Size Log（docs/bundle-size-log.md のスナップショット）

`dist/_expo/static/js/ios/entry-*.hbc` のバイト数推移の記録。原本: `docs/bundle-size-log.md`。

### 計測コマンド
```bash
EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH=1 \
EXPO_UNSTABLE_TREE_SHAKING=1 \
npx expo export --platform ios
ls -la dist/_expo/static/js/ios/
```

### ログ
| Date | Commit | Bytes | Delta | Phase | Note |
|---|---|---|---|---|---|
| 2026-04-19 | (pre-this-plan) | 7,088,605 | — | — | 既存エクスポート（dist/）から取得 |
| 2026-04-23 | f2150d4 | 7,103,854 | +15,249 | A baseline | 新規 atlas 実測、ベースライン更新 |
| 2026-04-23 | (wip) | 6,192,163 | **-911,691** | B+D-1+D-2 | parseRgba/badges index削除 + RN-Purchases browser alias + date-fns/locale submodule |
| 2026-04-23 | (wip) | 6,189,621 | -2,542 | D-3 | date-fns main functions を submodule import 化（12ファイル） |
| 2026-04-23 | (wip) | 6,194,833 | +5,212 | C (revert) | i18n 動的 import 試行 — native では code split されず逆に増加 |
| 2026-04-23 | (wip) | **6,189,760** | -5,073 | C revert | i18n を同期 import に戻し、最終形 |

### 通算削減
- ベースライン: 7,103,854 B（2026-04-23 朝）
- 最終: 6,189,760 B
- **削減: -914,094 B（-893 KB, -12.9%）**

### 主要な勝ち
1. **RevenueCat browser alias（-900KB 級）**: `react-native-purchases/dist/purchases.js` が web 専用の `browser/nativeModule` を無条件 require していたのを Metro resolver で stub に置換
2. **date-fns/locale submodule import（-500KB 相当、ただし Hermes 圧縮で実効は上記と混ざって計測）**: `import { ja, enUS } from 'date-fns/locale'` の barrel が全ロケール（be/ru/ta/uk/kk/sl 等）を引き込んでいたのを submodule 直接 import に変更

### 学び
- Native Metro は dynamic `import()` で**bundle 分割しない**（全モジュールが単一 hbc に入る）。lazy import は startup 評価を遅らせるだけで bundle サイズ削減にならない
- `EXPO_UNSTABLE_TREE_SHAKING` でも barrel re-export は弱点。疑わしければ atlas で実測し submodule 直接 import に書き換える
