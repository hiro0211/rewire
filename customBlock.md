 Android 版カスタムブロック実装計画（路線 B 確定版）                          
                                                                              
 Context（なぜこの変更が必要か）                                              
                                                                              
 Rewire iOS 版では Screen Time API の Web Content Filter                      
 で全ブラウザ横断のドメインブロック + カスタム Shield + /panic                
 画面ディープリンクの UX が完成している（2026-04-19 実装）。                  
                                                                              
 Android 版でも同等体験を提供したいが、Android には単一の公式 API             
 がないため、方式選定リサーチを実施。hiro の制約（個人開発者アカウント / iOS  
 同等 UX 必須 / Play Store 配布必須）を踏まえ、以下の 路線 B                  
 を採用決定（2026-04-23）。

 ▎ 路線 B: Accessibility Service + Overlay + 独自 WebView ブラウザ

 VpnService（ハイブリッド）は Google Play の Organization
 要件で個人アカウント不可のため断念。Private DNS 誘導は iOS 同等 UX
 を満たせないため対象外。

 ---
 方針サマリ

 二層防御:

 1. AccessibilityService（全ブラウザ監視層） — Chrome/Firefox/Brave/Samsung
 Internet 等が開かれた瞬間に URL バーの AccessibilityNodeInfo
 を読み取り、ブロック対象ドメインなら TYPE_ACCESSIBILITY_OVERLAY で Rewire
 ブランドのカスタムブロックページをかぶせる → ローカル通知発火 → タップで
 /panic 遷移（iOS の既存パイプライン hooks/useNotificationDeepLink.ts
 を再利用）
 2. 独自 WebView ブラウザ「Rewire Browser」（推奨経路層） —
 react-native-webview ベースの内蔵ブラウザを提供し、オンボーディングでデフォ
 ルトブラウザ化を誘導。URL フィルタは shouldOverrideUrlLoading
 で完全制御、ブロック時はアプリ内でそのまま Panic 画面に遷移

 Play Store 審査対策:
 - isAccessibilityTool="false" とし、Accessibility Service
 宣言フォームで「依存症回復を目的としたアダルトコンテンツブロック」として明示
 - ユーザーが自発的に機能を有効化する設計にする（自律アクションを避ける）
 - 独自ブラウザは AppBlock 的な強制ロックを一切行わない（通知誘導のみ）

 ---
 アーキテクチャ（既存資産の再利用）

 既存 iOS 実装と共通化する層

 層: 通知 → /panic 遷移
 再利用するファイル: hooks/useNotificationDeepLink.ts
 役割: iOS の ShieldAction と同じ経路で起動
 ────────────────────────────────────────
 層: ブロック対象ドメイン
 再利用するファイル: 既存 iOS
   側の定義を共通化（現在はネイティブに埋まっている）
 役割: lib/contentFilter/blockedDomains.ts に切り出して両 OS で共有
 ────────────────────────────────────────
 層: セットアップ UI の骨格
 再利用するファイル: app/screen-time-setup.tsx +
   components/screen-time/ScreenTimeSetupIntro.tsx
 役割: Android では Accessibility 権限 & デフォルトブラウザ誘導用の画面を
   Platform.OS 分岐で差し替え
 ────────────────────────────────────────
 層: 状態 Hook
 再利用するファイル: hooks/settings/useScreenTimeStatus.ts /
   hooks/screenTime/useScreenTimeSetup.ts
 役割: lib/contentFilter/ にプラットフォーム抽象を置き、Hook は共通
 ────────────────────────────────────────
 層: Brand Config / テーマ
 再利用するファイル: constants/colorPalettes.ts / constants/theme.ts
 役割: Overlay の UI に流用

 Android 新規レイヤー

 ファイル / モジュール: modules/expo-content-filter-android/
 役割: Expo Modules API で作る Kotlin
   ネイティブモジュール。startAccessibilityService() /
   stopAccessibilityService() / getAccessibilityStatus() /
   openAccessibilitySettings()
 ────────────────────────────────────────
 ファイル / モジュール: modules/expo-content-filter-android/android/src/main/
 java/.../RewireAccessibilityService.kt
 役割: AccessibilityService 本体。ブラウザパッケージ監視 + URL ノード取得 +
   Overlay 発火 + 通知発火
 ────────────────────────────────────────
 ファイル / モジュール: modules/expo-content-filter-android/android/src/main/
 java/.../BlockOverlayManager.kt
 役割: WindowManager で TYPE_ACCESSIBILITY_OVERLAY を attach/detach
 ────────────────────────────────────────
 ファイル / モジュール: modules/expo-content-filter-android/android/src/main/
 res/layout/block_overlay.xml
 役割: Rewire ブランドの Overlay レイアウト（タイトル、説明、「Panic
   を開く」CTA、閉じるボタン）
 ────────────────────────────────────────
 ファイル / モジュール: plugins/withContentFilterAndroid.js
 役割: Expo Config Plugin。AndroidManifest.xml に Service + permission +
   accessibility_service_config.xml を追記
 ────────────────────────────────────────
 ファイル / モジュール: app/rewire-browser.tsx
 役割: 独自 WebView ブラウザ画面（新規ルート）
 ────────────────────────────────────────
 ファイル / モジュール: components/rewire-browser/
 役割: BrowserTopBar.tsx / UrlBar.tsx / BlockPage.tsx
 ────────────────────────────────────────
 ファイル / モジュール: lib/contentFilter/
 役割: プラットフォーム抽象（index.ts が .ios.ts / .android.ts に分岐）
 ────────────────────────────────────────
 ファイル / モジュール: lib/contentFilter/blockedDomains.ts
 役割: ドメインリストを iOS/Android 共通管理
 ────────────────────────────────────────
 ファイル / モジュール: hooks/rewireBrowser/useBrowserFilter.ts
 役割: URL フィルタリングロジック（純粋関数）

 名前の整理（既存との整合）

 iOS 側は modules/expo-screen-time/ / lib/screenTime/ だが、Android では
 Screen Time という名称は不適切（Android には別の Screen Time
 概念がある）。contentFilter という抽象名で OS 共通の公開 API を新設 し、iOS
 側の既存 screenTime は内部実装として残す。

 - 公開 Hook: useContentFilterSetup() / useContentFilterStatus()
 - 内部実装: iOS は screenTimeBridge.ts に委譲、Android は
 contentFilterBridge.android.ts

 これにより UI コンポーネント（ScreenTimeSetupIntro.tsx など）は
 content-filter-setup-intro にリネームし、Platform.OS で権限案内文言を切替。

 ---
 実装ステップ（TDD 厳守）

 CLAUDE.md 第 2 章のルール通り Red → Green → Refactor で進める。1 PR = 1 機能
  の単位。

 PR 1: ドメインリストと Content Filter 抽象層

 1. lib/contentFilter/blockedDomains.ts に iOS 側の現行ドメインを切り出し +
 テスト
 2. lib/contentFilter/contentFilterTypes.ts 型定義 + テスト
 3. lib/contentFilter/contentFilterBridge.ts（OS 抽象、iOS は既存
 screenTimeBridge へ委譲）+ テスト
 4. 既存 iOS 側（app/screen-time-setup.tsx / hooks/screenTime/* / hooks/setti
 ngs/useScreenTimeStatus.ts）を抽象層経由に書き換え（挙動不変のリファクタ）

 PR 2: Android ネイティブモジュールの骨組み（権限確認のみ）

 1. modules/expo-content-filter-android/ を Expo Modules API で生成
 2. Kotlin 側で getAccessibilityStatus() / openAccessibilitySettings()
 のみ実装
 3. JS 側 lib/contentFilter/contentFilterBridge.android.ts で公開
 4. Jest テスト（モック）

 PR 3: AccessibilityService 本体 + Overlay

 1. RewireAccessibilityService.kt を TDD で段階実装:
   - ブラウザパッケージ監視（Chrome/Firefox/Brave/Samsung Internet/Edge
 のパッケージ名リスト）
   - URL バーの AccessibilityNodeInfo 探索ロジック（ブラウザごとのパッケージ
 ID 分岐）
   - ブロックドメイン一致判定
 2. BlockOverlayManager.kt で Overlay attach/detach
 3. block_overlay.xml Rewire ブランドの UI
 4. Overlay の「Panic を開く」CTA でローカル通知 {route: "/panic"} を発火
 5. plugins/withContentFilterAndroid.js で Manifest 登録
 6. Android 13+ Restricted Settings 対応のオンボーディング導線
 7. 統合テスト（Espresso は後続 PR、まずは Jest + モックで純粋関数部分）

 PR 4: Android 用オンボーディング画面

 1. app/screen-time-setup.tsx を app/content-filter-setup.tsx にリネーム（iOS
  も追従）
 2. Platform.OS === 'android' 分岐で Accessibility 権限付与フロー UI 追加
 3. useContentFilterSetup() hook を Android 用に拡張
 4. components/content-filter/ContentFilterSetupIntro.tsx に Android
 用文言（ja.ts / en.ts 追加）
 5. settings.tsx の Screen Time ステータスセクションも両 OS 対応に書き換え

 PR 5: 独自 WebView ブラウザ「Rewire Browser」

 1. app/rewire-browser.tsx 新規画面（react-native-webview）
 2. hooks/rewireBrowser/useBrowserFilter.ts URL フィルタ純粋関数 + テスト
 3. components/rewire-browser/UrlBar.tsx / BrowserTopBar.tsx / BlockPage.tsx
 4. shouldOverrideUrlLoading でブロック時に BlockPage 表示 + /panic 遷移 CTA
 5. ブロック済みドメインは lib/contentFilter/blockedDomains.ts を共有
 6. オンボーディングから「Rewire ブラウザをデフォルトに設定」導線（Android の
  ACTION_MANAGE_DEFAULT_BROWSER_SETTINGS を開く）

 PR 6: 通知 → /panic パイプラインの Android 疎通確認

 1. hooks/useNotificationDeepLink.ts は iOS と共通のため変更不要
 2. Accessibility Service から送る通知の payload 形式を iOS と統一（{route:
 "/panic"}）
 3. Android 実機で Chrome / Firefox / Brave で動作確認

 PR 7: Play Store 宣言フォーム準備（コードではなく資料）

 1. Accessibility 宣言フォームの回答テキストをドキュメント化（docs/play-store
 -declarations.md）
 2. プライバシーポリシー更新（Accessibility データの扱い明記）
 3. スクリーンショット・動画収録（ストア掲載用）

 ---
 Critical Files（触るファイル一覧）

 新規

 - modules/expo-content-filter-android/ 一式
 - plugins/withContentFilterAndroid.js
 - app/rewire-browser.tsx
 - components/rewire-browser/BrowserTopBar.tsx
 - components/rewire-browser/UrlBar.tsx
 - components/rewire-browser/BlockPage.tsx
 - lib/contentFilter/index.ts
 - lib/contentFilter/blockedDomains.ts
 - lib/contentFilter/contentFilterTypes.ts
 - lib/contentFilter/contentFilterBridge.ts
 - lib/contentFilter/contentFilterBridge.ios.ts
 - lib/contentFilter/contentFilterBridge.android.ts
 - hooks/rewireBrowser/useBrowserFilter.ts
 - docs/play-store-declarations.md

 変更

 - app.config.ts — Android 用プラグイン登録
 - app/screen-time-setup.tsx → app/content-filter-setup.tsx（リネーム +
 Android 分岐）
 - components/screen-time/ → components/content-filter/（リネーム）
 - hooks/screenTime/useScreenTimeSetup.ts →
 hooks/contentFilter/useContentFilterSetup.ts
 - hooks/settings/useScreenTimeStatus.ts →
 hooks/settings/useContentFilterStatus.ts
 - lib/screenTime/screenTimeBridge.ts —
 lib/contentFilter/contentFilterBridge.ios.ts
 から委譲される内部実装として残す
 - app/(tabs)/settings.tsx — ステータスセクションを両 OS 対応へ
 - locales/ja.ts / locales/en.ts — Android 権限案内文言追加
 - hooks/useNotificationDeepLink.ts — 変更なし（iOS と共通パイプ）

 ---
 既知のリスクと緩和策

 リスク: ブラウザの UI 構造変更で URL 取得破綻
 緩和策: パッケージごとのセレクタ戦略をテーブル駆動化し、壊れたら個別パッチ。
 開発者向けの診断画面でノードダンプを取得できるようにする
 ────────────────────────────────────────
 リスク: Chrome シークレットモードで URL が取れない
 緩和策: Overlay は URL 取得成功時のみ。取れない場合は「Rewire
   ブラウザを使う」通知のみ送る妥協
 ────────────────────────────────────────
 リスク: Play Store Accessibility 審査リジェクト
 緩和策: 宣言フォームに「依存症回復者保護」目的を明記、動画でユーザー意思に基
 づく有効化を証明、プライバシーポリシーを整備
 ────────────────────────────────────────
 リスク: Android 13+ Restricted Settings
 緩和策: オンボーディングで「設定 → アプリ → Rewire → Restricted Settings
   許可」の動画つき案内
 ────────────────────────────────────────
 リスク: ユーザーが他ブラウザに回避
 緩和策: Accessibility はブラウザ問わず動くので Overlay
   は出る。シークレットモードのみ抜け穴（既知リスクとして受容）

 ---
 Verification（動作確認）

 単体テスト（各 PR）

 - npm test（Jest） — カバレッジ 80% 以上を維持（CLAUDE.md ルール）
 - 新規純粋関数は 100% カバレッジ

 実機テスト（PR 3 以降）

 - Android 13 / 14 / 15 の実機または emulator で Chrome / Firefox / Brave /
 Samsung Internet / Edge で動作確認
 - ブロックドメインアクセス → Overlay 表示 → 通知 → タップ → /panic 遷移の
 E2E フロー

 Play Store 審査用素材（PR 7）

 - Internal Testing トラックにアップロード
 - Accessibility 宣言フォーム提出
 - 5-7 日の審査待ち後、Production へ昇格

 既存 iOS 機能のリグレッション確認

 - lib/contentFilter/ 抽象化後、iOS 側の既存 Screen Time
 フローが無傷であることを実機確認（Shield → 通知 → /panic）