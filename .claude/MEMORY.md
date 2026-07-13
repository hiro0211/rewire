

## 2026-06-03: App Store Guideline 1.1 リジェクト対応（英語メタデータ "porn" 排除）

### 概要
v2.2(2) が 2026-06-03 に **Guideline 1.1 (Safety - Objectionable Content)** でリジェクト。マーケティング/メタデータ（screenshots, description, subtitle, keywords）が "porn" を多数参照していたため。※ 価格 3.1.2(c) は前ビルド(c6767f1)で解決済み＝今回は再発していない。

### 方針（hiro 承認）
- **英語(US)ロケールのみ**修正（日本語プライマリは据え置き）
- 臨床用語 `adult content / adult sites / explicit content` は**残す**、`porn / nofap / quit porn / porn blocker` は**削除**
- 年齢制限 13+ 維持

### Claude in Chrome で ASC を直接編集・保存済み（未提出）
- **Subtitle (App情報/EN)**: `Quit porn, rewire your brain` → `Quit the habit, reboot focus`
- **Keywords (v2.2/EN)**: `nofap,quit porn,porn blocker,...` → `reboot,dopamine detox,self control,streak,recovery,abstinence,urge,blocker,addiction,willpower`
- **Description (v2.2/EN)**: ライブ版の "porn" 3箇所のみ surgical 置換（"adult sites" 等は維持）
  1. `Porn hijacks the brain's reward system` → `Explicit content hijacks...`
  2. `drive that porn quietly drains` → `drive that the habit quietly drains`
  3. `— Built-In Porn Blocker` → `— Built-In Content Blocker`
- **Promotional Text (v2.2/EN)**: ライブ版は既にクリーン（"a built-in Safari blocker"）→ 変更不要

### ★ 未完了タスク（hiro 実施）
1. **英語スクショ差し替え（全サイズ）**: スクショに `Quit Porn with Rewire` / `Block Porn in Safari` / `Quit porn…` が写っており **1.1 の主因**。テキスト修正だけでは通らない。差し替えキャプション案は `docs/AppStoreConnect/appInfo.en.md` に記載
2. 新スクショUP後、Resolution Center に返信文（appInfo.en.md に英文ドラフト）投稿 → **「審査内容を更新」で再提出**（最終ボタンは hiro）

### 注意点・残リスク
- 日本語スクショ（「ポルノをやめる」「ポルノを見る前に止める」）は据え置き＝Apple が日本語側を理由に再リジェクトする可能性は残る（第2弾で対応）
- ASC のテキスト欄は read_page/get_page_text で値取得不可 → textarea リサイズ+ズーム読取り+ダブルクリック単語選択で surgical 編集した

### 変更ファイル
- `docs/AppStoreConnect/appInfo.en.md`（1.1 対応セクション+スクショ差し替え案+Apple返信文を追記）
- ASC 側: Rewire / 英語(US) の Subtitle・Keywords・Description（コミット対象外）

---

## 2026-06-02: Family Controls による他ブラウザApp Shield 統合（案2 + 案A 単一トグル）

### 概要
Safariの既存 Web Extension /panic フローを**完全無傷**で維持しつつ、Family Controls (Distribution) を使って Chrome / Firefox / Brave / Edge 等の非Safariブラウザアプリ全体を Shield。Shield UI のプライマリボタンタップで /panic 通知発射→アプリ起動→既存 useNotificationDeepLink で /panic 画面表示。UI は信頼第一哲学に基づく**単一トグル（確認ダイアログ無し）**（案A）。

### アーキテクチャ決定
- **react-native-device-activity@^0.6.1** 採用（自前 expo-screen-time モジュール構築は数週間追加作業のため不採用）
- `@kingstinct/expo-apple-targets` 経由で3つの Extension target を自動生成: ShieldConfiguration / ShieldAction / ActivityMonitorExtension
- App Shield: `blockSelection({activitySelectionId})` / `unblockSelection({activitySelectionId})`、`setFamilyActivitySelectionId({id, familyActivitySelection})` で App Group UserDefaults に永続化
- Shield UI ブランディング: `updateShield(config, actions)` で UserDefaults 経由（Extensionが読み取り）
- Shield Action: `sendNotification` で `categoryIdentifier: 'rewire-shield-panic'` + `userInfo.route: '/panic'` 発射

### 新規ファイル
- `lib/screenTime/screenTimeBridge.ts`(+16テスト) — requestAuth / getStatus / persistSelection / getStoredSelection / applyAppShield / clearAppShield / isShieldActive
- `lib/screenTime/shieldConfig.ts`(dc36738復元) — buildRewireShieldConfig / buildShieldActions（紫BG/シアン強調/送通知）
- `stores/screenTimeStore.ts`(+8テスト) — enabled / selectionToken / selectionApplicationCount / lastShieldedAt / lastClearedAt + AsyncStorage永続化
- `hooks/screenTime/useScreenTimeSetup.ts`(+10テスト) — auth → picking → finalize（persist + applyShield + markShielded → completed）
- `hooks/settings/useScreenTimeStatus.ts`(dc36738復元) — 認可ステータス監視
- `components/screen-time/ScreenTimeSetupIntro.tsx`(dc36738復元)
- `components/screen-time/BrowserShieldToggleCard.tsx`(+6テスト) — **案A 単一トグル**: ON時 selectionToken なければ /screen-time-setup へ遷移、あれば即 applyAppShield。OFF時は確認なし即 clearAppShield（信頼第一）
- `app/screen-time-setup.tsx` — DeviceActivitySelectionSheetView を `step === 'picking'` 時に Overlay として mount。完了時 finalizePicker、キャンセル時 cancelPicker
- `targets/ShieldConfiguration/`, `targets/ShieldAction/`, `targets/ActivityMonitorExtension/`（dc36738復元、`react-native-device-activity/config-plugin/createExpoTargetConfig` 経由でターゲット自動生成）

### 変更ファイル
- `constants/screenTime/screenTimeConfig.ts` — `PANIC_NOTIFICATION_IDENTIFIER = 'rewire-shield-panic'`, `BROWSER_SELECTION_ID = 'rewire-browsers'` 追加
- `hooks/useNotificationDeepLink.ts`(+3テスト) — categoryIdentifier=rewire-shield-panic フォールバック分岐追加（data.route 優先、無ければ categoryIdentifier）
- `app.config.ts` — `['react-native-device-activity', { appleTeamId, appGroup }]` プラグイン登録
- `app/_layout.tsx` — `<Stack.Screen name="screen-time-setup" headerShown:false />` 追加
- `lib/routing/routes.ts` — `screenTimeSetup: route('/screen-time-setup')` 追加
- `app/(tabs)/profile.tsx` — `BrowserShieldToggleCard` を ScrollView 末尾に追加（Platform.OS==='ios' ガード）
- `locales/ja.ts` / `en.ts` — `screenTime` ブロック追加（title / intro / toggleTitle / targetCount / lastChangedAt / streakDays / changeTargets / shieldPrimaryButton 等14キー）

### テスト
- 新規43テスト全通過: bridge=16, store=8, hook=10, ToggleCard=6, NotificationDeepLink追加=3
- 全体: **297 suites / 2138 passed, 1 failed**（既存 `i18nQuality` の `postPurchaseOnboarding.demo.description` 改行差、本変更と無関係）
- lint: 新規ファイルでエラー追加ゼロ（4 warning は test mock パターン）

### iOS ビルド検証
- `npx expo prebuild --platform ios --clean` 成功
- `ios/Rewire/Rewire.entitlements` に `com.apple.developer.family-controls = true` 追加確認
- 3つの Extension entitlements にも family-controls + app-groups 設定確認
- `xcodebuild` Debug build (CODE_SIGNING_ALLOWED=NO): **BUILD SUCCEEDED**

### Family Controls エンタイトルメント
- ユーザー確認: 4つのBundle ID（rewire.app.com / .ShieldConfiguration / .ShieldAction / .DeviceActivityMonitor）すべて Apple 承認済み

### 動作フロー
- **Safari**: 既存 Web Extension の `document_start` interception → `sendNativeMessage` → 通知 → `data.route='/panic'` → useNotificationDeepLink → /panic（**完全無変更**）
- **Chrome/Firefox/Brave/Edge**: アプリ起動 → iOS が ManagedSettings.shield.applications に基づき Shield UI を被せる → ShieldConfigurationDataSource が UserDefaults から Rewire ブランド設定読み取り → ユーザー「Rewireを開く」タップ → ShieldAction → `sendNotification(categoryIdentifier='rewire-shield-panic', userInfo.route='/panic')` → useNotificationDeepLink が data.route で /panic 起動（categoryIdentifier フォールバックは defense-in-depth）

### UI 案A の哲学（CLAUDE.md セクション1+7 整合）
- iOS純正設定アプリ風の単一トグル。OFF→ON は1タップ、ON→OFF も**確認ダイアログ無し**で即解除可
- フリクション・タイマー・パートナー承認・コミットメント文章入力は意図的に**持たない**
- 抑止力は「初期セットアップの摩擦（認可 + Picker選択）」と「シールド画面の /panic 誘導」で確保
- ユーザー信頼第一、ダークパターン禁止の Rewire 哲学に最も合致

### 未完了 / 次回
- **実機検証が未実施**: Family Controls は iOS Simulator で動作不可。EAS Development Build → 物理デバイスで以下を検証要:
  - 認可ダイアログ → 許可 → FamilyActivityPicker → Chrome等を選択 → 「完了」→ 設定画面のトグル ON 表示
  - Chrome 起動 → Rewire ブランドの Shield UI 表示 → 「Rewireを開く」→ /panic 画面表示
  - Safari で missav.ai 等 → 既存 /panic 画面表示（現行フロー無傷確認）
- **post-purchase-onboarding** への screen-time-setup ステップ統合は未実施（オンボーディング離脱率配慮で Skip 可なオプションステップとして後追加可）
- 計画ファイル: `/Users/arimurahiroaki/.claude/plans/family-control-safari-safari-safari-safa-cuddly-codd.md`

### 重要な注意点
- 過去 2026-04 の Screen Time 統合は `.auto()` Web Filter ベースだったが Safari の /panic フローと干渉して revert
- 復元元コミット: `dc36738`（2026-04-21）— `git show dc36738:<path>` で取得
- react-native-device-activity v0.6.1 = npm の最新版（2026-06時点）。peer dep: expo>=52, react>=18.3, react-native>=0.76（SDK54で互換性OK）

## 2026-06-02 追加: quittr 風ハイブリッド化（案1 + 案2 + 大きなパワーボタンUI）

### 変更の動機
ユーザーから quittr の「Content Blocker」UI スクショ（巨大な赤いパワーボタン + Block Apps 行）を共有され、「トグルONだけでブロックできるようにできない？」と要望。当初の案2 (App Shield only) では:
- Chrome 全体がブロックされる（アダルトサイト「だけ」ではない）
- 初回 FamilyActivityPicker でユーザーが手動でアプリ選択必須
- ユーザーの元の要望「iOS純正の大人向けコンテンツ制限のような形」に最も近いのは案1 (`.auto()` Web Filter) だった

### 採用: 案3 ハイブリッド（quittr 同等）
- **`.auto()` Web Content Filter (案1)**: トグルONだけで全 WebKit ブラウザ (Safari/Chrome/Firefox/Brave) のアダルトサイトをURLレベルでブロック。**Picker不要**。`setWebContentFilterPolicy({type:'auto', domains: PRIORITY_BLOCKED_DOMAINS})` で Apple 自動分類 + 50ドメインの defense-in-depth
- **App Shield (案2)**: 任意でユーザーがFamilyActivityPicker から「Block Apps」を選ぶと、そのアプリ全体がシールド（Chrome全体不可など）。**選択無しでも `.auto()` だけで動作する**
- **Safari への影響**: `.auto()` が Safari にも適用されるため、Apple Filter が先取りする URL では既存 Web Extension の `/panic` フローが部分発火しない（trade-off）

### 変更ファイル
- `lib/screenTime/screenTimeBridge.ts`: applyAppShield(t, hasSelection=true) / clearAppShield(hasSelection=true) を導入。`setWebContentFilterPolicy/clearWebContentFilterPolicy` 呼び出し追加。hasSelection=false の時は blockSelection/unblockSelection スキップ（テスト18件全通過）
- `components/screen-time/ContentBlockerPanel.tsx`（新規, +7テスト）: quittr 風 UI。中央に **140px の円形パワーボタン**（OFF=赤 `#FF3B3B`、ON=緑 `#3DD68C`、グロー付き）。状態ラベル「ブロック中/ブロックOFF」+ 説明。下部に「Block Apps」行（選択数表示 + chevron）でPicker起動。連打防止の isBusy ステート
- `app/(tabs)/profile.tsx`: `BrowserShieldToggleCard` → `ContentBlockerPanel` に差し替え
- `locales/ja.ts` / `en.ts`: `contentBlocker` ブロック追加（heading/statusActive/statusInactive/descriptionActive/descriptionInactive/blockApps/blockAppsCount/blockAppsNone）

### 動作（ユーザー視点）
1. 初回起動 → パワーボタンタップ
2. 認可ダイアログ（初回のみ） → 許可
3. **即座にアダルトサイトが Safari / Chrome / Firefox / Brave 等で URLレベルでブロックされる**（Picker不要、`.auto()`のみ）
4. オプション: 「Block Apps」行タップ → /screen-time-setup → FamilyActivityPicker で Chrome 等を選択 → 完了 → 選択アプリ全体もシールド対象に
5. パワーボタン再タップで全解除

### Safari /panic フローへの影響（重要）
- `.auto()` を Safari に適用するため、Apple Filter が先に URL をブロックする場合 Web Extension の content_script が発火しない
- Apple 分類済みドメイン（pornhub.com 等大手）→ Apple のデフォルト「制限されました」画面（カスタム /panic 発火せず）
- Rewire の `ALL_BLOCKED_DOMAINS` には含まれるが Apple 分類されないニッチサイト → Web Extension で従来通り /panic 発火
- **ユーザーは元の要望「iOS純正のような大人向け制限」を希望したため、この trade-off は許容範囲**

### テスト結果
- 新規 7 テスト (ContentBlockerPanel) + bridge 2 テスト追加 = 全通過
- 全体: **298 suites / 2147 passed, 1 failed**（既存 i18nQuality 同上）
- lint: 新規エラーゼロ

### 未使用となった既存資産
- `components/screen-time/BrowserShieldToggleCard.tsx` + テスト: 案2 only の単一トグル UI。ContentBlockerPanel に置き換え後も削除せず保持（将来 settings.tsx に控えめなトグルを置く想定で再利用余地あり）

### iOS ビルド
- 変更は JS のみ（ネイティブ層・config plugin 無変更）のため prebuild/xcodebuild 再実行不要。ホットリロード反映可能

## 2026-06-02 追加: アンインストール防止（自己束縛 / Self-Binding）

### 動機
ユーザー要望: 「Rewire のアンインストール防止を Family Controls で実装したい。設定のスクリーンタイムアクセスで Rewire をオフにしない限り、アンインストールを防止したい」

### Apple API 調査結果
- **`ManagedSettingsStore.application.denyAppRemoval = true`** が公式 API（iOS 16+）
- 設定すると **デバイス全体でアプリ削除禁止**（Rewire 単体ではなく全アプリ）
- 解除には: 設定 → スクリーンタイム → スクリーンタイムにアクセスできるApp → Rewire → トグル OFF
- **iOS 17.4 以降は上記設定変更に Screen Time パスコード必須** = 衝動回避に最強
- `.individual` 認可 (Family Sharing なし) では Apple が保証しない場面ありとフォーラム回答 (`developer.apple.com/forums/thread/729717`)
- 競合: Opal / BlockerX / LeadMeNot / quittr 全て同じ仕組みを使用

### 採用アーキテクチャ
**react-native-device-activity v0.6.1 は denyAppRemoval を JS から呼べないため、自前 Expo Module を新規作成**:

#### 新規モジュール: `modules/expo-app-removal-guard/`
- `expo-module.config.json` — platforms iOS, modules AppRemovalGuardModule
- `package.json` — `expo-app-removal-guard@1.0.0` local module
- `src/index.ts` — `requireOptionalNativeModule<{setDenyAppRemoval/getDenyAppRemoval}>('ExpoAppRemovalGuard')`
- `ios/AppRemovalGuardModule.swift` — `ManagedSettingsStore().application.denyAppRemoval = value` を AsyncFunction で expose
- `ios/ExpoAppRemovalGuard.podspec` — CocoaPods 統合（platforms iOS 15.1 + @available(iOS 16.0, *) 内部ガード）
- `package.json` 本体に `"expo-app-removal-guard": "file:modules/expo-app-removal-guard"` 追記

**重要な学び**: Expo Module の autolinking には **package.json への file: 依存追加が必須**。`expo-modules-autolinking search` は modules/ 配下を検出するが、Podfile.lock に入るには package.json dependency 必要。**podspec の `s.platforms` を 15.1 に揃えること**（プロジェクト deployment target に合わせる、機能の iOS 16+ 要件は Swift 側で `@available` チェック）。

#### JS Bridge: `lib/screenTime/appRemovalBridge.ts`
- `lock()` / `unlock()` / `isLocked()` の薄いラッパー。Platform/null チェック + try-catch でログ
- 5テスト全通過

#### Store 拡張: `stores/screenTimeStore.ts`
- `removalLocked` (boolean) + `lastRemovalLockedAt` (number|null) 追加
- `markRemovalLocked()` / `markRemovalUnlocked()` アクション追加
- 10テスト全通過

#### UI: `components/screen-time/UninstallLockCard.tsx`
- 赤いロックアイコン + タイトル + ステータス + Switch
- **OFF→ON**: 1タップで lock + markRemovalLocked
- **ON→OFF**: **アプリ内では解除不可**、情報モーダル表示
  - モーダル内容: 「設定 → スクリーンタイム → スクリーンタイムにアクセスできるApp → Rewire → OFF」+「（iOS 17.4 以降はパスコード必須）」
  - 「設定を開く」ボタン: `Linking.openURL('App-Prefs:SCREEN_TIME')` で iOS 設定アプリへ
  - 「すでに解除済み（同期する）」: `appRemovalBridge.isLocked()` で再確認し false なら store 同期
  - 「キャンセル」: モーダル閉じる
- 6テスト全通過
- ユーザー要望「設定のスクリーンタイムアクセスで Rewire をオフにしない限り、アンインストールを防止」を実現

#### 統合: `app/(tabs)/profile.tsx`
- `ContentBlockerPanel` の下に `UninstallLockCard` を配置（Platform iOS ガード）

#### ロケール: `locales/ja.ts` / `en.ts`
- `uninstallLock` ブロック追加（title / statusOn / statusOff / helperOn / unlockModalTitle / unlockModalSteps / openSettings / alreadyRevoked / cancel）

### 検証結果
- 新規 21 テスト全通過（bridge 5 + store 4 追加 + UI 6 + 連動 6 含む）
- 全体: **300 suites / 2160 passed, 1 failed**（既存 i18nQuality 同上）
- `npx expo prebuild --platform ios --clean`: 成功
- Podfile.lock に `ExpoAppRemovalGuard (1.0.0)` 追加確認
- **`xcodebuild` Debug build: BUILD SUCCEEDED**

### 制約・注意
- **`denyAppRemoval = true` を一度設定すると**: ユーザーがアプリ内で OFF にしない限り**他の全アプリも削除不可**になる（Apple の仕様、Rewire 単体スコープは不可）。情報モーダルで明示する必要あり
- **`.individual` 認可では Apple 公式に「削除防止の保証なし」**。`.child` 認可 (Family Sharing) なら強保証だが UX 複雑
- **App Store 審査**: Opal / BlockerX / LeadMeNot 等の前例があり、self-binding 用途は ガイドライン 4.5 / 5.4 の範囲内。アプリ内で解除導線を明示することが重要
- **Family Controls Distribution エンタイトルメント**: 既に承認済み（4 Bundle ID）、本機能は既存認可で動作

### 動作フロー（実機検証要）
1. プロフィール画面で `UninstallLockCard` の Switch を ON
2. iOS が `denyAppRemoval = true` を有効化 → ホーム画面長押しで Rewire の削除がグレーアウト
3. ユーザーが解除したい時:
   - アプリ内 Switch OFF → 情報モーダル → 「設定を開く」→ 設定 → スクリーンタイム → スクリーンタイムにアクセスできるApp → Rewire → OFF
   - （iOS 17.4 以降）Screen Time パスコード入力要求
4. 設定 OFF 後 → アプリ内モーダルの「すでに解除済み」タップ → store を同期

### Sources
- [denyAppRemoval — Apple Developer](https://developer.apple.com/documentation/managedsettings/applicationsettings/denyappremoval-swift.property)
- [denyAppRemoval guarantees — Apple Forums](https://developer.apple.com/forums/thread/729717)
- [Opal App Uninstall Protection](https://opalapp.com/help/what-is-app-uninstall-protection)
- [Tech Lockdown — iOS 17.4 Screen Time passcode](https://www.techlockdown.com/articles/ios26-update-screen-time-protected-app-permissions)

## 2026-05-30: アプリ削除前フィードバック iOS Quick Action（expo-quick-actions）

### 概要
ホーム画面でアプリアイコンを長押し → 「Appを削除」の隣に自前項目「削除しますか？／アプリを削除する理由を教えてください」を表示。タップするとデバッグ情報入りのサポート宛メール作成画面が開く。Expo公式の "Save users from deleting your app" パターン。ユーザー添付スクショの再現。**Swiftは書かない**（expo-quick-actions がネイティブ実装を提供。設定はapp.config.ts + JS Hookのみ）。

### 採用方針
- **expo-quick-actions ^6.0.2**（SDK54対応）。静的iOSアクションを config plugin で登録（初回起動前から表示）。タップ受信は `useQuickActionCallback`（expo-quick-actions/hooks、cold-start初期アクションにも発火）。メール本文は実行時に動的生成するため静的 href:mailto は不使用。
- 新規ネイティブ依存3つ追加: **expo-quick-actions, expo-device(~8.0.10), expo-application(~7.0.8)**。`npx expo install` 済み。→ **要ネイティブ再ビルド**（Expo Go不可、OTA不可）。
- メール起動は既存の `Linking.openURL('mailto:...')` 流用（expo-mail-composer не使用）。

### 新規ファイル（TDD: Red→Green、全テスト通過）
- `constants/support.ts` — `SUPPORT_EMAIL = 'appsupport0326@gmail.com'`（既存4箇所の重複を集約）
- `lib/feedback/types.ts` — DeletionDebugInfo / DeletionFeedbackEmail
- `lib/feedback/deletionFeedbackEmail.ts`(+test 15件) — 純粋: buildDeletionFeedbackEmail / buildDeletionFeedbackMailto（件名・本文・URLエンコード・unknownフォールバック）
- `lib/feedback/collectDeletionDebugInfo.ts`(+test 11件) — expo-device/application/localization + safariWebExtensionBridge→deriveStatus を集約。取得失敗は unknown/never
- `hooks/feedback/useDeletionFeedbackQuickAction.ts`(+test 5件) — `DELETION_FEEDBACK_ACTION_ID='rewire-delete-feedback'`。Platform.OS!=='ios'ガード + id一致時のみメール起動

### 変更ファイル
- `app.config.ts` — plugins に `['expo-quick-actions', {iosActions:[{id:'rewire-delete-feedback', title:'削除しますか？', subtitle:'アプリを削除する理由を教えてください', icon:'symbol:envelope'}]}]`（withRemoveTrackingDescription の前）。**id は Hook定数と一致必須**（不一致でタップ無反応）
- `app/_layout.tsx` — `useDeletionFeedbackQuickAction()` を useNotificationDeepLink() の隣に追加
- `locales/ja.ts` / `en.ts` — `deletionFeedback` ブロック追加（件名/本文ラベル/unknown。enはASCIIのみ、{{}}変数なし → i18nQuality通過）
- `hooks/review/useReviewPromptActions.ts` / `app/settings.tsx` — ハードコードメールを SUPPORT_EMAIL 参照に置換
- `jest.setup.js` — グローバルモック追加: expo-quick-actions/hooks, expo-device, expo-application
- `app/__tests__/RootLayout.theme.test.tsx` — useDeletionFeedbackQuickAction をモック（ネイティブimport回避）

### テスト結果
- 新規35テスト全通過。全体: 286 suites / 2065 passed。**既存failは2件のみで本変更と無関係**（`indexRouting`=DEV_SKIP_ONBOARDINGフラグ、`i18nQuality`=postPurchaseOnboarding.demo.descriptionの改行差。両方とも本変更前から失敗を git stash で確認済み）
- tsc: 本機能の新規ファイルはエラーゼロ（既存エラーは別領域）。eslint: 新規ファイル0エラー（テストの import/first 警告のみ＝既存パターン同様）

### 未完了 / 次回
- **実機/シミュレータ検証が未実施**（要ネイティブ再ビルド）: `npx expo prebuild -p ios` → `npx expo run:ios` → アイコン長押しで項目表示 → タップでメール起動を確認すること。シミュレータは Device.* が null を返す場合あり → unknownフォールバックでカバー済み
- メニュー文言は Info.plist にビルド時固定（i18n非対応）。ja主体で日本語固定の判断
- **本番/EASビルド前に `app/index.tsx:7` の DEV_SKIP_ONBOARDING を false に戻すこと**
- 文言・メール方式・デバッグ情報範囲は AskUserQuestion がツール障害で送れず「写真に忠実」をデフォルト採用。変更要望あれば差し替え

## 2026-05-29: Safari Web Extension ブロックページ + 通知本文を OS 言語ベースで英語対応

### 解決した課題
ブロックページ (`止めるって、決めたはず。` 等) と Safari 拡張から発火するローカル通知本文 (`衝動に気づきました。今の気持ちを振り返りましょう。`) が 100% ハードコード日本語。OS 言語が日本語以外のユーザーに意味不明な画面・通知が出ていた。

### 設計判断
- **OS 言語自動判定** を採用（hiro 当初案「右上に手動トグル」は不採用）。理由：ブロックページは「衝動を止めるスローダウン画面」であり、トグル UI は集中を削ぐ。アプリ本体 `locales/i18n.ts` の `expo-localization` 判定と一貫性。
- **Web Extension 標準 `browser.i18n.getMessage()` + `_locales/`** を採用（`navigator.language` 自前分岐や HTML 2 枚案は不採用）。manifest の `default_locale: 'ja'` と `_locales/{ja,en}/messages.json` 生成は plugin が既に下地を持っていた。
- **Swift 通知本文は `Locale.preferredLanguages.first` で分岐**（NSLocalizedString + .strings 方式は plugin 改造コストが大きい。文字列 1 つなので分岐で十分）。

### 変更ファイル
- `plugins/withSafariWebExtension.js` — 唯一の編集対象
  - `generateBlockedHtml()`: `<h1>` / `<p>` / `<button>` / `.subtext` に `data-i18n="blockTitle|blockBody|openRewire|notificationHint"` 属性を追加。日本語コピーは pre-DOMContentLoaded / テスト用フォールバックとしてインライン保持。
  - `generateBlockedCss()`: 本文 `<p>` に `white-space: pre-line` を追加（i18n メッセージ内の `\n` を改行レンダー）。
  - `generateBlockedJs()`: `browser.i18n.getMessage` 呼び出しを追加。`[data-i18n]` ノードを走査し textContent を上書き。`blockBody` のみ domain を $1 substitution として渡す。i18n 取得失敗時は HTML インラインフォールバックを残すデグレード分岐。
  - **新規** `generateLocaleMessages(locale)`: `_locales/{ja,en}/messages.json` の内容を 1 か所に集約。`withExtensionFiles` 内のインライン JSON 生成をこの関数で置換。
  - `generateSwiftHandler()`: 新規 `localizedNotificationBody()` 関数を追加。`Locale.preferredLanguages.first?.prefix(2).lowercased() == "ja"` で日本語 / それ以外英語。
  - exports に `generateLocaleMessages` 追加。
- `plugins/__tests__/withSafariWebExtension.test.js` — テスト追加（30 tests, +6 new）：
  - blocked.html に 4 つの `data-i18n` 属性が含まれる
  - blocked.js が `browser.i18n.getMessage` を呼ぶ + `'blockBody'` リテラルを含む
  - `generateLocaleMessages('ja'|'en')` の戻り値検証（キー対称性チェック含む）
  - Swift handler に `Locale.preferredLanguages` + `localizedNotificationBody` + 両言語文字列

### 注意事項
- **prebuild + EAS Build 必須**: plugin 出力が変わるので OTA では届かない。
- **`notificationBody` キー**は `_locales/messages.json` には**含めていない**（Swift から `browser.i18n` を読めないため重複定義になる）。Swift 内のハードコード文字列が source of truth。文言を変える時は Swift と messages.json を両方更新する必要がないが、運用上は翻訳整合性のため将来 `notificationBody` を messages.json にも追加して「Swift ハードコードは messages.json と一致させる」運用にしてもよい（今回は最小変更を優先）。
- **Safari のロケール解決**: OS 言語が `ja-JP` → `_locales/ja/`、それ以外 → 最良マッチ → なければ `default_locale: 'ja'`。`en-US`, `en-GB` 等は `_locales/en/` にマッチする。
- **`white-space: pre-line` 追加**は既存 `<p class="subtext">` にも影響するが、subtext は単一行なので視覚的変化なし。
- 既存の `locales/ja.ts` / `locales/en.ts` の `blockedSiteTitle` / `blockedSiteBody` は **RN 側のローカル通知用** であり、今回追加した `_locales/messages.json` (拡張専用) とは別空間。混同しないこと。

### テスト
- plugin: 30 / 30 PASS（withSafariWebExtension.test.js）
- 全体: **2034 / 2036 PASS**。失敗 2 件は事前から赤の `locales/__tests__/i18nQuality.test.ts`（`postPurchaseOnboarding.demo.description` の改行数差分）と `app/__tests__/indexRouting.test.tsx`（`DEV_SKIP_ONBOARDING` 関連）— 今回の変更と無関係。
- lint: 私の変更ファイルにエラー 0（既存 24 errors / 420 warnings は全て他ファイル）。

### 検証手順（hiro が実施）
1. `npx expo prebuild --platform ios --clean` で `ios/SafariWebExtension/_locales/en/messages.json` に `blockTitle`/`blockBody`/`openRewire`/`notificationHint` が含まれること、`blocked.html` に `data-i18n` 属性が含まれることを目視確認
2. **`DEV_SKIP_ONBOARDING` を false** に戻してから EAS development build（`eas build --profile development --platform ios`）
3. 実機で iOS 言語を English に切り替え → Safari 再起動 → ブロック対象ドメインを開く → 英語ブロックページ + 英語通知が出ること確認
4. iOS 言語を日本語に戻す → 同じ手順で日本語表示が出ること確認

### 未コミット状態
- 編集: `plugins/withSafariWebExtension.js`, `plugins/__tests__/withSafariWebExtension.test.js`, `.claude/MEMORY.md`


## 2026-05-01: DEMO_TEST_URL を Google → DuckDuckGo に切り替え（Google アプリの Universal Links 横取り対策）

### 解決した課題
実機検証で「Safariで検索を開く」を押すと **iOS の Google アプリ**が起動してしまう問題。`https://www.google.com/search?q=pornhub` は Google の apple-app-site-association で claimed されており、ユーザーが Google アプリをインストールしている場合 Universal Links で横取りされ、Safari で開かない → Safari Web Extension がそもそも走らないため、ブロック体験が動作しない。

### 検討した3案
1. **`x-web-search://?query=pornhub`** — iOS Spotlight が使う非公式スキーム。Safari の URL バーに pornhub を入れた状態で立ち上がるが、iOS バージョンによって挙動が揺れる可能性
2. **DuckDuckGo URL** ← 採用 — `https://duckduckgo.com/?q=pornhub`。DDG アプリを入れているユーザーが少ないため Safari で確実に開く。SafeSearch も緩く adult クエリで結果が出る
3. **Google URL の bypass トリック** — Universal Links は fragment や query 追加では回避できない。実用的でない

### 変更ファイル
- `constants/postPurchaseOnboarding.ts` — `DEMO_TEST_URL` を `https://duckduckgo.com/?q=pornhub` に変更、選定理由をコメント
- `components/postPurchaseOnboarding/__tests__/DemoStep.test.tsx` — URL アサート更新

### 注意事項
- `locales/ja.ts` / `locales/en.ts` の demo description は「検索結果が表示されます」と検索エンジン非依存の表現になっており**変更不要**
- DuckDuckGo の adult 結果は Google より緩いがゼロではない。「pornhub」での検索は最上位に pornhub.com 公式サイトが出る想定。実機で確認
- DDG アプリをインストールしているユーザーは Universal Links で intercept される可能性。ただしレアケースとして許容。問題が発覚したら `x-web-search://` 系へ更に切り替え検討

### テスト
- 47 / 47 PASS（postPurchaseOnboarding 系 全 Green）


## 2026-05-01: 検知ゲート撤去 → 確認モーダル方式へピボット

### 解決した課題
同日朝に実装した「多層検知ハイブリッド」(`useExtensionGate` + Tier 1 SFSafariExtensionManager + Tier 2 Darwin Notifications + Tier 3 heartbeat) を実機検証したところ、**拡張機能を ON にしても `disabled` 判定が出続け demo step のメインボタンが永久に押せない**問題が発生。原因デバッグせず、検知の不確実性を受け入れる確認モーダル方式に転換。

### 実装内容（前計画の検知 UI 撤去 + 確認モーダル追加）

**新規**:
- `components/postPurchaseOnboarding/ExtensionConfirmModal.tsx` — 2 ボタン (続ける / 設定で確認)、外側タップで close
- `components/postPurchaseOnboarding/__tests__/ExtensionConfirmModal.test.tsx` — 5 tests

**修正**:
- `components/postPurchaseOnboarding/DemoStep.tsx` — `gate` prop / `gateArea` / `disabledTint` / `probeButton` 全削除。`handleTestBlock` を確認モーダル起動に変更。`handleConfirm` で `onTestBlock` + `Linking.openURL(DEMO_TEST_URL)`。`handleOpenSettings` で `app-settings:` deeplink
- `components/postPurchaseOnboarding/__tests__/DemoStep.test.tsx` — gate 系テスト全削除、確認モーダルフロー 7 tests
- `app/post-purchase-onboarding/index.tsx` — `useExtensionGate` import / call / gate prop 削除
- `app/post-purchase-onboarding/__tests__/PostPurchaseOnboardingScreen.test.tsx` — `useExtensionGate` モック削除
- `hooks/postPurchaseOnboarding/usePostPurchaseFlow.ts` — `safariWebExtensionBridge.getExtensionStatus()` の auto-skip ブロックを完全削除。`safariAlreadyEnabled` state も削除。戻り値型からも除去
- `hooks/postPurchaseOnboarding/__tests__/usePostPurchaseFlow.test.ts` — auto-skip 関連 2 テスト削除、`safariAlreadyEnabled` 廃止確認テスト追加
- `constants/postPurchaseOnboarding.ts` — `EXTENSION_PROBE_URL` / `PROBE_TIMEOUT_MS` 削除
- `locales/ja.ts` / `locales/en.ts` — `postPurchaseOnboarding.demo.gate.*` 11 キー全削除、`postPurchaseOnboarding.demo.confirm.*` 4 キー追加 (title / body / confirmButton / openSettingsButton)
- `modules/expo-safari-web-extension/ios/SafariWebExtensionStatusModule.swift` — 先頭に「現在 UI 未使用 / 将来再利用予定」コメント追加

**削除**:
- `hooks/postPurchaseOnboarding/useExtensionGate.ts`
- `hooks/postPurchaseOnboarding/__tests__/useExtensionGate.test.ts`
- `components/postPurchaseOnboarding/ExtensionDisabledModal.tsx`
- `components/postPurchaseOnboarding/__tests__/ExtensionDisabledModal.test.tsx`

**保留 (next-time-detection 向けに残す)**:
- `lib/safariWebExtension/safariWebExtensionBridge.ts` の `getExtensionState` / `subscribeAlive` (orphan)
- `lib/safariWebExtension/types.ts` の `ExtensionStateNative` / `ExtensionAliveListener`
- `modules/expo-safari-web-extension/ios/SafariWebExtensionStatusModule.swift` の `getExtensionState` AsyncFunction + Events("onExtensionAlive") + Darwin observer (`OnCreate`/`OnDestroy`)
- `plugins/withSafariWebExtension.js` の `generateSwiftHandler` 内 `CFNotificationCenterPostNotification` (Darwin notification post)
- → prebuild 不要 / dev client 再ビルド不要。次回 native ビルド時に自動的に含まれる

### 結果
- **テスト: 285 スイート / 2024 テスト, 2023 PASS / 1 FAIL**（失敗 1 件は既存の `indexRouting.test.tsx` の `DEV_PREVIEW_POST_PURCHASE=true` 起因 — `false` に戻せば自動解消）
- 確認モーダル方式の TDD: ExtensionConfirmModal 5 tests / DemoStep 7 tests / usePostPurchaseFlow 8 tests / PostPurchaseOnboardingScreen 8 tests 全 Green

### 次回やるべきこと / 注意

**hiro 側で必須対応**:
1. **dev client の JS バンドル更新**: prebuild 不要のため Metro 経由 fast refresh で OK。ただし古いビルドにキャッシュが残っている場合は `Cmd+R` または app reload。Native は変更なしなので Xcode 再ビルド不要
2. **実機 E2E (簡易版)**:
   - 拡張 OFF: demo step → 「Safariで検索を開く」 → 確認モーダル → 「続ける」 → Safari → Google検索 → アダルトリンク → **素通し**（OFF なので想定通り）
   - 拡張 ON: 同フロー → リンクタップ → **ブロックページ表示** → /panic 通知 → アプリ復帰 → demo→complete 自動遷移
   - 「設定で確認」: モーダル中にタップ → iOS 設定アプリへ
3. **本番ビルド前**: `app/index.tsx:10` の `DEV_PREVIEW_POST_PURCHASE = true` を `false` に戻す

**設計上の注意**:
- 確認モーダル方式は「ユーザー自己申告」であり検証ではない。「続ける」を押した上で extension が OFF だとアダルトコンテンツが露出する。これは**プロダクト既知リスク**として受け入れた（モーダル本文で警告）
- Native 検知 infra（Tier 1 / Darwin / getExtensionState）はコード上残存。将来 native debug を経て検知が動く確認が取れれば `useExtensionGate` 風 hook を再導入して再ゲート化することは可能
- `safariWebExtensionBridge.getExtensionState` / `subscribeAlive` は orphan（呼び出し元なし）。将来の Pro ユーザー設定画面で「拡張機能状態」を表示するなどの用途に転用可能
- TestFlight ビルド時は EXTENSION_PROBE_URL を環境変数で外出ししなくてよい（削除済みなので）。`https://hiro0211.github.io/rewire-extension-check/` ページは将来再利用するなら維持、しないなら GitHub リポジトリごと削除可能


## 2026-05-01: 拡張機能 OFF 時の Demo URL 露出を防ぐ多層検知ガード（高速 Tier 1+2+3）

### 解決した課題
ペイウォール後オンボーディング Step 2（DemoStep）の「ブロックをテスト」が **`Linking.openURL('https://www.google.com/search?q=pornhub')` を guard 無しで実行**しており、拡張機能が OFF だとアダルト検索結果が素通しで表示される最悪の体験になっていた。既存 heartbeat 検知は OFF→ON で `never` のまま、ON→OFF で 6h 誤判定する遅延が問題。

### 実装内容（多層防御 + 高速検知ハイブリッド）

**1. iOS 26.2 で追加された `SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier:completionHandler:)` を Tier 1 として採用**
- `modules/expo-safari-web-extension/ios/SafariWebExtensionStatusModule.swift` に `getExtensionState` を追加。`@available(iOS 26.2, *)` でガードし、未満は `{ available: false, isEnabled: false }` を返す
- 同期に近い ~100ms で isEnabled を確定。ON→OFF も 6h 待たずに即時反映

**2. Darwin Notifications を Tier 2 として採用（全 iOS 対応）**
- `plugins/withSafariWebExtension.js` の `generateSwiftHandler()` に `CFNotificationCenterPostNotification` を追加。extension が走るたびに `rewire.extension.alive` を発火
- `SafariWebExtensionStatusModule.swift` の `OnCreate` で `CFNotificationCenterAddObserver` 登録 → Expo Events `onExtensionAlive` で JS に通知。アンマウントで `CFNotificationCenterRemoveEveryObserver`

**3. JS 側 `safariWebExtensionBridge` に `getExtensionState` / `subscribeAlive` を追加**
- `lib/safariWebExtension/types.ts` に `ExtensionStateNative` 型追加
- iOS 以外は安全な stub を返す

**4. 新規 hook `useExtensionGate` で三段階判定を実装**
- `hooks/postPurchaseOnboarding/useExtensionGate.ts`（新規）
- マウント時に Darwin subscribe + 初回 refresh、AppState 'change' → active で再 refresh
- `refresh()`: Tier 1 → 直近 Darwin alive (30s 窓) → Tier 3 heartbeat の優先順
- `startProbe()`: `Linking.openURL(EXTENSION_PROBE_URL)` で Safari に飛ばし、5s 以内に alive 受信で `disabled` 抜け / 受信なしで `disabled` 確定
- `openSettings()`: `Linking.openURL('app-settings:')` で iOS 設定アプリへ直リンク

**5. UI 層 — DemoStep + 新モーダル**
- `components/postPurchaseOnboarding/ExtensionDisabledModal.tsx`（新規） — 「拡張機能がまだオンになっていません」/「すべての Web サイトを許可してください」状態別文言 + 設定/再チェック/閉じる CTA
- `components/postPurchaseOnboarding/DemoStep.tsx` 改修 — `gate` prop 受け取り、`canProceed=false` のとき footer を opacity 0.5 + 「動作確認する」ボタン表示。`handleTestBlock` 内で `await gate.refresh()` → false ならモーダル、true なら openURL（最終バリア）
- `app/post-purchase-onboarding/index.tsx` — `useExtensionGate({ active: step === 2 })` を追加し DemoStep に渡す

**6. usePostPurchaseFlow の auto-skip 条件強化**
- 旧: `status.isEnabled` だけで step 2 へスキップ → needsAllUrls 状態でデモ画面で詰まる
- 新: `status.isEnabled && status.hasAllUrls` の両方を要求

**7. 定数 + ロケール**
- `constants/postPurchaseOnboarding.ts` に `EXTENSION_PROBE_URL='https://hiro0211.github.io/rewire-extension-check/'` + `PROBE_TIMEOUT_MS=5000`
- `locales/ja.ts` / `locales/en.ts` に `postPurchaseOnboarding.demo.gate.*` 11 キー追加

### TDD 順序（Red → Green 厳守）
1. safariWebExtensionBridge.test.ts 拡張（11 tests）
2. withSafariWebExtension.test.js 拡張（24 tests / Darwin notification 検証含む）
3. useExtensionGate.test.ts 新規（15 tests）
4. ExtensionDisabledModal.test.tsx 新規（7 tests）
5. DemoStep.test.tsx 拡張（10 tests）
6. usePostPurchaseFlow.test.ts 拡張（9 tests）
7. PostPurchaseOnboardingScreen.test.tsx 既存維持（8 tests / useExtensionGate モック追加）

### 結果
- **テスト: 286 スイート / 2045 テスト**, **2044 PASS / 1 FAIL**（失敗 1 件は `indexRouting.test.tsx` の `DEV_PREVIEW_POST_PURCHASE=true` 起因の意図的な既存 failure）
- lint: 新規エラーなし（既存の display-name/import-first warning のみ）

### 変更ファイル
**新規**:
- `hooks/postPurchaseOnboarding/useExtensionGate.ts` + `__tests__/useExtensionGate.test.ts`
- `components/postPurchaseOnboarding/ExtensionDisabledModal.tsx` + `__tests__/ExtensionDisabledModal.test.tsx`

**修正**:
- `modules/expo-safari-web-extension/ios/SafariWebExtensionStatusModule.swift`
- `plugins/withSafariWebExtension.js` + `plugins/__tests__/withSafariWebExtension.test.js`
- `lib/safariWebExtension/types.ts` + `safariWebExtensionBridge.ts` + `__tests__/safariWebExtensionBridge.test.ts`
- `components/postPurchaseOnboarding/DemoStep.tsx` + `__tests__/DemoStep.test.tsx`
- `app/post-purchase-onboarding/index.tsx` + `__tests__/PostPurchaseOnboardingScreen.test.tsx`
- `hooks/postPurchaseOnboarding/usePostPurchaseFlow.ts` + `__tests__/usePostPurchaseFlow.test.ts`
- `constants/postPurchaseOnboarding.ts`
- `locales/ja.ts`, `locales/en.ts`

### 次回やるべきこと / 注意

**hiro 側で必須対応**:
1. **`https://hiro0211.github.io/rewire-extension-check/` の静的ページを事前デプロイ** — content_script が `<all_urls>` で走るベニンな HTML（`<h1>Rewire 拡張機能の動作確認</h1>` 程度）。デプロイしないとプローブが 404 でユーザーには「拡張オフ」に見える
2. **prebuild 必要**: `npx expo prebuild --clean` で iOS native コードを再生成し、新しい dev client をビルドする（Darwin notification 投稿コードと iOS 26.2 API は generated handler / native module 経由で組み込まれる）
3. **実機検証**: 計画書 `~/.claude/plans/5-qa-melodic-treasure.md` の「手動 E2E」セクション 10 項目を実機で確認
4. **本番ビルド前**: `app/index.tsx:10` の `DEV_PREVIEW_POST_PURCHASE = true` を **必ず `false` に戻す**（戻すと `indexRouting.test.tsx` 1 件失敗も自動解消）

**設計上の注意**:
- `SFSafariExtensionManager` の iOS 26.2 サポートは Web リサーチで確認済み（Apple Developer Documentation の `getStateOfSafariExtension(withIdentifier:completionHandler:)` ページ + Safari 26.2 Release Notes より）。Apple 公式ページの直接パースが WebFetch でできなかったため、念のため初回ビルド時に Xcode コンパイルで検証すること
- Darwin Notifications はペイロードを持てない仕様。詳細（lastActiveAt / hasAllUrls）は依然 App Group UserDefaults 経由
- Tier 1 API は `hasAllUrls` を返さないため、「isEnabled だが hasAllUrls 未確認」状態は `needsAllUrls` 扱いに倒す保守的設計
- `ALIVE_WINDOW_MS = 30_000` が `useExtensionGate` 内のハードコード値。プローブ後 30 秒以内の Darwin 受信を「直近 alive」と判定。長めにすると false positive、短くすると false negative


## 2026-05-01: post-purchase Demoフロー — Google検索結果から実サイトをタップ式に変更

### 課題
- 既存の `/post-purchase-onboarding` Step 2 (DemoStep) は専用LP `https://hiro0211.github.io/rewire-demo-block/` を Safari で開いてリンクタップさせる流れだった
- ユーザー要望: 「実際の検索結果からアダルトサイトをタップしてブロック体験」のほうが本物感があり納得感（=継続率/LTV）が上がる

### 変更内容
1. `constants/postPurchaseOnboarding.ts:12` — `DEMO_TEST_URL` を `https://www.google.com/search?q=pornhub` に変更
2. `locales/ja.ts` の `postPurchaseOnboarding.demo.*` 全文言を「Safariで検索を開く → 上位のアダルトサイトをタップ」フローに合わせて自然な日本語で書き直し
3. `locales/en.ts` も同様に英語で更新（"Open search in Safari" / "tap one of the top adult sites"）
4. `components/postPurchaseOnboarding/__tests__/DemoStep.test.tsx` — `DEMO_TEST_URL` の値アサートを新URLへ更新
5. アプリ内UIには "pornhub" の単語を出さない方針（婉曲表現「アダルトサイト」で統一）。URL内の文字列のみ含む

### App Store審査リスク
- バイナリ内に `pornhub` 文字列が含まれる（`Linking.openURL` 引数経由）。指摘された場合は URL を Base64 / 文字列分割で隠蔽する対応を検討
- アプリのUIには露出しないので、ブロッカーアプリとしての文脈で問題ないと判断

### 結果
- テスト: 283スイート / 2008テスト 全PASS（既存の `indexRouting.test.tsx` 1件のみ失敗 — `DEV_PREVIEW_POST_PURCHASE=true` 起因の既存failure、変更と無関係）
- lint: 新規エラーなし
- 未コミット状態

### 変更ファイル
- 変更: `constants/postPurchaseOnboarding.ts`, `locales/ja.ts`, `locales/en.ts`, `components/postPurchaseOnboarding/__tests__/DemoStep.test.tsx`

### 次回やるべきこと / 注意
- 実機検証必須: 開発ビルドで Step 2 → 「Safariで検索を開く」→ Safari Google検索結果ページで上位のpornhub.comリンクをタップ → ブロック発動 → 自動でStep 3へ遷移、を確認
- **Google SafeSearch のリスク**: 端末/地域/アカウントで SafeSearch ON だと pornhub が結果に出ない可能性あり。実機で確認、出ない場合は DuckDuckGo (`https://duckduckgo.com/?q=pornhub`) へのフォールバックを検討
- 旧 `https://hiro0211.github.io/rewire-demo-block/` リポジトリは未削除。今回のフロー切替で参照ゼロになったが、外しに行くかは別判断

## 2026-04-30: post-purchase オンボーディング ブロック体験リデザイン

### 解決した課題
1. 「ブロックをテスト」が魔法のショートカットに見える問題 — `Linking.openURL('https://www.pornhub.com')` 直叩きで extension が `document_start` で即置換するため、ユーザーは自分でリンクをタップした感覚を得られなかった
2. パニック機能完了後にオンボーディングが完了しない問題 — `blockFired === true` の検知後の自動遷移ロジックが無く、ユーザーが「あとで試す」を押さないとメインタブに行けなかった

### 実装内容
**1. GitHub Pages 中継ランディングページ公開**
- 新規パブリックリポジトリ: `hiro0211/rewire-demo-block` (https://github.com/hiro0211/rewire-demo-block)
- 公開 URL: https://hiro0211.github.io/rewire-demo-block/
- `index.html` 1ファイル + `logo.png` (icon.pngコピー) + `favicon.png` + `README.md`
- デザイン: Rewire Dark テーマ忠実踏襲（背景グラデ #0A0A0F→#1a1a3e→#2d1b4e、CTA 紫グラデ #8B5CF6→#6D28D9、シアンアクセント、glassmorphism カード）
- LP 構成: ロゴ + 「アダルトサイトへアクセスしてみましょう！」見出し + 説明 + 巨大 CTA「アダルトサイトを開く」(`<a href="https://www.pornhub.com">`) + シアン枠の補足 + フッター
- ローカル `/Users/arimurahiroaki/rewire-demo-block/` (rewire本体とは独立リポジトリ)

**2. 完了ステップ追加**
- `PostPurchaseStep` 型を `'thankYou' | 'safariSetup' | 'demo' | 'complete'` に拡張、`POST_PURCHASE_STEPS` 配列に `'complete'` 追加（`TOTAL_POST_PURCHASE_STEPS === 4`）
- `components/postPurchaseOnboarding/CompleteStep.tsx`（新規）— shield-checkmark + 祝福コピー + CTA「Rewireを始める」
- `app/post-purchase-onboarding/index.tsx` に `useFocusEffect` を追加 — `step === 2 && blockFired === true` のとき `goToNext()` で step=3 へ自動遷移。AppState 復帰時の `/panic` push と競合しないよう `useFocusEffect` を選択（panic→breathing/recovery 連鎖を抜けて post-purchase 画面に戻った時点で発火）
- `step === 3` で CompleteStep を描画、CTA で `router.replace(ROUTES.tabs)`
- `logStepViewed` 名前マッピングに `'complete'` を追加

**3. ロケール文言追加**
- `locales/ja.ts` / `locales/en.ts` に `postPurchaseOnboarding.complete.{title, description, cta}` 追加
- `demo.description` / `demo.notice` を「リンクをタップしてブロックを体験」風に微修正

**4. DEMO_TEST_URL 切替**
- `constants/postPurchaseOnboarding.ts:7` を `https://hiro0211.github.io/rewire-demo-block/` に変更

### TDD サイクル
- Red→Green を各変更で実施
- 新規/更新テスト:
  - `components/postPurchaseOnboarding/__tests__/CompleteStep.test.tsx`（新規）
  - `components/postPurchaseOnboarding/__tests__/DemoStep.test.tsx`（DEMO_TEST_URL アサート追加）
  - `hooks/postPurchaseOnboarding/__tests__/usePostPurchaseFlow.test.ts`（'complete' ケース + step 上限テスト追加）
  - `app/post-purchase-onboarding/__tests__/PostPurchaseOnboardingScreen.test.tsx`（新規 — step=3 描画 / CTA replace / focus callback 登録確認）

### 結果
- **テスト: 282 スイート / 1990 テスト全 PASS**（前回までベースの 264スイート/1851 から +18スイート/+139テスト）
- lint: 既存と同レベルの warning のみ。エラー追加なし
- GitHub Pages: HTTP 200 配信確認済み（`curl` + WebFetch）

### 動作確認の流れ（実機 E2E）
1. 開発ビルドで Safari 拡張機能を有効化
2. paywall 後の post-purchase オンボーディングへ進む
3. `DemoStep` の「ブロックをテスト」タップ → Safari が GitHub Pages LP を開く
4. LP の「アダルトサイトを開く」リンクをタップ → 拡張機能が pornhub.com への遷移を弾く → ブロックページ表示 → 通知発火
5. 通知タップで `/panic` → 「今ポルノを見たくなっている」/「ポルノを見てしまった」選択 → `/breathing` or `/recovery` 完遂
6. アプリに戻ると `CompleteStep`（祝福画面）が自動表示 → CTA タップで `(tabs)` へ

### 変更ファイル一覧（rewire 本体）
- 変更: `app/post-purchase-onboarding/index.tsx`, `constants/postPurchaseOnboarding.ts`, `locales/ja.ts`, `locales/en.ts`
- 変更: `components/postPurchaseOnboarding/__tests__/DemoStep.test.tsx`, `hooks/postPurchaseOnboarding/__tests__/usePostPurchaseFlow.test.ts`
- 新規: `components/postPurchaseOnboarding/CompleteStep.tsx`, `components/postPurchaseOnboarding/__tests__/CompleteStep.test.tsx`
- 新規: `app/post-purchase-onboarding/__tests__/PostPurchaseOnboardingScreen.test.tsx`

### 次回やるべきこと / 注意
- **未コミット状態**。変更をコミット時は `Co-Authored-By: Claude Opus 4.7` を含めること
- GitHub Pages の独自ドメイン化（例: `demo.rewire-app.com`）は未対応。必要なら後日 CNAME ファイル追加で対応可能
- LP の文言は日本語固定。英語ユーザー向けには英語版 LP を別途用意するか、`?lang=en` クエリで切り替える機構を検討してもよい
- Safari 拡張機能を有効化していない状態でリンクをタップした場合、ブロックは発動せず実際に pornhub.com が開く可能性あり。LP 側に「Rewire 拡張機能が有効でないとブロックされません」旨の案内を追加するかは要検討

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

## 2026-04-24: Safari Web Extension 未設定検知 & 赤い警告カード実装

### 作業内容
Safari Web Extension が「有効化」「全 Web サイト許可」の両方を満たしていない時に、プロフィール画面の ProfileHeader 直下にスクリーンタイム警告と同じデザインの赤枠カードを表示する機能を TDD サイクルで実装。iOS 17/18 には Safari Web Extension 状態を直接取得する公開 API がないため、拡張側 heartbeat に `browser.permissions.contains({origins:['<all_urls>']})` を同梱して間接検知する方式。

### 状態モデル
`useWebExtensionStatus` が返す enum を `'checking'|'enabled'|'unknown'` → `'checking'|'healthy'|'needsAllUrls'|'disabled'` に拡張。`lib/safariWebExtension/deriveStatus.ts` で純粋関数化（SRP: 導出ロジックを UI/フックから分離）。

### 主要な変更
- **Swift Handler（withSafariWebExtension.js::generateSwiftHandler）**: `type: 'heartbeat'` メッセージ受信時に `msg["hasAllUrls"]` を App Group UserDefaults の `rewire.webExtension.hasAllUrls` に保存
- **Swift Module（SafariWebExtensionStatusModule.swift）**: `activeWindowSeconds` を 24h → **6h** に短縮、返却 dict に `hasAllUrls` 追加
- **background.js（generateBackgroundJs）**: `runtime.onStartup` / `onInstalled` / `webNavigation.onCommitted` (30s debounce) / `alarms.create('rewire-heartbeat', {periodInMinutes:15})` の 4 トリガーで heartbeat 送信。`permissions.contains({origins:['<all_urls>']})` の結果を payload に同梱
- **manifest permissions 追加**: `webNavigation`, `alarms`
- **新規コンポーネント**: `components/profile/SafariExtensionAlertCard.tsx` — 赤枠 + shield-outline icon + `colors.danger` ボタン。props: `title/description/actionLabel/onPress` のみ（表示専用）
- **新規フック**: `hooks/safariWebExtension/useSafariSettingsDeepLink.ts` — `App-Prefs:com.apple.mobilesafari` を試行 → 失敗時 `Linking.openSettings()` フォールバック
- **profile.tsx 統合**: `disabled`/`needsAllUrls` 時のみ警告カード表示、`healthy`/`checking` 時のみ ToolCard 表示（重複回避）
- **i18n**: `safariWebExtension.alert.{title, descriptionDisabled, descriptionNeedsAllUrls, openSettingsAction}` を ja.ts/en.ts に追加

### 実装不可能な部分
- **「プライベートブラウズで許可」**: iOS 17/18 ではアプリからも Extension JS からも検知不可能。description で「プライベートブラウズでの許可も忘れずに」と教育する方針
- iOS 26.2+ で native API 追加（Jeff Johnson ブログ情報）だが deployment target 15.0 のためスコープ外

### 変更ファイル
- 新規: `components/profile/SafariExtensionAlertCard.tsx` + test、`hooks/safariWebExtension/useSafariSettingsDeepLink.ts` + test、`lib/safariWebExtension/deriveStatus.ts` + test
- 既存: `modules/expo-safari-web-extension/ios/SafariWebExtensionStatusModule.swift`, `plugins/withSafariWebExtension.js`, `lib/safariWebExtension/{types.ts, safariWebExtensionBridge.ts, __tests__/safariWebExtensionBridge.test.ts}`, `hooks/settings/{useWebExtensionStatus.ts, __tests__/useWebExtensionStatus.test.ts}`, `app/(tabs)/{profile.tsx, __tests__/ProfileScreen.test.tsx}`, `locales/{ja.ts, en.ts}`

### テスト
- 269/270 スイート通過、1888/1889 テスト通過
- 唯一の失敗 `app/__tests__/indexRouting.test.tsx` は本変更と無関係の既存失敗（memory 記録済み）
- lint 新規エラーゼロ（既存 display-name 警告のみ）

### Step 0 実機検証（未実施・要ユーザー確認）
計画では Step 0 として以下を実機で事前確認する前提だったが、コーディング環境のため skip。hiro が実機ビルドで検証が必要:
1. `browser.permissions.contains({origins:['<all_urls>']})` が Safari iOS で promise を返すか
2. `browser.webNavigation.onCommitted` が発火するか
3. `browser.alarms.create/onAlarm` が使えるか

動かない場合は `hasAllUrls` 検知を諦めて `disabled` のみ警告する縮退版に修正が必要。コード側は API 不在時 `hasAllUrls=false` にフォールバックするガード付きなので、最悪でも `disabled` 検知は機能する。

### App Store 審査注意
- manifest permissions に `webNavigation` と `alarms` を追加したため、App Store Connect の拡張機能使用理由を更新する必要がある可能性
  - `webNavigation`: 「拡張機能が正しく有効化されているかを定期的に確認してユーザーに案内するため」
  - `alarms`: 「拡張機能の稼働状況を低頻度で確認するため」
- `App-Prefs:com.apple.mobilesafari` URL scheme 使用（過去 reject 事例あり）— `canOpenURL` 事前チェック + `Linking.openSettings()` フォールバックで担保

### 未コミット状態

## 2026-04-24: 起動時ペイウォール誤表示の修正（レース条件対策 + 多層防御）

### 症状
- 契約済みユーザーが起動後ブランド画面（スタートアップ）を経由してペイウォールに到達してしまう
- 原因: `app/brand.tsx` がアニメーション終了(4,200ms固定)時点で `userStore.user.isPro` を参照するが、RevenueCat の `initialize()` + `getCustomerInfo()` が間に合わない + listener が空値で isPro=false を上書き persist してしまう

### 対応（プラン `~/.claude/plans/rewire-joyful-cerf.md` に準拠、TDD で実装）
**PR1 — paywall 二重ガード**:
- `hooks/paywall/usePaywallSubscriptionGuard.ts` 新規: マウント時 `getSubscriptionStatus` 再取得 + `userStore.user.isPro` 変化監視、active 検知で `onActive()` 発火（一度だけ）
- `hooks/paywall/usePaywallOrchestration.ts` で guard を呼び、active 検知 → `router.replace(ROUTES.tabs)`

**PR2 — 主対策（subscriptionSynced ベースのナビゲーション）**:
- `stores/subscriptionStore.ts` 新規: `subscriptionSynced: boolean` と `markSynced()` / `reset()`
- `hooks/useAppInitialization.ts`: 
  - initialize + getSubscriptionStatus 完了（または失敗、Purchases=null時）で必ず `markSynced()`
  - listener を `isPro=true` 昇格のみ反映に変更（空 active による `isPro:false` 上書きを抑止）
- `app/brand.tsx`:
  - アニメーション終了で `tryNavigate()` を呼び、`synced && nickname && !isPro` なら paywall、`isPro=true` なら tabs、それ以外は待機
  - subscriptionSynced / user.isPro の変化で再試行
  - `BRAND_HARD_TIMEOUT_MS = 7000ms` のハードタイムアウト。到達時は paywall ではなく `(tabs)` にフォールバック

**PR3 — AppState active 再取得 + configure 先行**:
- mount 直後に `subscriptionClient.initialize()` を loadUser と並列開始（_initPromise で集約されるため重複実行は安全）
- `AppState.addEventListener('change', ...)` で active 遷移時に `getSubscriptionStatus` 再取得 + 必要に応じて `updateUser({isPro: true})`

### 変更ファイル
- 新規: `stores/subscriptionStore.ts`, `hooks/paywall/usePaywallSubscriptionGuard.ts`
- 新規テスト: `stores/__tests__/subscriptionStore.test.ts`, `hooks/paywall/__tests__/usePaywallSubscriptionGuard.test.ts`
- 変更: `hooks/useAppInitialization.ts`, `app/brand.tsx`, `hooks/paywall/usePaywallOrchestration.ts`
- テスト更新: `hooks/__tests__/useAppInitialization.test.ts` (+7), `app/__tests__/brandRouting.test.tsx` (+7), `app/__tests__/BrandScreen.routing.test.tsx` (beforeEach で markSynced), `hooks/paywall/__tests__/usePaywallOrchestration.test.ts` (+subscription guard describe), `.retry.test.ts` (mock 拡張)

### テスト結果
- **272 スイート / 1918 テスト全通過**（前回比 +60 テスト）
- lint: 21 errors（全て既存の display-name / unescaped-entities。変更ファイル起因のエラーなし）

### 実機検証推奨シナリオ（未実施）
1. 購入済みアプリをキル → 再起動: ブランド画面後に直接 `/(tabs)` へ（ペイウォール非表示）
2. 未購入で同操作: ペイウォール表示（現行挙動維持）
3. オフライン起動: 7秒後に `/(tabs)` フォールバック（ペイウォール非表示）
4. バックグラウンド 30h 経過後 foreground: getCustomerInfo 再取得で isPro 維持
5. TestFlight での1〜4 再現確認（Sandbox レシート遅延対策）

### 注意
- brandRouting.test.tsx で react-test-renderer の act() warning が発生（afterEach の store.reset() が unmount 前に呼ばれる）が、テストは全通過。必要なら act() ラップで抑止可能
- 変更は Breaking: 既存の brand.tsx は `subscriptionSynced=false` 未 sync の間は paywall にも飛ばない仕様（意図的）。オフライン等で 7秒フォールバック後 tabs に入るため、tabs 側でも free ユーザーに対しては既存の paywall 誘導動線が機能すること前提

### 未コミット状態
ユーザー側レビュー後にコミット予定。PR 分割案: PR1(guard のみ) → PR2(store + brand + listener) → PR3(AppState + early configure) の3段階を推奨（計画書記載）。

---

## 2026-04-24: プロダクトコンセプトシート v1.1 改訂

### 作業内容
`documents/Rewire_プロダクトコンセプトシート.md` を現状実装に合わせて全面改訂。「SNSフリクション」「3層防御」「3段階ペイウォール」など未実装機能の記述を削除し、Safari Web Extension・SOSボタン・Reflection Sheet・Neural Cosmos バッジなど現行機能を正確に反映した。natural-japanese skill を用いて文体も整えた。

### 主な変更点
- **ヘッダー**: 最終更新 `2026-04-24`、Document Version `1.1` に更新
- **§1 プロダクトビジョン**: 「SNS → ポルノ」チェーン前提の記述を削除。プロダクト原則5項目のうち「上流で止める」「理性スイッチング」を「衝動を呼吸で受け流す」「見える化で自覚させる」に差し替え
- **§2 ペルソナ**: one sec 使用履歴と「SNSでポルノスター投稿」トリガーを削除
- **§3 VPC**: Products & Services を S1=Safari Web Extension / S2=SOSボタン→呼吸 / S3=リカバリー / S4=Reflection Sheet / S5=ストリーク＆ダッシュボード / S6=Neural Cosmos バッジ / S7=学ぶタブ に書き換え。Pain Relievers / Gain Creators も現行機能ベースに再構成
- **§4 ドーパミンチェーン**: 6段階のSNS→ポルノチェーンを5段階（SNS非前提）に変更。§4.3「3層防御」を「2層防御+リカバリー」に書き換え
- **§5 利用シーン**: SNSフリクション前提のシーンを Safari Web Extension → /panic → 呼吸セッション / SOSボタン / Reflection Sheet の現行動線に再構成
- **§7 科学的根拠**: §7.1 one sec / PNAS 論文を削除し「刺激制御（Stimulus Control）」に差し替え。§7.2 Urge Surfing / Implementation Intention を現行 SOS→呼吸 の実装に具体紐付け。§7.3 セルフモニタリング効果を新規追加（Reflection Sheet の根拠）
- **§8 競合比較**: one sec 列を削除し Brainbuddy / iOS スクリーンタイム との3者比較に整理。差別化軸を「アダルトドメイン自動ブロック」「ブロック→呼吸への連続導線」「Neural Cosmos 18バッジ」に再構成
- **§9 ユーザーストーリー**: US-01（SNSフリクション）・US-06（ブロック解除時目標表示）を削除し、現行機能ベースの US-01〜US-07 に全面書き換え。サポートストーリーも学ぶタブ・履歴画面・環境音プレーヤー等の実装に対応させた
- **§10 課金設計**: 3段階ペイウォール（¥680/¥5,400 → 割引¥2,500 → 無料トライアル）の記述を削除。現行単一構成（Monthly ¥680 / Yearly ¥5,400）のみに書き換え。Free/Pro 差別化表も削除。Guideline 5.6 対応で割引/トライアルが休止中である旨を補足
- **付録用語集**: 「3層防御」「フリクション（one sec）」「理性スイッチング」を削除。「Safari Web Extension」「SOSボタン」「Reflection Sheet」「リカバリーフロー」「Neural Cosmos バッジ」「2層防御」を追加
- **末尾の音声入力痕跡**（444行目以降のAV/ドーパミン解説文）を削除

### natural-japanese 適用
- 「〜することができる」→「〜できる」
- 受動態過剰（「〜されている」）→能動態
- 「〜のために」の多用を削除
- 英語直訳調の長文を読点で区切り or 分割

### 変更ファイル
- `documents/Rewire_プロダクトコンセプトシート.md` のみ（他ファイル変更なし）

### ユーザー確認済み事項
1. SNSフリクション → 完全削除
2. 末尾の音声入力痕跡 → 削除
3. 3段階ペイウォール → 現行単一構成に完全書き換え

### 未コミット状態
コンセプトシート修正のみ。ユーザーレビュー後にコミット予定。

## 2026-04-26: Safari 拡張「設定が必要です」誤表示の修正 + アラート位置変更

### 作業内容
ユーザーが iOS 設定で Safari 拡張の3トグル（機能拡張ON / プライベート ON / 全Webサイト=許可）を全て確認しているにもかかわらず、Profile タブで「Safari 拡張の設定が必要です」アラートが出続ける問題を調査・部分修正。さらにアラートの表示位置を Achievements カードの下に移動。

### 根本原因（リサーチ + コード読み）
1. **stale な ios/ ファイル**: `plugins/withSafariWebExtension.js` には heartbeat 実装が含まれているが、実際の `ios/SafariWebExtension/{background.js, SafariWebExtensionHandler.swift}` は古い版（heartbeat 未実装、`hasAllUrls` 書き込み欠落）。`npx expo prebuild --clean -p ios` で再生成が必要。
2. **iOS Safari Service Worker 死亡問題（既知）**: iOS 17.4 以降、MV3 service_worker が 30-45s で permanently killed され、`webNavigation`/`alarms` も二度と発火しない（Apple Dev Forums 多数報告）。
3. **`permissions.contains` の Safari 実装が不安定**: `<all_urls>` を host_permissions(required) で要求しているのに API が一貫せず。

### 今回の修正範囲（Step 1+2+window のみ。Step 3/4 は再発時に着手）
- `app/(tabs)/profile.tsx`: `SafariExtensionAlertCard` を `AchievementsLinkCard` の下に移動
- `app/(tabs)/__tests__/ProfileScreen.test.tsx`: 表示順序検証テスト1件追加（Red→Green 確認済み）
- `modules/expo-safari-web-extension/ios/SafariWebExtensionStatusModule.swift`: active window 6h → 24h
- memory `safari-extension-detection.md`: 24h 化と stale ios files 落とし穴を記録

### hiro が実機で実行する作業
1. `npx expo prebuild --clean -p ios` を実行して `ios/SafariWebExtension/{background.js,SafariWebExtensionHandler.swift}` を再生成
2. `npm run ios` または EAS Build internal で実機ビルド
3. Safari で任意ページに遷移 → アプリ復帰 → アラートが消えることを確認
4. もし消えない場合は Service Worker 死亡対策（plan の Step 3）に進む

### テスト
- 272スイート / 1919テスト 全パス
- 新規テスト: 「status=disabled のとき、警告カードは Achievements より後ろに表示される」（toJSON 文字列順比較）
- lint: 既存 21 errors（display-name/unescaped-entities）のみ。新規エラーなし

### 変更ファイル
- `app/(tabs)/profile.tsx`
- `app/(tabs)/__tests__/ProfileScreen.test.tsx`
- `modules/expo-safari-web-extension/ios/SafariWebExtensionStatusModule.swift`
- `.claude/projects/-Users-arimurahiroaki-rewire/memory/safari-extension-detection.md`
- `.claude/MEMORY.md`（このファイル）

### 注意事項・未完了タスク
- Service Worker 30-45s 死亡問題は将来 PR 候補。`background: { scripts: [...], persistent: false }` 化 + content_script からの heartbeat fallback + `hasAllUrls: true` ハードコードを検討
- 24h ウィンドウは仮置き。実機運用で「拡張オフ→24h healthy 維持」が UX 上問題になるなら 12h などに調整
- 計画書: `~/.claude/plans/users-arimurahiroaki-downloads-2026-04-prancy-spring.md`

### 未コミット状態
ユーザー（hiro）レビュー後にコミット予定。プリビルドは hiro 自身が実行する。

## 2026-04-26（追補）: Step 3 実装 — Service Worker 死亡対策フル投入

### 経緯
Step 1+2+window 24h 化を実機で検証 → prebuild 後も誤『Safari 拡張の設定が必要です』が再現。
ユーザーが拡張をオフ→オン全部し直しても変化なし。Service Worker 死亡 + `permissions.contains` 不安定の両方が顕在化したと判断し、計画書 Step 3 を即時着手。

### 修正内容

#### `plugins/withSafariWebExtension.js`
1. **manifest 変更**: `background: { service_worker }` → `background: { scripts: ['background.js'], persistent: false }`
   - Apple Forums で広く使われている iOS Safari MV3 SW 死亡の暫定回避策
2. **`generateBackgroundJs`**:
   - `readHasAllUrls` 関数（`permissions.contains` 経由）を完全削除
   - `sendHeartbeat` 内の hasAllUrls を **`true` ハードコード**（manifest.host_permissions に `<all_urls>` を required で書いている以上、インストール時点で必ず許可済み）
   - `runtime.onMessage` リスナーに `contentHeartbeat` 分岐を追加 → `maybeHeartbeat()` を呼んで native message 化
3. **`generateContentJs`**:
   - 全ページロード時（ブロック判定の有無に関わらず）に `runtime.sendMessage({ type: 'contentHeartbeat' })` を発火 → background script を起動して heartbeat を送らせる保険
4. **`generateSwiftHandler`**:
   - `import os.log` 追加。`OSLog(subsystem: "rewire.app.com", category: "safari-ext-handler")` で診断ログ
   - 受信メッセージの type / ts / hasAllUrls / App Group accessibility を `os_log` で出力。Console.app で `subsystem == rewire.app.com` フィルタで観察可能

#### `modules/expo-safari-web-extension/ios/SafariWebExtensionStatusModule.swift`
- `import os.log` + `OSLog(subsystem: "rewire.app.com", category: "safari-ext")` 追加
- `getExtensionStatus` 内で lastActive / delta / window / isEnabled / hasAllUrls を `os_log` で出力

### テスト
- `plugins/__tests__/withSafariWebExtension.test.js` を 4 件追加 + 既存 2 件を改修（TDD: Red→Green 確認）
  - manifest.background.scripts/persistent の検証
  - `hasAllUrls: true` ハードコードの検証
  - `contentHeartbeat` 分岐の検証
  - content.js が `contentHeartbeat` を送ることの検証
  - Swift handler に `os_log` が含まれることの検証
- 全体: 272スイート / 1922テスト 全パス（+3テスト, +0スイート）
- lint: 既存 21 errors のみ。新規エラー・警告なし

### hiro 側で次にやる作業
1. `npx expo prebuild --clean -p ios` — 古い `ios/SafariWebExtension/{background.js, content.js, manifest.json, SafariWebExtensionHandler.swift}` を全部上書き
2. `cd ios && pod install && cd ..`
3. `npx expo run:ios --device` — 実機にインストール
4. アプリ起動 → Safari で example.com など任意ページに遷移 → アプリ復帰 → アラートが消えれば成功
5. Console.app で `subsystem == rewire.app.com` をフィルタしてログ観察:
   - `safari-ext-handler` カテゴリ: `recv type=heartbeat ts=... hasAllUrls=true groupOK=true` が出れば heartbeat が届いている
   - `safari-ext` カテゴリ: アプリ前面化のたびに `status: lastActive=... isEnabled=true hasAllUrls=true` が出れば正常

### もし再発した場合のデバッグ手順
- Console.app で `subsystem == rewire.app.com` をフィルタ
- `recv type=...` が一切出ない → 拡張の background が完全に死んでいる（さらに非常手段が必要）
- `recv` は出るが `groupOK=false` → App Group 設定が破綻している（entitlements 再確認）
- `recv` は出るが Profile タブで `isEnabled=false` → App Group の lastActiveAt 読みで suite が作れていない（同上）

### 変更ファイル
- `plugins/withSafariWebExtension.js`（manifest / background.js / content.js / Swift handler の生成全般）
- `plugins/__tests__/withSafariWebExtension.test.js`
- `modules/expo-safari-web-extension/ios/SafariWebExtensionStatusModule.swift`
- `.claude/MEMORY.md`（このファイル）

### 注意事項
- `background: { scripts, persistent: false }` は厳密には MV2 syntax だが、Safari は MV3 manifest 内でも受け入れる。Chrome/Firefox での動作は未検証（Safari 専用）
- content_script からの `runtime.sendMessage` は SW を wake する。完全に死んだ SW を蘇生できないという報告もあるので、`scripts` (non-persistent) と組み合わせることが重要
- iOS 26.2+ で `SFSafariExtensionManager` に近い native API が出る予定だが、deployment target 15.0 では使えない

### 未コミット状態
ユーザーレビュー後にコミット予定。


---

## 2026-04-27 (自動: 日次アナリティクスパイプライン)

### 作業内容の要約
- スケジュールタスク `rewire-daily-analytics` を実行
- ASC API からのデータ取得を試行：`POST /v1/analyticsReportRequests` が **409 Conflict**（ONGOING リクエスト既存）
- 既存 `request_id = 394c257b-c76e-4779-9257-30c74024383a` を使って再フェッチ → 成功
  - `data/analytics/2026-04-26/` に Standard / Detailed の TSV を保存
- `analyze_funnel.py` を `--date 2026-04-26` で実行 → ASC の 2 日処理ラグにより 04-26 の行が TSV に存在せず、全項目 0 のレポートが生成された
- Python で TSV を直接集計し、最新データ日付（2026-04-25）と過去 10 日窓のメトリクスでレポート/JSON を上書き再生成

### 結果サマリー
- 10 日間（04-16 → 04-25）合計: Impressions=71, PageViews=25, Taps=4
- 平均 PVR=35.21%（RevenueCat ベンチマーク 25–35% の上限）
- 04-25 単日: Impressions=7, PageViews=9, Taps=0 → PVR が >100% になっているのは ASC のソース帰属モデルによるもの（PV は impression 起点以外からも発生）
- 次のボトルネック候補: **Page View → Tap**（10 日で 25 PV から 4 Tap = 約 16%）
- TikTok / Web Referral からの流入はゼロ（オーガニック検索のみ）

### 未完了タスク・次回やるべきこと
- `scripts/analytics/main.py` を改善し、409 が返ったら自動的に既存 request_id を `GET /v1/analyticsReportRequests?filter[app]=...` で取得して再試行するロジックを追加（毎日手作業で `--request-id` を渡さなくて済むように）
- `analyze_funnel.py` を「指定日付に行が無かったら最新の利用可能な日付にフォールバック」する挙動に改修（現状は全 0 の空レポートを書き出してしまう）
- 04-26 当日のデータは ~04-28 以降に TSV へ反映される見込み。次回実行で再集計されること

### 発見した問題点・注意事項
- `daily-report-2026-04-24.md` / `daily-report-2026-04-25.md` も同じラグ問題で全 0 のまま残っている（過去ログとして保持）
- `request_id` をローカルにキャッシュしていないため、毎回 409 → 手動で ID 指定が必要

### 変更ファイル
- `data/analytics/2026-04-26/app_store_discovery_and_engagement_standard.tsv`（新規）
- `data/analytics/2026-04-26/app_store_discovery_and_engagement_detailed.tsv`（新規）
- `data/analytics/2026-04-26/manifest.json`（新規）
- `docs/analytics/daily-metrics-2026-04-26.json`（新規・Python 直接生成）
- `docs/analytics/daily-report-2026-04-26.md`（新規・Python 直接生成）
- `.claude/MEMORY.md`（このファイル）

## 2026-04-29: Safari 拡張「設定が必要」モーダル誤検知の修正
**症状**: Safari 設定で拡張機能をオンにしているのにプロフィールタブで「Safari拡張の設定が必要です」アラートが出続ける。
**原因**: `SafariWebExtensionStatusModule.swift` が `isEnabled = (now - lastActiveAt < 24h)` で判定していたが、iOS には拡張の有効状態を返す公開 API が無く（FB9186842 未対応、Apple Forum 758346 SW 死活問題）、24h Safari を使わなければ偽陰性 disabled になっていた。
**修正方針**: 二値判定をやめ、JS 側で `lastActiveAt` を一次ソースに 3 状態モデル（`never` / `active` / `stale`）+ 既存 `needsAllUrls` に変更。
**変更ファイル**:
- `lib/safariWebExtension/deriveStatus.ts` — 状態モデル拡張、`ACTIVE_WINDOW_SECONDS = 6h` を export
- `lib/safariWebExtension/setupCompletion.ts`（新規）— `safariExtension.setupCompletedAt` を AsyncStorage に保存/読み出し
- `hooks/settings/useWebExtensionStatus.ts` — `recheck()` を return、grace period（90s）内は `never→active` に昇格
- `hooks/safariWebExtension/useSafariWebExtensionSetup.ts` — step 4 到達時に `setSetupCompletedAt(Date.now()/1000)` を呼ぶ
- `components/profile/SafariExtensionAlertCard.tsx` — `variant: 'warning' | 'info'` prop 追加、`info` は primary 色 + refresh アイコン
- `app/(tabs)/profile.tsx` — `never`/`needsAllUrls`→警告、`stale`→info プロンプト（recheck）、`active`/`checking`→ToolCard
- `modules/expo-safari-web-extension/ios/SafariWebExtensionStatusModule.swift` — `activeWindowSeconds` 24h→6h（JS 側と整合、`isEnabled` はレガシー残置）
- `locales/ja.ts` / `locales/en.ts` — `safariWebExtension.refresh.{title,description,recheckAction}` 追加、`alert.descriptionDisabled` を「未検出」寄りに微調整、`alert.title` を「Safari 拡張が検出できません」に変更
**テスト**: `deriveStatus.test.ts`（6件 / 境界値含む）、`useWebExtensionStatus.test.ts`（9件 / grace period・recheck）、`SafariExtensionAlertCard.test.tsx`（8件 / variant）、`ProfileScreen.test.tsx`（10件 / never・stale・active 分岐）、`useSafariWebExtensionSetup.test.ts`（7件 / setSetupCompletedAt 呼び出し）
**結果**: 272 suites / 1934 tests 全件通過。lint は変更ファイルに新規エラーなし。未コミット。
**重要な注意**: 実機反映には `npx expo prebuild --clean -p ios` 必須（Swift module の活性化ウィンドウ短縮を反映するため）。Safari Web Extension の `background.scripts` + `persistent: false` は `plugins/withSafariWebExtension.js:64` で既に対応済み。
**未対応**: 隠し WKWebView による能動 heartbeat 喚起、`hasAllUrls` の native 側厳密検知（現状ハードコード true 維持）、`SFSafariExtensionManager` の iOS 提供（Apple マター）。

## 2026-04-30: カレンダーUI刷新（IMG_4643 ベース）

### 変更概要
- Streak Calendar 画面を IMG_4643 のミニマル円形セルデザインに刷新
- List タブと SegmentedControl を撤去、カレンダー単独画面に
- ホーム画面と同じ `SafeAreaWrapper` + `gradients.background` で背景統一
- 3 状態（clean / relapse / no-data）+ ストリーク開始前 / 未来日を視覚的に区別

### 影響範囲
**新規**: `lib/calendar/dayStatus.ts`, `components/history/CalendarDayCell.tsx`, `CalendarLegend.tsx`, `CalendarHeader.tsx`, `CalendarWeekDays.tsx`, `StreakCalendarHeader.tsx` + 各テスト  
**修正**: `app/index.tsx` (DEV_SKIP_ONBOARDING=true 一時的)、`app/history/index.tsx` 完全書き換え、`components/history/HistoryCalendar.tsx` 分割版へ、`app/(tabs)/_layout.tsx` から `history` タブ参照削除、`app/_layout.tsx` で history headerShown:false、`constants/colorPalettes.ts` に `streakActive` 追加、`types/theme.ts` に `streakActive: string` 追加、`locales/ja.ts` / `locales/en.ts` に `calendar.{noData, streakCalendarTitle, edit}` 追加・`historyView.*` 削除  
**削除**: `app/streak-calendar.tsx`, `app/__tests__/streak-calendar.test.tsx`, `app/(tabs)/history.tsx`, `components/history/HistoryList.tsx`, `components/history/__tests__/HistoryCalendar.key.test.tsx`, `components/ui/SegmentedControl.tsx` + テスト

### 状態判定ロジック（`getDayStatus`）
- `clean`: 記録あり・watchedPorn=false → 紫円＋白チェック
- `relapse`: 記録あり・watchedPorn=true → 赤円＋白×
- `empty-future`: 今日より未来かつ記録なし → 透明＋テキスト opacity 0.4
- `empty-pre-streak`: streakStartDate より前 → ボーダーなし完全空（ユーザー要望）
- `empty-no-data`: ストリーク開始日以降で記録なし → 細ボーダーで「未記録」を明示

### 設計ポイント
- `StreakEditModal` は `StatsRow.tsx` のパターン（`updateUser({ streakStartDate })`）を再利用
- 18 行の `app/history/index.tsx` を組立役に。`HistoryCalendar` も状態管理＋コンポジションのみで責務分離（CLAUDE.md SRP 準拠）
- 紫色は `colors.streakActive` セマンティック名で導入（dark: `#8B5CF6`、light: `#7C4DFF`）。`gradients.button[0]` の inline 参照を回避

### テスト状況
- **新規**: 8 suites / 25 tests 全通過（dayStatus 7、CalendarDayCell 6、HistoryCalendar 4、historyScreen 4、その他 4）
- **全体**: 1937 tests passed / **1 failed**（`indexRouting.test.tsx` の "DEV_SKIP_ONBOARDING=false" テストのみ — 故意のトグル切替が原因。`false` に戻せば自動で通る）
- TypeScript 型エラー新規発生ゼロ（既存 22 件は本変更無関係）
- ESLint エラー新規発生ゼロ

### ⚠️ ビルド前注意
- `app/index.tsx:8` の `DEV_SKIP_ONBOARDING = true` を **必ず `false` に戻す**
- 戻し漏れチェック: `grep "DEV_SKIP_ONBOARDING = true" app/index.tsx`
- 戻したら `indexRouting.test.tsx` も自動で通るようになる

### 未コミット
- 上記すべて未コミット。動作確認 → DEV_SKIP_ONBOARDING を false に戻す → コミットの順を推奨


---

## 2026-04-30: ストリークセレブレーションモーダル復元（+1 カウントアップ・限定トリガー）

### 目的
オンボーディング後に出ていた「連続記録が浮かび上がるモーダル」を復元。ただし、過去版の 0→N の長いカウントアップを **+1 だけ**（例: 9→10）に変更し、出現頻度を絞ってしつこさを排除。

### トリガー条件（2 箇所のみ）
1. **A**: ReflectionSheet で「ポルノを見ていません」(`watchedPorn=false`) と申告した直後
2. **B**: 申告がなくても、日付更新でストリークが +1 されたタイミングでアプリを開いたとき

### アーキテクチャ（SRP 4 層）
- `features/streak/celebrationPolicy.ts` — 純関数 `shouldCelebrate({ currentStreak, lastCelebrated, hydrated })` と `computeFromStreak(currentStreak, lastCelebrated)`
- `lib/storage/celebrationStorage.ts` — `getLastCelebratedStreak() / setLastCelebratedStreak(n)`。settings キー相乗り（`SettingsData.lastCelebratedStreak`）
- `hooks/streak/useStreakCelebration.ts` — hydration ガード、auto-trigger（B）、明示 trigger（A）、dismiss、relapse クランプ、初回マイグレーション
- `components/streak/StreakCountUpModal.tsx` — Modal（fade）+ StreakNumber + TIER_CONFIGS に基づくエフェクト（ParticleEffect/GlowOverlay/ConfettiEffect）+ StreakSubText + 閉じるボタン + Haptics

### A の橋渡し（sheet → dashboard）
`useReflectionSheet` ストアに `pendingCelebrationStreak: number | null` と `clearPendingCelebration()` を追加。`selectUrgeLevelAndSubmit` 成功時に `watchedPorn === false` なら `calculateStreak(streakStartDate, checkins)` で算出した値をセット。dashboard 側 `app/(tabs)/index.tsx` で `useEffect` 監視し、sheet が閉じた瞬間に `trigger()` → `clearPendingCelebration()`。

### 重要な設計判断
1. **+1 アニメ強制**: `computeFromStreak = max(0, currentStreak - 1)`。lastCelebrated が小さくても巨大カウントアップを発生させない
2. **relapse クランプ**: 起動時に `currentStreak < lastCelebrated` なら `lastCelebrated = currentStreak` で保存
3. **初回マイグレーション**: `lastCelebratedStreak === null`（既存ユーザー）は初回 hydration で `currentStreak` を保存して何も表示しない（アップデート直後の派手な表示を防ぐ）
4. **二重発火ガード**: `visibleRef` で表示中は再 trigger しない
5. **duration 短縮**: `COUNT_UP_ANIMATION.singleStepDuration: 700` を新規追加。`useCountUpAnimation` は targetStreak - fromStreak === 1 のとき固定 700ms

### 改修ファイル
- `hooks/streak/useCountUpAnimation.ts` — `fromStreak?: number = 0` 引数追加。`useSharedValue(fromStreak)` に変更。+1 時は singleStepDuration 使用
- `components/streak/StreakNumber.tsx` — `fromStreak?: number` props 追加
- `constants/streakCelebration.ts` — `COUNT_UP_ANIMATION.singleStepDuration: 700` 追加
- `hooks/reflection/useReflectionSheet.ts` — pendingCelebrationStreak / clearPendingCelebration 追加
- `app/(tabs)/index.tsx` — useStreakCelebration + StreakCountUpModal 統合
- `locales/ja.ts`, `locales/en.ts` — `streak.celebrationDismiss`（'素晴らしい！' / 'Awesome!'）追加

### 新規ファイル
- `features/streak/celebrationPolicy.ts` + `__tests__/celebrationPolicy.test.ts` (13 tests)
- `lib/storage/celebrationStorage.ts` + `__tests__/celebrationStorage.test.ts` (7 tests)
- `hooks/streak/useStreakCelebration.ts` + `__tests__/useStreakCelebration.test.ts` (8 tests)
- `components/streak/StreakCountUpModal.tsx` + `__tests__/StreakCountUpModal.test.tsx` (7 tests)

### テスト
- 関連 18 suites / 158 tests 全通過
- 全体: 279 suites / 1978 tests 通過、1 failed（`indexRouting.test.tsx` = 既知の post-purchase-onboarding 関連、変更無関係）
- lint: 新規エラーゼロ（変更前 24 errors / 408 warnings のまま）

### 注意点（次回以降のメンテ）
- `StreakCountUpModal` 関連のテストでは Haptics モックを `mockResolvedValue(undefined)` で Promise を返す形にすること（`.catch()` を使うため）
- `useCountUpAnimation` を使う既存 `StreakNumber` には影響なし（`fromStreak` はデフォルト 0）
- AsyncStorage `settings` キーに `lastCelebratedStreak: number` が増えた。既存の `lastReflectionDate` 等と共存
- `useReflectionSheet` の getState() で user/checkins を取得しているため、テストモックで両ストアを渡す必要あり
- 既存ユーザーが初回起動した時は表示されない（仕様）。次回 +1 されたタイミングから表示される

### 未コミット
- 上記すべて未コミット。Dev build / シミュレーターで A/B 両シナリオ手動確認 → コミット推奨
- 手動 E2E:
  - **A**: ReflectionSheet で「見ていません」→ urge → 完了 → モーダル自動表示
  - **B**: settings.lastCelebratedStreak を currentStreak - 1 に手動セット → 再起動 → 自動表示
  - **抑止**: dismiss 後再起動 → 出ない
  - **relapse**: 「見ました」→ recovery → モーダル出ない → 翌日 +1 で出る

## 2026-04-30: post-purchase オンボーディング「ブロックが作動しなかったようです」誤判定の修正

### 課題
DemoStep（step=2）で実際にブロックが発火し /panic→/breathing→戻るのフローを通っても、`showRetryHint=true` で「ブロックが作動しなかったようです」が表示され、CompleteStep に自動進行しなかった。

### 根本原因
1. 検知が `AppState.addEventListener('change')` の 1 回限り
2. `lastActiveAt`（heartbeat でも更新）でしか判定しておらず「ブロック発火」固有の信号が無い
3. AppState コールバックと `useNotificationDeepLink` の `router.push('/panic')` が競合
4. `useFocusEffect` の callback closure が古い `blockFired` を見るため、blockFired=true への遷移時に `goToNext` がトリガーされない
5. `setBlockFired(false)` を一発打つと grace period 無しで永続表示される

### 実装内容
**Phase 1: ネイティブ「ブロック発火」専用シグナル**
- `ios/SafariWebExtension/SafariWebExtensionHandler.swift` — `lastBlockedKey = "rewire.webExtension.lastBlockedAt"` 追加。`msgType == "blockedAccess"` のときのみ `defaults?.set(now, forKey: lastBlockedKey)`
- `modules/expo-safari-web-extension/ios/SafariWebExtensionStatusModule.swift` — `lastBlockedAt` を返却（秒、未発火 0）
- `lib/safariWebExtension/types.ts` — `SafariWebExtensionStatus.lastBlockedAt: number` 追加
- `lib/safariWebExtension/safariWebExtensionBridge.ts` — `lastBlockedAt` パース、`STUB_STATUS` 拡張

**Phase 2: 検知ロジック分離 + grace period**
- `hooks/postPurchaseOnboarding/useDemoBlockDetection.ts`（新規）— `registerTestStart() / evaluate() / reset() / blockFired` を expose。`lastBlockedAt * 1000 >= startMs` または `panicNotificationTracker.getLastPanicNotifiedAt() >= startMs` で true。grace period（デフォルト 60s）内は false 確定を保留。一度 true になったら sticky
- `lastActiveAt` ではなく `lastBlockedAt` を判定軸にしたため heartbeat 由来の誤検知が消えた

**Phase 3: パニック通知を成功シグナルとして併用**
- `lib/safariWebExtension/panicNotificationTracker.ts`（新規）— in-memory モジュール。`getLastPanicNotifiedAt() / recordPanicNotification(ms?) / reset()`
- `hooks/useNotificationDeepLink.ts` — `route === '/panic'` を push する直前に `panicNotificationTracker.recordPanicNotification()` を呼ぶ。「Safari→ブロック→通知タップ→/panic」を通った瞬間に確実に成功判定が立つ

**Phase 4: 画面側のワイヤリング**
- `app/post-purchase-onboarding/index.tsx` — 旧 `useState<blockFired>` / `useRef<lastDemoOpenAtRef>` / AppState 内検知 を削除し `useDemoBlockDetection()` に置換。`useFocusEffect` は再評価 (`evaluate()`) のみ実行、`goToNext` への自動進行は `useEffect([step, blockFired])` に分離（closure stale 問題を解消）

### テスト
- `lib/safariWebExtension/__tests__/safariWebExtensionBridge.test.ts` — `lastBlockedAt` 検証 +2 ケース
- `lib/safariWebExtension/__tests__/panicNotificationTracker.test.ts`（新規）— 4 ケース
- `hooks/__tests__/useNotificationDeepLink.test.ts` — `/panic` での記録、その他では非更新 +2 ケース
- `hooks/postPurchaseOnboarding/__tests__/useDemoBlockDetection.test.ts`（新規）— 9 ケース
- `app/post-purchase-onboarding/__tests__/PostPurchaseOnboardingScreen.test.tsx` — AppState/再フォーカス/grace period の 3 ケース追加。AppState モック + `panicNotificationTracker.reset()` を beforeEach に追加
- 全体: 284 スイート / 2009 テスト（既存の indexRouting=失敗のみ、変更と無関係）

### 変更ファイル
- 新規: `hooks/postPurchaseOnboarding/useDemoBlockDetection.ts`, `lib/safariWebExtension/panicNotificationTracker.ts`, 各テスト
- 修正: `app/post-purchase-onboarding/index.tsx`, `hooks/useNotificationDeepLink.ts`, `lib/safariWebExtension/types.ts`, `lib/safariWebExtension/safariWebExtensionBridge.ts`, `ios/SafariWebExtension/SafariWebExtensionHandler.swift`, `modules/expo-safari-web-extension/ios/SafariWebExtensionStatusModule.swift`

### 重要な注意点
- **ネイティブ拡張変更のため Dev Client の再ビルドが必須**（`SafariWebExtensionHandler.swift` と `SafariWebExtensionStatusModule.swift`）。Hot reload では新しい `lastBlockedAt` が反映されない
- App Group `group.rewire.app.com` は変えていない
- `panicNotificationTracker` は in-memory のみ（プロセス再起動でリセット）。post-purchase の単一セッション内で完結する設計
- grace period は 60 秒。短すぎたら `useDemoBlockDetection({ graceMs: ... })` で調整可能
- `app/index.tsx:10` の `DEV_PREVIEW_POST_PURCHASE = true` は本番ビルド前に `false` に戻す

### 未コミット
- 上記すべて未コミット。実機 Dev Build で以下のシナリオで検証 → コミット推奨
- **シナリオ A** 通知タップ経由: DemoStep → 「ブロックをテスト」→ Safari → ブロック対象リンクタップ → ブロックページ → 通知タップ → /panic → 深呼吸 → ×→/panic→×→ オンボーディング → **CompleteStep へ自動遷移**
- **シナリオ B** ブロックページの「Rewire を開く」ボタン経由: 同上、`rewire://panic` 経由でも CompleteStep に到達
- **シナリオ C** grace period 内 (60s 未満) で戻る: 「ブロックをテスト」→ Safari→何もせず戻る → retryHint 出ない（null のまま）
- **シナリオ D** grace period 経過: 60 秒待つ → retryHint が出る

## 2026-05-01: Post-Purchase Onboarding に右上 Skip ボタン追加

### 変更内容
通常オンボーディング (`/onboarding`) と同じ UI 一貫性で、`/post-purchase-onboarding` のヘッダー右上にスキップボタンを設置。step 0/1/2 で表示、step 3 (Complete) では非表示。

### 実装の要点
- `app/post-purchase-onboarding/index.tsx`: `headerRow` 構造追加（左 spacer + 右 Skip）。`handleSkip` は `logEvent('post_purchase_onboarding_skipped', { fromStep: step })` → `markCompleted()` → `router.replace(ROUTES.tabs)`
- `useTheme` / `useLocale` を import。`t('common.skip')` を再利用（新規キーなし）
- スタイルは onboarding と同一: `headerRow` (justifyContent: space-between, minHeight 32), `skipText` (FONT_SIZE.md, colors.textSecondary)
- DemoStep 内部の既存 Skip ボタンとは並存（UI 一貫性優先、整理は別 PR）

### テスト
- `app/post-purchase-onboarding/__tests__/PostPurchaseOnboardingScreen.test.tsx` に 6 tests 追加（描画 4 + 動作 2）
- `useTheme` / `useLocale` モック追加
- 全 14 tests / 当該スイート pass。フル: 285 suites / 2030 tests / 1 failed (`indexRouting.test.tsx` は既存 failure、本変更とは無関係)
- lint: 該当ファイルに新規エラーなし（test file の `require()` warning は既存パターンと同等）

### 変更ファイル
- `app/post-purchase-onboarding/index.tsx` (実装)
- `app/post-purchase-onboarding/__tests__/PostPurchaseOnboardingScreen.test.tsx` (テスト)

### 未コミット
- 上記 2 ファイルとも未コミット
- 同日朝の他作業（検知ゲート撤去 + 確認モーダル）と一緒の作業ツリーに乗っているため、コミット粒度は別途判断

## 2026-05-10 — rewire-daily-analytics scheduled run

### Summary
- Fetched ASC analytics for 2026-05-09 request window via `python -m scripts.analytics.main`.
- Initial run hit `409 Conflict` on `POST /v1/analyticsReportRequests` — an ONGOING request already exists. Re-ran with `--request-id 394c257b-c76e-4779-9257-30c74024383a` (looked up via `GET /v1/apps/6759087214/analyticsReportRequests`).
- Saved 3 TSVs into `data/analytics/2026-05-09/` (App Store Discovery & Engagement Standard + Detailed, Retention Messaging).
- Ran `~/.claude/skills/app-analytics/scripts/analyze_funnel.py` → produced `docs/analytics/daily-report-2026-05-09.md` BUT with all zeros (column mapping bug — see below).
- Generated supplementary corrected report `docs/analytics/daily-report-2026-05-08-corrected.md` + `daily-metrics-2026-05-08-corrected.json` from manual aggregation.

### Real numbers (most recent processed day, 2026-05-08)
- Impressions 27 · Page views 2 · Taps 0 · Page-view rate **7.4%** (vs 25–35% benchmark — 🔴 below).
- 100% of impressions came from App Store search.
- Top territories by impressions: IL (16), TH (6), AZ (2), JP (2), ID (1). Only AZ produced page views.
- Retention (2026-05-07): 1 cancel-sheet page view, 1 cancellation.
- 7-day rolling: 96 impressions, 16 page views, 4 taps.

### Issues found / next-actions
1. **`scripts/analyze_funnel.py` is broken** — its column_mappings expect headers like `Impressions`, `Product Page Views`, `App Units`, but ASC TSVs use `Event` + `Counts` rows. Refactor to group by `Event` and sum `Counts`.
2. **`scripts/analytics/main.py` does not handle 409 / re-use existing report request.** Should: on 409, GET `/v1/apps/{app_id}/analyticsReportRequests?filter[accessType]=ONGOING` and reuse the returned request id automatically (and persist it).
3. **Missing report categories** — Downloads / Trial Starts / Paid Conversions / Active Subscriptions are not in the fetched files. `REPORT_CATEGORIES` in `scripts/analytics/asc_client.py` likely needs `APP_USAGE` and `COMMERCE` / Subscription Events to make the full funnel computable.
4. **Volume is tiny** (~20–30 impressions/day) — conversion rates are noisy; consider Search Ads or short TikTok burst before drawing optimization conclusions.

### Files touched
- `data/analytics/2026-05-09/*.tsv` (created by ASC fetch)
- `docs/analytics/daily-report-2026-05-09.md` (created by analyze_funnel.py — zeros, misleading)
- `docs/analytics/daily-metrics-2026-05-09.json` (created by analyze_funnel.py — zeros)
- `docs/analytics/daily-report-2026-05-08-corrected.md` (NEW, manual aggregation)
- `docs/analytics/daily-metrics-2026-05-08-corrected.json` (NEW)

## 2026-05-21

### 作業内容（Daily Rewire App Analytics Pipeline — 自動スケジュール実行）
- ASC analytics を `python3 -m scripts.analytics.main` で取得（processing date 2026-05-20 ぶん）。
- 初回実行は `409 Conflict`（`POST /v1/analyticsReportRequests`、ONGOING request 既存）。`--request-id 394c257b-c76e-4779-9257-30c74024383a` を付けて再実行し成功（id は `GET /v1/apps/6759087214/analyticsReportRequests` で取得）。
- `data/analytics/2026-05-20/` に 2 TSV を保存（App Store Discovery & Engagement Standard, App Store Web Preview Engagement Standard）。今回は Detailed / Retention は ASC から返らず。
- `~/.claude/skills/app-analytics/scripts/analyze_funnel.py` を実行 → `daily-report-2026-05-20.md` / `daily-metrics-2026-05-20.json` 生成。だが全ゼロ（列マッピングのバグ、下記）。
- Python で手動再集計し、`daily-report-2026-05-20-corrected.md` + `daily-metrics-2026-05-20-corrected.json` を作成。

### 実数（fetched report 内のイベント日 2026-05-17〜05-19）
- 3日合計: Impressions 64 · Page views 10 · Taps 4 · ウィンドウ page-view rate **15.6%**（25–35% benchmark に対し 🔴 below）。
- 日次: 05-17 = 20imp/0pv · 05-18 = 23imp/2pv · 05-19 = 21imp/8pv（**38.1%**, 直近日のみ benchmark 超え。ただしサンプル小・ASC 最新日は未確定の可能性）。
- ソース: App Store search 57imp/10pv/3tap, App Store browse 7imp/0pv/1tap。**TikTok・web referral 由来の流入はゼロ**（全て organic）。Web Preview report は Edge/JP の 2 page view のみ。
- 地域: JP 29imp/8pv/4tap が funnel を牽引。IL 18imp/1pv（impression 多いが product page にほぼ届かず）。TH 7imp/0pv。
- ボトルネック: Impression → Page View（ウィンドウ 15.6%）。Downloads/Trial/Paid は当該レポートに含まれず計測不可。

### 発見した問題 / 次回やること（※05-08, 05-17 から未解決のまま3回連続で再発）
1. **`analyze_funnel.py` の列マッピングバグ未修正** — `Impressions`/`Product Page Views` 等の wide-format 列を期待しているが、ASC TSV は `Event`+`Counts` の long-format。`Event` でグループ化して `Counts` を合算するよう修正が必要。
2. **`main.py` の 409 ハンドリング未実装** — 409 時に既存 ONGOING request を自動 GET して再利用＆永続化すべき（毎回手動で `--request-id` 指定が必要）。
3. **レポートカテゴリ不足** — Downloads/Trial/Paid/Active Subscriptions が fetch されない。`scripts/analytics/asc_client.py` の `REPORT_CATEGORIES` に App Usage / Commerce(Subscription) を追加してフルファネルを計測可能にする。
4. 流入ボリュームが小さい（~20imp/日）ため conversion rate はノイズ大。05-19 の改善が本物か翌日以降に再確認。

### 変更したファイル
- `data/analytics/2026-05-20/*.tsv`（ASC fetch で新規作成）
- `docs/analytics/daily-report-2026-05-20.md` / `daily-metrics-2026-05-20.json`（analyze_funnel.py 生成・全ゼロ・誤り）
- `docs/analytics/daily-report-2026-05-20-corrected.md`（新規・手動集計）
- `docs/analytics/daily-metrics-2026-05-20-corrected.json`（新規・手動集計）

## 2026-05-22

### 作業内容（Daily Rewire App Analytics Pipeline — 自動スケジュール実行）
- ASC analytics を取得（processing date 2026-05-21 ぶん）。
- 初回実行はまた `409 Conflict`（`POST /v1/analyticsReportRequests`、ONGOING request 既存）。`--request-id 394c257b-c76e-4779-9257-30c74024383a` を付けて再実行し成功（id は `GET /v1/apps/6759087214/analyticsReportRequests` で取得。bare list の `GET /v1/analyticsReportRequests` は 403）。
- `data/analytics/2026-05-21/` に 2 TSV を保存（App Store Discovery & Engagement Standard, App Store Web Preview Engagement Standard）。
- `~/.claude/skills/app-analytics/scripts/analyze_funnel.py` を実行 → `daily-report-2026-05-21.md` / `daily-metrics-2026-05-21.json` 生成。だがまた全ゼロ（列マッピングのバグ）。
- Python で手動再集計し、`daily-report-2026-05-21-corrected.md` + `daily-metrics-2026-05-21-corrected.json` を作成。

### 実数（fetched report 内のイベント日 2026-05-18〜05-20）
- 3日合計: Impressions 70 · Page views 10 · Taps 2 · ウィンドウ page-view rate **14.3%**（25–35% benchmark に対し 🔴 below）。
- 日次: 05-18 = 23imp/2pv（8.7%）· 05-19 = 21imp/8pv（**38.1%**, benchmark 超え）· 05-20 = 26imp/0pv（最新日・未確定の可能性大）。最新の完全日は 05-19 とした。
- 前ウィンドウ（05-17〜05-19）と 05-18/05-19 が重複するため厳密な WoW 比較は不可。impression 64→70 微増、page-view rate 15.6%→14.3% でほぼ横ばい。
- ソース: App Store search 59imp/10pv/1tap（pv rate 17.0%）, App Store browse 11imp/0pv/1tap。**TikTok・web referral 由来の流入はゼロ**（全て organic）。Web Preview report は 2 page view のみ。
- 地域: JP 28imp/8pv/2tap が funnel を牽引（pv rate 28.6%）。TH 18imp/0pv・IL 17imp/1pv（impression 多いが product page にほぼ届かず）。
- ボトルネック: Impression → Page View（ウィンドウ 14.3%）。Downloads/Trial/Paid は当該レポートに含まれず計測不可。

### 発見した問題 / 次回やること（※05-08, 05-17, 05-20 から未解決のまま4回連続で再発）
1. **`analyze_funnel.py` の列マッピングバグ未修正** — wide-format 列を期待しているが ASC TSV は `Event`+`Counts` の long-format。`Event` でグループ化して `Counts` を合算するよう修正が必要。
2. **`main.py` の 409 ハンドリング未実装** — 409 時に既存 ONGOING request を自動 GET して再利用＆永続化すべき（毎回手動で `--request-id` 指定が必要）。
3. **レポートカテゴリ不足** — Downloads/Trial/Paid/Active Subscriptions が fetch されない。`scripts/analytics/asc_client.py` の `REPORT_CATEGORIES` に App Usage / Commerce(Subscription) を追加してフルファネルを計測可能にする。
4. 流入ボリュームが小さい（~20imp/日）ため conversion rate はノイズ大。05-19 の 38.1% spike が本物か翌日以降に再確認。

### 変更したファイル
- `data/analytics/2026-05-21/*.tsv`（ASC fetch で新規作成）
- `docs/analytics/daily-report-2026-05-21.md` / `daily-metrics-2026-05-21.json`（analyze_funnel.py 生成・全ゼロ・誤り）
- `docs/analytics/daily-report-2026-05-21-corrected.md`（新規・手動集計）
- `docs/analytics/daily-metrics-2026-05-21-corrected.json`（新規・手動集計）

## 2026-05-23

### 作業内容（Daily Rewire App Analytics Pipeline — 自動スケジュール実行）
- ASC analytics を取得（processing date 2026-05-22 ぶん）。
- 初回実行はまた `409 Conflict`（`POST /v1/analyticsReportRequests`、ONGOING request 既存）。`--request-id 394c257b-c76e-4779-9257-30c74024383a` を付けて再実行し成功（id は `GET /v1/apps/6759087214/analyticsReportRequests` で取得）。
- `data/analytics/2026-05-22/` に 2 TSV を保存（App Store Discovery & Engagement Standard, App Store Web Preview Engagement Standard）。
- `~/.claude/skills/app-analytics/scripts/analyze_funnel.py` を実行 → `daily-report-2026-05-22.md` / `daily-metrics-2026-05-22.json` 生成。だがまた全ゼロ（列マッピングのバグ）。
- Python で手動再集計し、`daily-report-2026-05-22-corrected.md` + `daily-metrics-2026-05-22-corrected.json` を作成。

### 実数（fetched report 内のイベント日 2026-05-19〜05-21）
- 3日合計: Impressions 65 · Page views 8 · Taps 3 · ウィンドウ page-view rate **12.3%**（25–35% benchmark に対し 🔴 below）。確定日のみ（05-19+05-20）だと 8pv/47imp = **17.0%**。
- 日次: 05-19 = 21imp/8pv（**38.1%**, 確定）· 05-20 = 26imp/0pv（0.0%, 確定・前回 fetch と同値で安定 → 実際に 0pv の日とみられる）· 05-21 = 18imp/0pv/1tap（preliminary・page view 未確定の可能性大）。
- 前ウィンドウ（05-18〜05-20, 70imp/10pv/14.3%）と 05-19/05-20 が重複するため厳密な WoW 比較は不可。impression 70→65 微減、page-view rate 14.3%→12.3%（preliminary 05-21 が押し下げ）。
- ソース: App Store search 53imp/8pv/2tap（pv rate 15.1%）, App Store browse 12imp/0pv/1tap。**TikTok・web referral 由来の流入はゼロ**（全て organic）。Web Preview report は 1 page view のみ。
- 地域: **JP 24imp/8pv/3tap が funnel を全て牽引**（pv rate 33.3%）。TH 27imp/0pv（impression 最多なのに 0 変換 = 最大の無駄）, IL 9imp/0pv。JP 以外は全地域 0% 変換。
- ボトルネック: Impression → Page View（ウィンドウ 12.3%）。地理的問題で、JP は健全・非JP市場が漏れ。Downloads/Trial/Paid は当該レポートに含まれず計測不可。

### 発見した問題 / 次回やること（※05-08, 05-17, 05-20, 05-21 から未解決のまま **5回連続**で再発）
1. **`analyze_funnel.py` の列マッピングバグ未修正** — wide-format 列を期待しているが ASC TSV は `Event`+`Counts` の long-format。`Event` でグループ化して `Counts` を合算するよう修正が必要。
2. **`main.py` の 409 ハンドリング未実装** — 409 時に既存 ONGOING request を自動 GET して再利用＆永続化すべき（毎回手動で `--request-id` 指定が必要）。request id `394c257b-c76e-4779-9257-30c74024383a` を config 等に保存するのが手っ取り早い。
3. **レポートカテゴリ不足** — Downloads/Trial/Paid/Active Subscriptions が fetch されない。`scripts/analytics/asc_client.py` の `REPORT_CATEGORIES` に App Usage / Commerce(Subscription) を追加してフルファネルを計測可能にする。5ステージ中3ステージが計測不能のまま。
4. 流入ボリュームが小さい（~20imp/日）ため conversion rate はノイズ大。
5. 新規アクション課題: TH の impression 27 件（最多）が 0 変換。TH 向けローカライズの要否を判断、または off-target キーワードの剪定。

### 変更したファイル
- `data/analytics/2026-05-22/*.tsv`（ASC fetch で新規作成）
- `docs/analytics/daily-report-2026-05-22.md` / `daily-metrics-2026-05-22.json`（analyze_funnel.py 生成・全ゼロ・誤り）
- `docs/analytics/daily-report-2026-05-22-corrected.md`（新規・手動集計）
- `docs/analytics/daily-metrics-2026-05-22-corrected.json`（新規・手動集計）

## 2026-05-24

### 作業内容（Daily Rewire App Analytics Pipeline — 自動スケジュール実行）
- ASC analytics を取得（processing date 2026-05-23 ぶん）。
- 初回実行はまた `409 Conflict`（`POST /v1/analyticsReportRequests`、ONGOING request 既存）。`GET /v1/analyticsReportRequests` はコレクション GET 不可（`FORBIDDEN_ERROR`）のため一覧不可。前回 corrected レポートに記録済みの request id `394c257b-c76e-4779-9257-30c74024383a` を `--request-id` で渡して再実行し成功。
- `data/analytics/2026-05-23/` に 3 TSV を保存（App Store Discovery & Engagement Standard / Detailed, App Store Web Preview Engagement Standard）。今回は Detailed レポートも取得できた。
- `~/.claude/skills/app-analytics/scripts/analyze_funnel.py` を実行 → `daily-report-2026-05-23.md` / `daily-metrics-2026-05-23.json` 生成。だがまた全ゼロ（列マッピングのバグ）。
- Python で手動再集計し、`daily-report-2026-05-23-corrected.md` + `daily-metrics-2026-05-23-corrected.json` を作成。

### 実数（fetched report 内のイベント日 2026-05-20〜05-22）
- 3日合計: Impressions 61 · Page views **0** · Taps 1 · ウィンドウ page-view rate **0.0%**（25–35% benchmark に対し 🔴 below、ギャップ約25pt）。
- 日次: 05-20 = 26imp/0pv（確定・前回 fetch と同値）· 05-21 = 18imp/0pv/1tap（確定・前回 fetch と同値）· 05-22 = 17imp/0pv（preliminary）。確定日のみ（05-20+05-21）= 0pv/44imp = **0.0%**（信頼できる値）。
- WoW: 前ウィンドウ（05-19〜05-21, 65imp/8pv/12.3%）→ 今回（61imp/0pv/0.0%）。impression はほぼ横ばい。前回の page view 8 は全て 05-19 単日（JP）由来で、今ウィンドウはその好調日を過ぎただけ → 05-19 はスパイク、ベースラインは page view ほぼゼロと確認。
- ソース: App Store search 55imp/0pv/1tap（impression の90.2%）, App Store browse 6imp/0pv。Detailed レポートの Campaign 列は空 = **キャンペーン帰属なし**。TikTok・web referral 流入ゼロ（6回連続）。Web Preview report は 1 page view のみ。
- 地域: TH 30imp/0pv（impression の49.2%・最大の無駄、2ウィンドウ連続）· JP 13imp/0pv/1tap · IL 13imp/0pv · その他 NP2/PH1/TW1/MN1。**重要: 前ウィンドウで funnel を牽引していた JP（33.3%）が今回 0pv に転落** → 唯一機能していた市場が沈黙。
- ボトルネック: Impression → Page View（0.0%）。前回は地理的問題（JP健全）だったが、今回は JP も 0% で全地域に拡大。

### 発見した問題 / 次回やること（※05-08, 05-17, 05-20, 05-21, 05-22 から未解決のまま **6回連続**で再発）
1. **`analyze_funnel.py` の列マッピングバグ未修正** — wide-format 列を期待しているが ASC TSV は `Event`+`Counts` の long-format。`Event` でグループ化して `Counts` を合算するよう修正が必要。6回連続で全ゼロレポート生成。
2. **`main.py` の 409 ハンドリング未実装** — 毎回手動で `--request-id 394c257b-c76e-4779-9257-30c74024383a` 指定が必要。config 等に request id を永続化すべき。
3. **レポートカテゴリ不足** — Downloads/Trial/Paid が fetch されない。`scripts/analytics/asc_client.py` の `REPORT_CATEGORIES` に App Usage / Commerce(Subscription) を追加。5ステージ中3ステージが計測不能のまま。
4. **新規の重大シグナル**: JP の page-view 転落（24imp/8pv → 13imp/0pv）。ランキング下落・競合・季節性・小サンプルノイズのいずれか要調査。
5. TH は2ウィンドウ計57 impression で engagement ゼロ。ターゲット市場か判断し、off-target キーワードを剪定。

### 変更したファイル
- `data/analytics/2026-05-23/*.tsv`（ASC fetch で新規作成、3ファイル）
- `docs/analytics/daily-report-2026-05-23.md` / `daily-metrics-2026-05-23.json`（analyze_funnel.py 生成・全ゼロ・誤り）
- `docs/analytics/daily-report-2026-05-22.md` / `daily-metrics-2026-05-22.json`（フェッチ前に最新dirとして再生成・全ゼロ。05-22 の corrected 版は前回分が有効）
- `docs/analytics/daily-report-2026-05-23-corrected.md`（新規・手動集計）
- `docs/analytics/daily-metrics-2026-05-23-corrected.json`（新規・手動集計）

## 2026-05-25

### 作業内容（Daily Rewire App Analytics Pipeline / スケジュールタスク自動実行）
- `python3 -m scripts.analytics.main` を実行 → **成功**。`--request-id` 指定なしで 409 を自動処理し、ONGOING request `394c257b-...` を再利用。前回までの既知問題 #2（409ハンドリング未実装）は**解消済み**。
- COMMERCE カテゴリを含む **6レポート**を取得 → `data/analytics/2026-05-24/` に 6 TSV 保存（Discovery Std/Detailed, Web Preview, App Downloads Std, Subscription Event Std, Subscription State Std）。既知問題 #3（レポートカテゴリ不足）も**解消済み**。
- `analyze_funnel.py` を実行 → `daily-report-2026-05-24.md` / `daily-metrics-2026-05-24.json` 生成。だが Downloads/Trial/Paid/Churn が**また全ゼロ**。
- Python で raw TSV から再集計し、`daily-report-2026-05-24-corrected.md` + `daily-metrics-2026-05-24-corrected.json` を作成。

### 実数（fetched report 内のイベント日 2026-05-21〜05-23）
- Impressions **58** · Taps **3**（5.2%）· Web preview page view **1** · First-time download **1** · Free trial **3** · Trial→Paid **1** · Voluntary churn **7** · Active subscription 0（データに無し）。
- **Net subscriber change = 新規trial 3 − churn 7 = -4**（当ウィンドウで純減）。
- Trial→Paid = 1/3 = 33.3%（ベンチマーク 40–60% に対し下回り）。
- チャネル: App Store search 56imp · App Store browse 2imp。**organic 100%、TikTok/有料/web referral 流入ゼロ（7回連続）**。
- ただし Subscription State に offer code `REWIRE2026`（`SNS_Campaign_2026_Free1Year`）経由の年額 free trial が 2 件 → SNS キャンペーンは offer-code redemption としては機能している（discovery のチャネル分解には出ない）。
- Churn 7 件は**全て「Turned off auto-renew」**、大半が年額プラン。

### 発見した問題 / 次回やること
1. **`analyze_funnel.py` の列マッピングバグ（最重要・本日で7回連続再発）** — 前回までで discovery レポートの long-format（`Event`+`Counts`）対応は入った（Impression/Tap/Page view は正しく集計される様になった）。**しかし COMMERCE 3レポートが未対応**: App Downloads は `Download Type` 列、Subscription Event は `Event Name` 列、Subscription State は `State Metric` 列で、`extract_metrics()` は `Event` 列しか見ないため全て無視され 0 になる。`extract_metrics()` / `extract_metrics_by_source()` にこれら3スキーマのマッピングを追加する必要あり。修正するまで公式日次レポートは Page View 以下が常に誤り。
2. 既知問題 #2（409）/ #3（レポートカテゴリ）は解消済み。MEMORY 過去分の該当項目はクローズ可。
3. **リテンション悪化シグナル**: churn(7) > 新規trial(3)。trial 終了前通知・更新リマインダ通知の実装、年額プランの価値訴求見直しを検討。
4. トップオブファネルが極小（3日で 58imp / 3tap）。ASO 強化と、SNS/TikTok キャンペーンに正しい attribution タグ付けを行い流入を可視化する。

### 変更したファイル
- `data/analytics/2026-05-24/*.tsv`（ASC fetch で新規作成、6ファイル）+ `manifest.json`
- `docs/analytics/daily-report-2026-05-24.md` / `daily-metrics-2026-05-24.json`（analyze_funnel.py 生成・Page View 以下が全ゼロ・誤り）
- `docs/analytics/daily-report-2026-05-24-corrected.md`（新規・手動集計）
- `docs/analytics/daily-metrics-2026-05-24-corrected.json`（新規・手動集計）

## 2026-05-26（scheduled task: rewire-daily-analytics 自動実行）

### 実行サマリ
- Step 1 ASC fetch 成功: `data/analytics/2026-05-25/` に 5 レポート（TSV）保存。report request `394c257b...`（既存 ONGOING を再利用）。
- Step 2 `analyze_funnel.py` 実行成功 → `docs/analytics/daily-report-2026-05-25.md` / `daily-metrics-2026-05-25.json` 生成。
- Step 3 既知バグのため手動補正版を生成（前回 05-24 と同形式）。

### 実数（fetched report 内のイベント日 2026-05-22〜05-24）
- Impressions **103** · Taps **4**（3.9%）· Page view **12** · First-time download **1** · Free trial start **3** · Trial→Paid **1** · Voluntary churn **7** · Active full-price subscription **1**。
- **Net subscriber change = 新規trial 3 − churn 7 = -4**（当ウィンドウで純減・3回連続マイナス）。
- Trial→Paid = 1/3 = 33.3%（ベンチマーク 40–60% を下回り）。
- チャネル: App Store search 100imp/3tap · App Store browse 3imp/1tap。**organic 100%、TikTok/有料/web referral 流入ゼロ（8回連続）**。
- offer code `REWIRE2026`（`SNS_Campaign_2026_Free1Year`）経由の年額 free trial 2 件 → SNS キャンペーンは機能しているが discovery のチャネル分解に出ない。
- Churn 7 件は全て「Turned off auto-renew」。

### 発見した問題 / 次回やること
1. **`analyze_funnel.py` の列マッピングバグ（本日で8回連続再発）** — COMMERCE 3レポート（App Downloads=`Download Type`列 / Subscription Event=`Event Name`列 / Subscription State=`State Metric`列）が `extract_metrics()`（`Event`列のみ参照）で無視され Downloads/Trial/Paid/Churn が全て 0 になる。要修正。TDD ルールにより各スキーマの失敗テストを先に追加すること。
2. リテンション悪化継続: churn(7) > 新規trial(3)。trial 終了前通知・更新リマインダ通知の実装を検討。
3. トップオブファネルが極小（3日で 103imp / 4tap）。ASO 強化 + SNS/TikTok キャンペーンへの attribution タグ付け。

### 変更したファイル
- `data/analytics/2026-05-25/*.tsv`（ASC fetch で新規作成、5ファイル）+ `manifest.json`
- `docs/analytics/daily-report-2026-05-25.md` / `daily-metrics-2026-05-25.json`（analyze_funnel.py 生成・Page View 以下が全ゼロ・誤り）
- `docs/analytics/daily-report-2026-05-25-corrected.md`（新規・手動集計）
- `docs/analytics/daily-metrics-2026-05-25-corrected.json`（新規・手動集計）

## 2026-05-30: ストリーク演出を旧フルスクリーンUIに復元
### 作業内容
- お祝い演出を小モーダル（320pxカード＋「素晴らしい！」）→ 旧フルスクリーン演出（参照画像 IMG_4203.PNG: 大きな数字＋ラベル＋曜日トラッカー＋Continueボタン）に戻した。
- トリガー/重複防止ロジック（useStreakCelebration + celebrationStorage + reflection の pendingCelebrationStreak、app/(tabs)/index.tsx 219-224行）は無変更で維持。表示のみ差し替え。
- DRY/SRP のため純粋表示コンポーネント `StreakCelebrationContent` を新規抽出し、モーダルと app/streak.tsx（/streak ディープリンク画面）の両方で共有。
- ラベルは画像に合わせ「新しいストリーク」(en: New streak) を採用（locale新規キー streak.newStreak）。Continueボタンは common.continue（新規キー）。
- TDD: RED（StreakCountUpModal.test 更新 + StreakCelebrationContent.test 新規）→ GREEN → REFACTOR(app/streak.tsx)。

### 変更/新規ファイル
- 新規: `components/streak/StreakCelebrationContent.tsx`, `components/streak/__tests__/StreakCelebrationContent.test.tsx`
- 書換: `components/streak/StreakCountUpModal.tsx`（全画面 LinearGradient(gradients.hero) + SafeArea insets + 共有コンテンツ）
- 修正: `components/ui/Button.tsx`（testID prop 追加）, `app/streak.tsx`（共有コンテンツへ置換）
- locale: `locales/ja.ts` / `locales/en.ts`（common.continue, streak.newStreak 追加）
- テスト更新: `components/streak/__tests__/StreakCountUpModal.test.tsx`（hero gradient/shadows/safe-area/WeeklyTracker モック + weekly-tracker/sub-text テスト追加）

### 検証結果
- 対象テスト: StreakCountUpModal + StreakCelebrationContent = 15 passed
- 全テスト: 2077 passed / 1 failed（失敗は既存の `i18nQuality` postPurchaseOnboarding.demo.description 改行数差、本変更と無関係＝stashで再現確認済み）
- tsc: 変更ファイルに新規エラーなし（Button line77 の LinearGradient overload は HEAD でも存在の既存issue）

### 注意点・次回
- `StreakCountUpModal` の props/testID（streak-count-up-modal, streak-count-up-modal-dismiss）は不変。ダッシュボード配線は触っていない。
- 既存の i18nQuality 失敗（postPurchaseOnboarding.demo.description の ja/en 改行数差）は別途要修正の既存負債。
- 調整余地: 曜日トラッカーは既存7日 WeeklyTracker を流用（画像は4日ピル型）。厳密一致が必要なら別途トラッカー作成。
- 未コミット状態。


## 2026-06-01: GA4 Data API セットアップ — 新規SA バグ回避（User OAuth ADC に切替）

### 経緯
`SETUP_FIREBASE.md` 通り Step 1〜6 を進めたが、Step 6（GA4 Property に Service Account を Viewer 追加）で **「このメールアドレスは Google アカウントと一致しません」** エラーが消えず詰まる。

### 原因（Google 側の既知バグ）
- **`email not found` バグ**: 2026年4月23日頃から発生中の Google 公式バグ
- **2026年4月20日以降に新規作成された Service Account** は GA4 / Search Console に追加できない
- 2026年6月時点で**修正未定**（Source: piunikaweb 2026-05-01, discuss.google.dev）
- 設定ミスではないため、SA を諦めて **User OAuth (ADC)** に切替

### 実施した解決策（Option A: User OAuth ADC）
個人開発・Gmail が GA4 管理者の条件下では SA 不要。Gmail 自身の権限で API を叩く。

#### コード変更（最小・TDD）
- `scripts/analytics/firebase_ga4_client.py`:
  - `from google.oauth2.service_account import Credentials` → `from google.auth import load_credentials_from_file`
  - `Credentials.from_service_account_file(path)` → `load_credentials_from_file(path, scopes=[GA4_READ_SCOPE])`
  - `GA4_READ_SCOPE = "https://www.googleapis.com/auth/analytics.readonly"` を定数化
  - docstring も SA / ADC 両対応を明記
- `scripts/analytics/tests/test_firebase_ga4_client.py`:
  - モック対象を `Credentials.from_service_account_file` → `load_credentials_from_file` に変更
  - `load_credentials_from_file` は `(creds, project_id)` タプルを返すためモック戻り値も更新
  - `test_passes_credentials_to_sdk` に scopes チェック追加
- テスト: 127/127 通過

#### 環境セットアップ
1. `brew install --cask google-cloud-sdk` で gcloud 570.0.0 インストール
2. `~/.zshrc` に `source "/opt/homebrew/share/google-cloud-sdk/path.zsh.inc"` 追加
3. **gcloud デフォルト OAuth クライアントは analytics.readonly スコープを拒否**するため、自前 OAuth クライアントを GCP Console で作成（Desktop type）→ `~/.config/gcloud/oauth_client_local.json` に配置
4. OAuth 同意画面（External）に **テストユーザーとして `arimurahiroaki40@gmail.com` を追加**（これを忘れると 403 access_denied）
5. `gcloud auth application-default login --client-id-file=$HOME/.config/gcloud/oauth_client_local.json --scopes=openid,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/analytics.readonly`
6. `~/.config/gcloud/application_default_credentials.json` (type: `authorized_user`) が生成される

#### `.env.analytics` 更新
```
GA4_PROPERTY_ID=526015389
GOOGLE_APPLICATION_CREDENTIALS=/Users/arimurahiroaki/.config/gcloud/application_default_credentials.json
```

#### 削除済（不要）
- `~/.config/firebase/ga4-sa.json` (SA キー)

### 疎通確認
2026-05-31 データ取得成功: active_users=4, new_users=3, sessions=4, screen_page_views=46, events=7種, top_screens=10件

### 注意 / 次回
- **SETUP_FIREBASE.md の Step 6（SA を GA4 に追加）は当面機能しない**。新規 SA が必要な場合は Google のバグ修正待ち、または同様に User OAuth ADC で回避
- gcloud デフォルト OAuth クライアントは analytics スコープ非対応。**自前 OAuth クライアント必須**
- OAuth 同意画面のテストユーザー登録忘れに注意（403 になる）
- User ADC は token 自動更新されるが、サーバー（cron）運用には不向き（リフレッシュ失効リスクあり）。個人 Mac 上の日次実行なら問題なし
- SETUP_FIREBASE.md には今回の回避策を別ガイドとして追記検討（未実施）
- 変更ファイル（未コミット）: `scripts/analytics/firebase_ga4_client.py`, `scripts/analytics/tests/test_firebase_ga4_client.py`

---

## 2026-06-02 App Store リジェクト対応 — Guideline 3.1.2(c) 価格表示の優先順位修正

### リジェクト内容（App Review）
- 日付: 2026-05-31 / Submission ID: `b2ac77cd-093e-44ef-9bf8-965030e46b07` / レビュー端末: iPad Air 11-inch (M3) / 対象: 2.2 (1)
- **Guideline 3.1.2(c)**: "the auto-renewable subscription displays the **monthly calculated pricing** more clearly and conspicuously than **the billed amount**."

### 根本原因（コードで特定）
- `components/paywall/PlanSelector.tsx` の年額カードが、**月換算した計算上の価格**（`calcMonthlyPrice(annualPrice)` = ¥5,400÷12 = ¥450）を `FONT_SIZE.xxl`(24)/`extrabold` で最も目立つ要素として描画。
- **実際の請求総額**（¥5,400/年）はフッター `billingNote`（`PaywallDefault.tsx`, `FONT_SIZE.xs`=12/`textSecondary`）にしか出ていなかった → Apple の優先順位要件を反転。
- ルートの正式ソース: [Auto-renewable Subscriptions](https://developer.apple.com/app-store/subscriptions/)（3.1.2(c) が参照）「the amount that will be billed must be the most prominent pricing element … breakdown は subordinate position and size」。月換算の併記は**許可**だがサイズ・位置で従属必須。

### 修正内容（TDD: Red→Green→Refactor）
- **方針（hiro 承認済み）**: 年額カード = 請求総額を主役 + 月換算（従属）+ 割引バッジ（従属）。修正範囲は**有効な PaywallDefault / PlanSelector のみ**（Discount/Trial は Guideline 5.6 でコメントアウト・無効のため対象外）。
- `components/paywall/PlanSelector.tsx`:
  - 年額カードの主役を `formatPrice(annualMonthly)`（月換算）→ **`annualPriceStr`（実請求総額・RC priceString）** に変更。period を `／月`→**`／年`**。
  - 従属の月換算行 `約 ¥450／月`（新 `priceEquivalent`: xs/muted）と割引バッジ `34%お得`（新 `savingsBadge`: xs/`colors.success`）を追加。バッジは `calcRelativeDiscount`（既存）を再利用し `showMonthly && monthlyPackage` のときのみ表示。
  - ハードコード `Annual`/`Monthly` を i18n 化。月額カードは実請求額が既に主役のためラベルのみ localize。
  - 主役 `priceMain`=24px/extrabold > 従属=12px を担保。
- `locales/ja.ts` / `locales/en.ts`（`paywall` セクション）にキー追加: `perYear`(／年//yr), `planAnnual`(年額/Annual), `planMonthly`(月額/Monthly), `monthlyEquivalent`(約 {{price}}／月/≈ {{price}}/mo), `savePercent`({{percent}}%お得/Save {{percent}}%)。
- フッター `billingAnnual`（"3日間無料、そのあと {{price}}／年"）と CTA「無料で始める」は維持（カード内で請求総額が最も目立つ構成のため準拠）。
- 新規テスト: `components/paywall/__tests__/PlanSelector.test.tsx`（7件）。

### テスト / lint
- 新規 PlanSelector テスト 7件含む paywall 関連 32 スイート/252 テスト全通過。
- 全体: **2084 passed / 1 failed**。失敗は `locales/__tests__/i18nQuality.test.ts` の `postPurchaseOnboarding.demo.description`（ja 改行3 vs en 改行1）で、**git stash で確認した結果 clean HEAD でも失敗する既存の不具合**（今回の変更とは無関係。別途修正候補）。
- lint: 新規エラー・警告ゼロ（PlanSelector.tsx / test / locales）。
- tsc: 変更ファイルに型エラーなし。

### 再申請メモ（hiro が App Store Connect で実施）
- `app.json` buildNumber `1` → **`2`** にインクリメント（version 2.2.0 据え置き）して archive→upload。本番ビルド前に `app/index.tsx:7` の `DEV_SKIP_ONBOARDING` を **false** に戻すこと。
- iPad Air 11" でのリジェクトのため、**iPad シミュレータで paywall の目視確認**（年額カードで ¥X,XXX/年 が最大・太字、月換算と割引バッジが従属）+ スクリーンショット取得。
- Resolution Center 返信テンプレ（英語）: "Per Guideline 3.1.2(c): the total billed amount (e.g. ¥5,400/year) is now the most prominent pricing element … the per-month equivalent (≈¥450/mo) and savings badge are shown in a smaller, subordinate position and size …"

### 目視確認（実機ビルドで確認済み）
- `npx expo run:ios` で **iPad Air 11-inch (M3)**（リジェクトと同一端末）にビルド→`rewire://paywall` でペイウォール表示。RevenueCat 実価格がロードされた。
- 確認結果: 年額カードは **$34.99 ／年（大・太字＝請求総額）** が主役、`27%お得`（小・緑バッジ）と `約 $3.00／月`（小・muted）が従属。月額カードは `$3.99 ／月`。→ **3.1.2(c) 準拠を視覚的に確認**（スクショ `/tmp/rewire_paywall2.png`）。シミュレータの storefront が US のため通貨は $ 表示だが、レイアウト階層は通貨非依存で同一。

### 本番フラグ修正（2026-06-02 目視確認後）
- `app/index.tsx`: `DEV_SKIP_ONBOARDING` を **`true` → `false`** に変更（本番運用設定）。`DEV_PREVIEW_POST_PURCHASE` は元々 `false`。grep 済み: ハードコードの dev/debug/mock フラグはこの2つのみ。
- これに伴い `app/__tests__/indexRouting.test.tsx` を**本番挙動（user有無に関わらず `/brand` へ遷移・DEV seed 不実行）に書き換え**（TDD: Red→Green）。`/brand` 画面が `/(tabs)` か `/onboarding` を振り分ける。
- シミュレータ shutdown・Metro(8081) 停止済み。
- 全体テスト: **2084 passed / 1 failed**（失敗は既存の i18nQuality のみ、無関係）。lint: 0 error。

### 変更ファイル（未コミット）
- `components/paywall/PlanSelector.tsx`
- `components/paywall/__tests__/PlanSelector.test.tsx`（新規）
- `locales/ja.ts`, `locales/en.ts`
- `app/index.tsx`（DEV_SKIP_ONBOARDING=false）
- `app/__tests__/indexRouting.test.tsx`（本番挙動に更新）

## 2026-06-03: 地球オーブの「緑の塊」バグ修正
- **症状**: ダッシュボード中央の Earth バッジ（30日）オーブで、地球上部に不自然な緑の塊が表示されていた
- **根本原因**: `components/dashboard/EarthOrbRenderer.tsx` の `<SkiaImageShader>` が `fit="fill"` だけで **`rect` プロップを欠いていた**。RN Skia (`@shopify/react-native-skia@2.6.2`) では `fit` は `rect` とセットでないと無効で、`rect` 無しだと `image.eval(coord)` の座標空間が**画像のネイティブピクセル空間（earth-equirect.png は 1024×512）**になる。一方シェーダー `constants/shaders/earthOrb.ts:64-68` は正規化texCoord(0..1)に `resolution`(=[size,size]≈[120,120] のキャンバスサイズ)を掛けて eval に渡していたため、1024×512テクスチャの**左上 約120×120px（北半球の陸地＝緑）だけ**を repeat サンプリング → 球面上部に緑の塊
- **修正**: `<SkiaImageShader>` に `rect={{ x: 0, y: 0, width: size, height: size }}` を追加（公式 "Render a Nested Shader" パターン準拠）。これで eval 座標空間がキャンバス空間(0..size)になり、既存の `* resolution` が正しくなる。**シェーダー(earthOrb.ts)は無変更**。あわせてデバッグ用 console.log を削除
- **第1次調査の誤推定を排除**: 「`* resolution` を削除すべき」は誤り。rect 無しのまま削除すると texCoord 0..1 で左上1pxのみサンプリング＝単色化で悪化。eval 座標空間は ImageShader の rect/fit で決まるのが肝
- **テスト基盤の重要な発見**: `EarthOrbRenderer.tsx` はモジュールトップで `skiaEarthInit()` を分割代入するため、`beforeEach` で `skiaModulesRef` を変更しても import 済みの const（null）に反映されない。既存テストの「Skiaキャンバスを描画する」等は実はフォールバックを描画していた false positive（フォールバックも `testID ?? ...` で同じ testID を使うため気付けなかった）。対策として静的 import を `setSkiaAvailable()` 実行後の `require('../EarthOrbRenderer')` に置換し、初回 require 時点で Skia 利用可能にして実際の Skia パスを検証できるようにした。`jest.isolateModules` は React も再ロードし "Invalid hook call" になるため不可
- **TDD**: rect プロップ受け渡しの失敗テスト追加 → Green → console.log 削除。EarthOrbRenderer スイート 7/7 通過
- **テスト全体**: 2161 passed / 1 failed。失敗は `locales/__tests__/i18nQuality.test.ts`（ja/en 改行数差分）で**本変更と無関係・既存の未コミット locale 変更由来**
- **lint**: 変更2ファイルとも HEAD と同一（新規エラー・警告ゼロ。display-name 等は既存パターン）
- **目視確認は未実施（hiro が dev build で要確認）**: 青い海＋自然な大陸分布になり緑の塊が消えること、自転で大陸が横に流れること、Venus/Mars 等他オーブが従来通りであること（CoreOrbRenderer 経路は無変更）
- **変更ファイル**: `components/dashboard/EarthOrbRenderer.tsx`, `components/dashboard/__tests__/EarthOrbRenderer.test.tsx`

## 2026-06-03: Claude Code から Xcode Archive → TestFlight 自動化スクリプト
- **目的**: EAS Build を使わず、ローカル Mac の `xcodebuild` で archive → IPA → `altool` で TestFlight にアップロードする一発スクリプトを整備。Claude が `npm run release:testflight` 1 行で実行できる
- **採用方針の経緯**: `XcodeBuildMCP` (getsentry) は archive/exportArchive までは MCP ツール化されているが、altool / TestFlight upload は提供していない。MCP を入れても最後の 1 ステップが Bash になるため、依存最小で素のシェルスクリプト方式に確定
- **新規ファイル**:
  - `scripts/release-testflight.sh` — bash. `--prebuild` / `--skip-pods` / `--skip-upload` フラグ対応。archive→exportArchive→altool を 1 本化。`-allowProvisioningUpdates` + `-authenticationKey*` 系で App Store Connect API key 認証（2FA 不要）
  - `scripts/ExportOptions.plist` — method=app-store-connect / teamID=KV6CYPA7JK / signingStyle=automatic / uploadSymbols=true / destination=export
  - `docs/release-testflight.md` — 初回セットアップ・通常運用・トラブルシューティング
- **変更ファイル**:
  - `.gitignore` — `/build` 追記（`*.p8` は既存。`/ios` も既存 = prebuild 産物のローカル保持）
  - `.claude/settings.local.json` — Bash 許可: `./scripts/release-testflight.sh:*`, `npm run release:testflight:*`, `xcodebuild:*`, `xcrun altool:*`, `xcrun:*`, `pod install:*`, `cd ios && pod install:*`, `plutil:*`
  - `package.json` — `release:testflight` npm script 追加
- **App Store Connect API Key（既存キーを使い回し）**:
  - Key ID: `2X7YAY8C29`
  - Issuer ID: `f9b7f07e-d315-46ba-895a-144635852ffd`
  - .p8 配置先: `~/.config/rewire/AuthKey_2X7YAY8C29.p8`（hiro が `~/Downloads/` から移動するタスク残）
  - スクリプトに上記をデフォルト埋め込み済み。`ASC_KEY_ID` / `ASC_ISSUER_ID` / `ASC_KEY_PATH` 環境変数で上書き可能
- **重要な発見**:
  - `/ios` は `.gitignore` 入り＝prebuild 産物。Plan Mode の初回 Explore agent は「git-tracked」と誤報告したが、`git ls-files ios` で 0 件と確定。`--prebuild` フラグで `npx expo prebuild --platform ios --no-install` を opt-in 実行する設計
  - altool は `API_PRIVATE_KEYS_DIR` 環境変数で `.p8` の探索先を指定できる（`~/.appstoreconnect/private_keys/` への symlink 不要）
- **構文検査**: `bash -n` OK / `plutil -lint` OK / `python3 json.load` OK
- **未実施（hiro 側）**:
  1. `mv ~/Downloads/AuthKey_2X7YAY8C29.p8 ~/.config/rewire/` + `chmod 600`
  2. Xcode → Settings → Accounts で Apple Distribution 証明書の存在確認
  3. `app.json` の `expo.ios.buildNumber` を `2` → `3` 以上に上げる
  4. `npm run release:testflight` を初回実行 → archive 成功 / IPA 生成 / altool "No errors uploading" を確認
- **未コミット状態**

## 2026-06-03 (続き): 汎用版 release-testflight を ~/.local/bin に設置
- **目的**: Swift native プロジェクトでも `release-testflight` 一発で archive→IPA→TestFlight を実行可能にする
- **新規ファイル**:
  - `~/.local/bin/release-testflight` — 汎用 bash スクリプト（実行可）。auto-detect: cwd または ./ios 配下の `*.xcworkspace` / `*.xcodeproj`、scheme（container 名と一致 or 最初の scheme）、Podfile の有無
  - `~/.config/appstore/credentials` (chmod 600) — 全 iOS プロジェクト共通の ASC 認証情報。`source` 形式の env ファイル
- **フラグ**: `--scheme NAME` / `--workspace PATH` / `--project PATH` / `--ios-dir DIR` / `--skip-pods` / `--skip-upload`
- **挙動**:
  - Expo: cwd に `ios/*.xcworkspace` があれば自動でそこを使う（Rewire でも `cd /path/to/rewire && release-testflight` で動く）
  - Swift: cwd に `MyApp.xcworkspace` or `MyApp.xcodeproj` があれば自動検出
  - Podfile が無ければ pod install を skip（SPM only プロジェクト対応）
  - ExportOptions.plist は `build/ExportOptions.plist` に毎回動的生成（teamID は `$APPLE_TEAM_ID` から）
- **認証情報の優先順位**: env vars > `~/.config/appstore/credentials`
- **Apple Team が複数ある場合**: そのプロジェクトでだけ `APPLE_TEAM_ID=XXXX release-testflight` のように一時上書き
- **Rewire 専用版との関係**: `scripts/release-testflight.sh` は Rewire 内に残置（後方互換）。新規プロジェクトはグローバル版を使えば DRY

## 2026-06-04: ProfileHeader の Earth オーブが地球テクスチャで描画されない問題を修正
- **症状**: ホーム画面 (`OrbCarousel`) では Earth バッジが Skia + earth-equirect.png で地球テクスチャ付き描画されるが、プロフィール画面 (`ProfileHeader`) では青グローの球体のみで地球が出ない
- **根本原因**: `components/profile/ProfileHeader.tsx:49` で `AnimatedOrb` に `badgeId` プロップを渡していなかったため、`AnimatedOrb.tsx:106` の `badgeId === 'earth'` 分岐が常に false → `EarthOrbRenderer` ではなく `CoreOrbRenderer` にフォールバックしていた
- **修正**: `ProfileHeader.tsx:49` に `badgeId={badge.id}` を追加（1行）
- **TDDサイクル**: Red（mercury を渡すかチェックするテスト追加 → 失敗）→ Green（1行追加 → 通過）→ 全テスト 2166/2167 通過（既存の i18nQuality 失敗は変更前から）
- **学び**: `AnimatedOrb` の特殊レンダラ分岐は現状 `earth` のみ（`AnimatedOrb.tsx:106-112`）。今後 saturn ring / stellarSystem などの特殊ビジュアル分岐が追加されたら、この修正により ProfileHeader も自動的に有効化される
- 変更ファイル: `components/profile/ProfileHeader.tsx`, `components/profile/__tests__/ProfileHeader.test.tsx`
- 未コミット状態

## 2026-06-06 (scheduled daily analytics run)
- 実行: `python3 -m scripts.analytics.main` → 成功。ASC API から 2026-06-05 分として Subscription Event + Subscription State の2レポートをDL（`data/analytics/2026-06-05/`）。
- `analyze_funnel.py` 実行 → `daily-report-2026-06-05.md` / `daily-metrics-2026-06-05.json` 生成。だが**また全ゼロ**（既知の列マッピングバグ: `Event`/`Counts` を期待するが ASC subscription TSV は `Event Name`/`State Metric`）。
- Python で手動再集計し `daily-report-2026-06-05-corrected.md` + `daily-metrics-2026-06-05-corrected.json` を作成。
- データ実態: ファイル内の行は event=2026-06-02、state=2026-06-03/04 のみ（ASC のレポートラグで 06-05 の行は無し）。engagement/commerce レポートが今回 fetch されず、impressions/page views/downloads は取得不能 → 上部ファネル算出不可。
- 主要数値（ファイル内全期間）: 新規トライアル開始=1、トライアル→有料転換=1、**自発的解約(Voluntary churn)=16**、アクティブ有料=4、アクティブトライアル=8。チャネル: 解約は App Store search 14 / App referrer 2 に集中。
- 注意点: **解約がアクティブ有料数を大きく上回る**（16 vs 4）= 最大の懸念。
- 未完了/次回TODO:
  1. `analyze_funnel.py` の列マッピングバグ修正（`Event Name`/`State Metric` でグループ化し `Counts` 合算）。
  2. fetch に APP_STORE_ENGAGEMENT / APP_USAGE / COMMERCE を追加し全ファネルを再計算可能にする。
  3. 指定日に行が無い場合「最新の利用可能日にフォールバック」する挙動を追加（全ゼロ空レポートの抑止）。
- 変更ファイル: docs/analytics/daily-report-2026-06-05-corrected.md, docs/analytics/daily-metrics-2026-06-05-corrected.json, .claude/MEMORY.md

## 2026-06-06 (GA4 リテンション取得 + 全イベント走査の追加 / CVR・継続率分析)
**背景**: hiro「ペイウォール課金率と継続率を改善したい。どの数値をどう判断するのが定例か」。リサーチ（RevenueCat State of Subscription Apps 2025 等）+ 既存計測の調査 + GA4実データ取得を実施。計画: `~/.claude/plans/firebase-revenuecat-app-snug-island.md`（2トラック）。
- **重要な気付き**: GA4 puller (`scripts/analytics/firebase_ga4_client.py`) は既に DAU/イベント/画面を取得済み（hiro指摘どおりGA4からイベントデータは取れる）。ただし**リテンション・コホート未取得**だった。`analyticsClient` の no-op は **Expo Goのみ**（TestFlight/本番は発火）。
- **Track 1 実装（アプリ改修なし・完了）**: `firebase_ga4_client.py` に TDD で追加
  - `fetch_ga4_retention()` + `_build_retention_request()`(cohortSpec, firstSessionDate) + `_parse_retention()` + `summarize_retention()` … D1/D7/D30。**GA4制約: cohort名は `cohort_` 始まり禁止**（→`all_users`）。`fetch_ga4_snapshot`とは独立関数（既存テスト3-call前提を壊さないため＋SRP）。
  - `fetch_all_events()` + `_build_all_events_request()` … 許可リスト解除の全イベント走査。
  - 共通ヘルパ `_run_single_report()` で認証ボイラープレートをDRY化。
  - テスト新規: `tests/test_ga4_retention.py`(11), `tests/test_ga4_all_events.py`(6)。**全144 analytics テスト通過**。
- **GA4実データ判定（2026-05-29〜06-04, 7日）**:
  - リテンション: **D1 ≈13-17% / D7 ≈2-4% / D30 計測不可（履歴浅い）**。ベンチ(健康系 D1 20%/D7 7-8%)を**下回る**。特にD7が弱い=早期離脱。※ローリング窓集計は新規希釈でやや過小、母数小。
  - 7日ファネル(ユニークU): first_open 21U → **onboarding_complete 6U=28.6%（最大の社内リーク, 71%離脱）** → benefits 6U → paywall_viewed 8U → **pro_purchase_completed 4U = paywall→購入 50%（ベンチ超で良好）**。
  - **結論の転換**: 当初スナップショットの「CVR 0%」は単日ノイズ。**ペイウォールは問題ない（50%）**。真のリークは①オンボ完了率29% ②D7継続2-4%。
  - `reflection_completed/opened/relapse_recorded` は **発火ゼロ=コード未実装**（エンゲージ継続率は測れない→Track 2）。
- **未完了/次回TODO**:
  1. **Track 2（別PR・要TestFlight）**: `reflection_completed`(streak_day/urge_level) / `reflection_opened`(source) / `relapse_recorded`(previous_streak) + user props(current_streak/relapse_count) を TDD 追加。発火箇所は `hooks/reflection/useReflectionSheet.ts` の `selectUrgeLevelAndSubmit`/`open`/`confessRelapseAndClose`、`stores/checkinStore.ts addCheckin`。新イベントを `REWIRE_KEY_EVENTS` 許可リストにも追加。
  2. （任意）retention/all-events を日報(`send_daily`/`report_generator`)に組込み。
- **オンボ離脱の調査＋計測追加（完了）**: GA4画面データで **`/onboarding` 25U入 → `/onboarding/goal` 11U** = **27ステップ機械の中で約56%離脱**だが全て単一ルート `/onboarding` 内のためGA4はステップ別を不可視（screen_view=/onboarding 1回のみ）。ステップ構造: `constants/onboarding.ts STEPS`(27要素), 遷移チョークポイント=`hooks/onboarding/useOnboardingNavigation.ts`(goToNextStep/goToStep/goToPreviousStep が `setStep` をラップ)。
  - **実装(TDD)**: 新フック `hooks/onboarding/useOnboardingStepTracking.ts` = `nav.step` 変化ごとに `onboarding_step_viewed{step_index, step_type}` 発火（`useEffect([step])`、範囲外/重複ガード）。`app/onboarding/index.tsx` で `useOnboardingStepTracking(nav.step)` を呼出。`onboarding_step_viewed` を `REWIRE_KEY_EVENTS` 許可リストに追加。
  - テスト: `hooks/onboarding/__tests__/useOnboardingStepTracking.test.ts`(4)。onboarding jest 63通過/11スイート、analytics python 144通過。lint 0 error。
  - **配布後**: TestFlightで `onboarding_step_viewed` を step_index でファネル化すれば**どのステップで落ちるか**が判明する。
  - 次の改善: 判明した離脱ステップを軽く（質問削減/順序/コピー）改善。最大の社内リーク。
- **変更ファイル**: `scripts/analytics/firebase_ga4_client.py`(retention/all-events/helper/allowlist), `scripts/analytics/tests/test_ga4_retention.py`(新規), `scripts/analytics/tests/test_ga4_all_events.py`(新規), `hooks/onboarding/useOnboardingStepTracking.ts`(新規), `hooks/onboarding/__tests__/useOnboardingStepTracking.test.ts`(新規), `app/onboarding/index.tsx`(フック配線), `~/.claude/plans/firebase-revenuecat-app-snug-island.md`
- **コミット済**: ブランチ `analytics/ga4-retention-onboarding-instrumentation` commit `71e7003`、`origin` に push 済（PR未作成）。

## 2026-06-07 (Track 2: reflection 計測＝エンゲージ継続率)
**目的**: コア習慣「毎日のリフレクション」に計測を入れ、GA4でエンゲージ継続率(D1/D7/D30)とチャーン先行指標を取れるようにする。要TestFlight配布。
- **実装(TDD)**: `hooks/reflection/useReflectionSheet.ts`
  - `open(source?)` に `ReflectionOpenSource='manual'|'notification'|'auto_reminder'` 追加 → `reflection_opened{source}` 発火。呼出3箇所更新: `components/dashboard/QuickActionGrid.tsx`(manual), `hooks/reflection/useReflectionTrigger.ts`(notification), `hooks/reflection/useAutoOpenReflectionSheet.ts`(auto_reminder)。
  - `selectUrgeLevelAndSubmit` 成功時 → `reflection_completed{streak_day, urge_level}`（North Star/アクティベーション/エンゲージ継続）。
  - `confessRelapseAndClose` 成功時 → `relapse_recorded{previous_streak}`（streakリセット前に算出）。チャーン先行指標。
  - user props: 新ヘルパ `lib/tracking/retentionUserProperties.ts setRetentionUserProperties(streakStartDate, checkins)` を **loadUser後**に呼び `current_streak`/`relapse_count` を設定（relapse時の順序問題回避のため addCheckin ではなく loadUser 後）。
  - `reflection_opened/completed`, `relapse_recorded` を `REWIRE_KEY_EVENTS` 許可リストに追加。
- **新規ファイル**: `lib/tracking/retentionUserProperties.ts` + テスト, テスト追記: `useReflectionSheet.test.ts`(+7), call-site 3テストで source 検証(`toHaveBeenCalledWith('manual'|'notification'|'auto_reminder')`)。
- **テスト**: 関連jest 52通過/6スイート + python 15通過。**全jest 2179通過 / 1 既存失敗のみ**（`locales/__tests__/i18nQuality.test.ts` = `postPurchaseOnboarding.demo.description` の ja/en 改行差、**私の作業前から存在・無関係・locale未変更**）。lint 0 error。
- **配布後の読み方**: GA4 コホート探索 内包=`first_open` 基準=`reflection_completed` で D1/D7/D30 エンゲージ継続。`reflection_opened`→`reflection_completed` で儀式の途中離脱。`relapse_recorded` 発火後のD1復帰でチャーン予兆。
- **未コミット状態**（Track 2 はまだ未コミット。Track 1 と同ブランチに積む想定）。
- 次TODO: 既存の i18nQuality 失敗（postPurchaseOnboarding.demo.description の改行差）は別途要修正（無関係）。

## 2026-06-08 (機能利用計測 Feature Usage Analytics: 基盤A + 高価値機能B)
**背景**: hiro「どの機能を・いつ・どれくらい使っているか知って改善したい」。GA4監査の結論: WHEN✅(時間帯ピーク22/12/19時)・WHICH画面✅(screen_view)は取れるが、**滞在時間は壊れ((not set)に1909分集中)**・**機能内操作はほぼ未計測**。計画: `~/.claude/plans/firebase-revenuecat-app-snug-island.md`（基盤→高価値4機能で承認）。前提: analyticsClient no-op は Expo Goのみ。
- **A1 型付きイベントカタログ**: `constants/analyticsEvents.ts`(AnalyticsEventParams 型マップ) + `lib/tracking/trackEvent.ts`(型付きラッパ, 可変長tupleで params有無対応)。新イベントは trackEvent 経由。
- **A3 ユーザープロパティ**: `hooks/tracking/useThemeLocaleUserProperties.ts`(themePreference/localePreference を user property化, 変更にも追従) を `useAppInitialization` から呼出。※`useAppInitialization.test.ts` は本フックを `useScreenTracking` 同様にモック追加で対応。
- **B1 レッスン**: `lesson_started`(マウント時, 早期return前のuseEffect)/`lesson_completed`(handleComplete) {lesson_id} — `app/lesson/[id].tsx`。
- **B2 クイックアクション+実績**: `quick_action_tapped{action}`(QuickActionGrid handle()), `achievements_opened`(achievements.tsx mount), `badge_unlocked{badge_id,chapter}`(BadgeUnlockModal, badge非null時)。
- **B3 ペイウォール深掘り**: `usePurchase` に集約 → `purchase_initiated{plan}`/`purchase_failed{reason,cancelled}`/`restore_tapped`/`restore_completed{success}`（options に `plan` 追加, PaywallDefault が selectedPlan を渡す）。`plan_selected{plan}`(PaywallDefault handleSelectPlan), `paywall_dismissed{source:onboarding|direct}`(usePaywallDismiss)。
- **B4 通知**: `notification_permission{granted}`/`notification_scheduled{hour}`(notificationClient), `notification_opened{route}`(useNotificationDeepLink, data.route と shield fallback 両方)。全新イベントを Python `REWIRE_KEY_EVENTS` に追加。
- **A2 滞在時間(not set)問題: 調査完了・修正は実機ビルド検証時に保留**。原因=**react-native-screens が firebase_screen_class を自動設定**し user_engagement がそこへ帰属、自動タグが(not set)化。修正はネイティブ画面クラス設定領域で、DebugView/GA4でしか検証不可のため speculative変更は見送り（CLAUDE.md「確信がないなら確認」）。次回ビルドで要検証。出典: rnfirebase.io/analytics/screen-tracking。
- **テスト**: 各増分TDD(Red→Green)。**全jest 2202通過 / 1 既存失敗のみ**(i18nQuality, 無関係)。python analytics 15通過。**lint 0 error**(新規warning は lesson/badge の `[id]` 依存 exhaustive-deps 2件のみ=意図的)。
- **新規ファイル**: constants/analyticsEvents.ts, lib/tracking/trackEvent.ts(+test), hooks/tracking/useThemeLocaleUserProperties.ts(+test), app/lesson/__tests__/lessonDetailAnalytics.test.tsx, components/achievements/__tests__/BadgeUnlockModalAnalytics.test.tsx。
- **変更ファイル(主要)**: hooks/useAppInitialization.ts, app/lesson/[id].tsx, components/dashboard/QuickActionGrid.tsx, app/achievements.tsx, components/achievements/BadgeUnlockModal.tsx, hooks/paywall/usePurchase.ts, components/paywall/PaywallDefault.tsx, hooks/paywall/usePaywallDismiss.ts, lib/notifications/notificationClient.ts, hooks/useNotificationDeepLink.ts, scripts/analytics/firebase_ga4_client.py + 各テスト。
- **未コミット状態**。Track 2(reflection計測, 未コミット) と本作業が同ブランチ `analytics/ga4-retention-onboarding-instrumentation` の作業ツリーに同居。コミット時は論理分割推奨（Track2 / feature-usage A / feature-usage B など）。
- **次TODO**: ①次回TestFlightビルドで全新イベント+user props を DebugView 確認、A2 の engagement 再帰属を GA4 で検証 ②包括計測の残り(履歴/設定全アクション/Safari拡張セットアップ/呼吸深掘り) ③既存イベントの trackEvent 移行。


## 2026-06-08: NASA Phase 2 — 全惑星バッジに NASA 由来テクスチャ適用

### 概要
Phase 1 で Earth のみだった NASA Blue Marble 風実写テクスチャを、太陽系の物理天体 10 種（Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Moon, Sun）に拡張。ホーム画面 `AnimatedOrb` カルーセルと Achievements `BadgeOrb` の両方で球面マッピングされた実写表現に統一。抽象バッジ（galaxy, cosmos, stellarSystem 等 8 個）は手続き描画を継続。

### 主な実装
- **新規アセット**: `assets/images/planets/{mercury,venus,earth,mars,jupiter,saturn,uranus,neptune,moon,sun}-equirect.webp`（合計 **1.81 MB**, Solar System Scope CC-BY 4.0）
- **新規取得スクリプト**: `scripts/fetch_planet_textures.sh`（curl + cwebp q80）
- **新規モジュール**:
  - `constants/planets/planetTextureMap.ts` — `getPlanetTexture(badgeId)`, `hasPlanetTexture(badgeId)`, `PLANET_BADGE_IDS`
  - `constants/planets/planetShaderConfig.ts` — per-planet `{cloudOpacity, atmosphereColor, emissive, rotationSpeed}` 定義
  - `components/dashboard/SaturnRingOverlay.tsx` — BadgeOrb 内の SaturnRing を共有抽出（ホーム画面でも環付き Saturn を表示）
- **リネーム & 汎用化**:
  - `EarthOrbRenderer.tsx` → `PlanetOrbRenderer.tsx`（badgeId prop で texture/uniforms を切替）
  - `lib/dashboard/skiaEarthInit.ts` → `skiaPlanetInit.ts`
  - `constants/shaders/earthOrb.ts` (`EARTH_SHADER`) → `planetOrb.ts` (`PLANET_SHADER`)：cloudOpacity / atmosphereColor / emissive / rotationSpeed を uniform 化、Sun の emissive=1 で陰影 & specular を無効化
- **ルーティング更新**:
  - `AnimatedOrb.tsx` — `badgeId === 'earth'` 単独判定を `hasPlanetTexture(badgeId)` に置換、`badgeId === 'saturn'` で `SaturnRingOverlay` も描画
  - `BadgeOrb.tsx` — 同じく `hasPlanetTexture` ルーティング、ローカル SaturnRing 定義を共有コンポに置換
- **ライセンス**: `docs/asset-credits.md` 新規（Solar System Scope CC-BY 4.0 + NASA 帰属）

### テスト
- 新規/拡張テスト: planetTextureMap.test.ts (24件) + planetShaderConfig.test.ts (31件) + planetOrb.test.ts (10件) + skiaPlanetInit.test.ts (3件) + PlanetOrbRenderer.test.tsx (31件) + SaturnRingOverlay.test.tsx (4件)
- 既存テスト更新: AnimatedOrb / OrbCarouselItem / BadgeOrb（モック testID を planet-orb-fallback-{badgeId} に置換、Saturn ring routing 追加）
- **結果**: jest 全体 **2,314/2,317 通過**（残 3 件は既存の i18nQuality + indexRouting、本作業と無関係）
- 関連 39 スイート / 330 テストすべて GREEN
- TypeScript: 私の変更分のエラーゼロ（既存 TS エラーは別作業由来）
- lint: 新規エラーゼロ（display-name 4件は旧 EarthOrbRenderer テストと同パターン）

### バンドル影響
- 10 惑星 WebP 合計 **+1.81 MB**（旧 earth-equirect.webp 166KB を削除済み、ネット +1.64 MB）
- 旧 EarthOrbRenderer/skiaEarthInit/earthOrb shader ファイル一式と関連テスト削除

### 削除ファイル
- `assets/images/earth-equirect.webp`（planets/ 配下に移動）
- `components/dashboard/EarthOrbRenderer.tsx` + tests
- `lib/dashboard/skiaEarthInit.ts` + tests
- `constants/shaders/earthOrb.ts` + tests

### Plan ファイル
`~/.claude/plans/nasa-phase-2-zippy-clarke.md`

### 注意点
- **App Store 公開前に Settings → About への CC-BY 4.0 帰属表示が必須**（docs/asset-credits.md の本文を流用）
- `cwebp` 依存（`brew install webp`）
- Solar System Scope の URL は `/textures/download/2k_*.jpg` パターン
- 未コミット状態

### 続き: Settings → About → クレジット 画面追加（2026-06-08 同日）

- **新規ファイル**: `app/credits.tsx`（テクスチャ提供元・CC BY 4.0 帰属・NASA 由来データの明記、`Linking.openURL(ccUrl)` で license 全文へ）、`app/__tests__/credits.test.tsx` (5件)
- **i18n キー追加**:
  - `nav.credits` (ja/en)
  - `settings.sections.about` ("について" / "About")
  - `settings.labels.credits` ("クレジット" / "Credits")
  - `legal.credits.{updatedDate, intro, planetsTitle, planetsBody, licenseTitle, licenseBody, ccUrlLabel, ccUrl}` (ja/en)
- **ルーティング**: `ROUTES.credits = '/credits'` 追加、`app/_layout.tsx` に Stack.Screen 登録（headerShown:true, title=t('nav.credits')）
- **Settings 統合**: `app/settings.tsx` に About セクション追加（サポートの直下、SettingItem icon="information-circle-outline"）。settings.test.tsx に 3 件追加（About 見出し / クレジット項目 / `mockPush('/credits')` 検証）
- **結果**: jest 全体 **2,323/2,326 通過**（+9 件新規、失敗 3 件は既存の i18nQuality + indexRouting で本作業と無関係）
- **設計判断**: クレジット画面は terms.tsx/privacy-policy.tsx と同じ構造（ScrollView + SectionTitle + Paragraph）で統一感を保つ。ライセンス全文は inline 表示ではなく Linking で外部ブラウザに飛ばす（CC license 文書は長文のため）

## 2026-06-08: Safari Web Extension 機能を完全削除（全ブラウザ共通 ScreenTime ブロッカーに統合）

### 概要
全ブラウザ共通の Screen Time（Family Controls）ベースブロッカーに移行済みのため、Safari Web Extension 関連のコード・UI・ネイティブターゲットを一掃。Post-purchase onboarding を 4→3 ステップに縮減。

### 主な変更
- **PPO (Post-purchase onboarding)**: 4 ステップ → 3 ステップに縮減
  - 旧: thankYou → safariSetup → demo → complete
  - 新: thankYou → screenTimeSetup → complete
  - `constants/postPurchaseOnboarding.ts` の型・配列・`DEMO_TEST_URL` を更新／削除
  - 新規 `components/postPurchaseOnboarding/ScreenTimeSetupStep.tsx`（`useScreenTimeSetup` + `DeviceActivitySelectionSheetView` を内包）
  - `app/post-purchase-onboarding/index.tsx` を簡素化、`useDemoBlockDetection` / `useFocusEffect` / `AppState` 監視・demo 関連 state 全削除
- **Profile (`app/(tabs)/profile.tsx`)**: Safari UI 全削除。`ContentBlockerPanel` + `UninstallLockCard` のみ残す。`SafariExtensionAlertCard` / `ToolCard` / `useWebExtensionStatus` / `useSafariSettingsDeepLink` 排除
- **Notification deep link (`hooks/useNotificationDeepLink.ts`)**: `panicNotificationTracker` 呼び出し削除。data.route と Shield Action (`categoryIdentifier === 'rewire-shield-panic'`) → /panic 経路は維持
- **削除メールデバッグ情報**: `DeletionDebugInfo.webExtensionStatus` フィールド廃止、`labelExtension` i18n キーも削除
- **app.config.ts**: `withSafariWebExtension` プラグイン登録と `SafariWebExtension` Extension target を削除
- **lib/routing/routes.ts**: `safariWebExtensionSetup` ルート削除
- **app/_layout.tsx**: `Stack.Screen name="safari-web-extension-setup"` 削除
- **i18n**: `safariWebExtension.*` (40+ キー) を ja/en 両方から削除
- **docs/release-testflight.md**: 3 profile → 2 profile に修正

### 削除ファイル（ソース）
- `app/safari-web-extension-setup.tsx`
- `components/safari-web-extension/`（5 ファイル）
- `components/postPurchaseOnboarding/SafariSetupStep.tsx` + `DemoStep.tsx` + 各テスト
- `components/profile/SafariExtensionAlertCard.tsx` + テスト
- `hooks/safariWebExtension/`（2 hook + 各テスト）
- `hooks/settings/useWebExtensionStatus.ts` + テスト
- `hooks/postPurchaseOnboarding/useDemoBlockDetection.ts` + テスト
- `lib/safariWebExtension/`（5 ファイル: bridge, panicNotificationTracker, deriveStatus, setupCompletion, types + 各テスト）
- `modules/expo-safari-web-extension/`（expo モジュール一式）
- `plugins/withSafariWebExtension.js` + テスト
- `ios/SafariWebExtension/`（ネイティブ拡張ターゲット）
- `documents/safari-blocked-page/`

### Xcode プロジェクト
`ios/Rewire.xcodeproj/project.pbxproj` には旧 SafariWebExtension target 参照が残るが、次回 `expo prebuild`（`scripts/release-testflight.sh` が実行）で `app.config.ts` をもとに再生成され削除される。

### テスト結果
- 全体 **2,215/2,218 通過**（残 3 件は既存の i18nQuality + indexRouting で本作業と無関係）
- 既存 Safari 関連テスト 6 スイートを Screen Time 系に置換 or 削除
- TypeScript: 私の変更分の新規エラーゼロ（既存 121 件は別案件由来）
- lint: 新規エラーゼロ

### 注意点
- バンドル ID `rewire.app.com.SafariWebExtension` の App Store Connect / Apple Developer Portal 上の App ID は手動で削除すべき（自動削除されない）
- 次回 TestFlight ビルドでは prebuild により SafariWebExtension target が project.pbxproj から消える
- 既存ユーザーは次回 update で Safari 拡張が自動的に動作停止（拡張本体がアプリバンドルから消えるため）

---

## 2026-06-08: App Store スクショ1枚目を「コード合成」で作成（日本語版）

### 作業内容
AI画像生成ではなく **HTML/CSS → ヘッドレスChrome → PNG** のコード合成で App Store スクショ1枚目（日本語版）を作成。端末内に**実スクショをそのまま埋め込む**方式なので審査 Guideline 2.3 が盤石。

### 構図
ダーク宇宙背景(`#0A0A0F→#1a1a3e→#2d1b4e`＋星＋発光オーブ) / 上部にアプリアイコン(紫グロー) / 見出し「欲に振り回されない毎日へ」(白・極太) / 中央に3D回転したiPhoneモック(実ダッシュボード) / 下部に月桂冠バッジ2枚「記録は端末の中だけ」「脳科学にもとづく設計」。

### 成果物
- **`scripts/appstore/output/appstore-jp-1_1320x2868.png`**（および `~/Desktop/` にコピー）
- 仕様: **1320×2868 / PNG / RGB / アルファなし**（2026年の6.9" iPhoneネイティブ最大。Appleが下位機種へ自動スケール）。`sips`/`file` で寸法・非アルファを検証済み。

### 新規ファイル（`scripts/appstore/`）
- `screenshot1.template.html` — レイアウト(CSS)。トークン `{{FONT_900}} {{FONT_700}} {{ICON}} {{SCREEN}} {{STARS}} {{LAUREL}}` を置換
- `build_screenshot1.py` — base64埋め込み→星生成→月桂冠SVGをパラメトリック生成(ベジェ茎に沿って葉を配置)→Chrome描画→Pillowでアルファ除去・寸法保証
- `fonts/NotoSansJP-{900,700}.woff2` — fontsource(jsDelivr)から取得し base64 埋め込み
- `assets/dashboard.jpg` — 埋め込んだ実スクショ(hiro提供、925×2000)
- `screenshot1.html`(生成物 6.3MB), `output/`

### 重要な学び・ハマりポイント
- **このMacに真の日本語 Hiragino / Noto CJK JP の静的フォントが無い**（Chinese variantのHiragino Sans GB/CNS/TCのみ）。日本語の極太見出しは **Noto Sans JP woff2 を base64 埋め込み**して決定論的に描画した。
- **ヘッドレスChromeのハング = stdoutパイプのEOF待ち**。Chromeはスクショ書き出し後も helper プロセスが stdout を握り続けるため、`subprocess.run(capture_output=True)` や `| tail` が永久にブロックする。対策: 出力をファイルへ流し、**PNGファイルの出現をポーリング**してから `--user-data-dir` パスで対象 Chrome のみ kill。`--use-mock-keychain` も付与(keychainプロンプト回避)。
- hiro提供スクショはチャット添付 → ディスクに無かったため **セッションtranscript(.jsonl)内のbase64から抽出**して取得した（添付画像が必要な時の汎用手段）。

### 未完了・次回
- 2〜N枚目のスクショ、米国版（見出し「Quit 🌽 with Rewire」）は未着手。テンプレを流用可能。
- ⚠️ 別件の**撮影用コード改変の戻し（本番ビルド前必須・未対応のまま）**: `app/index.tsx` の `DEV_SKIP_ONBOARDING` を false に / `lib/dev/seedDevUser.ts` の `streakStartDate`=now, `goalDays`=30 に戻す。

## 2026-06-09: ブランチ整理 + リファクタリング + NASA画像1k化

### 経緯
- 長期間積み上がっていた未コミット変更（100+ファイル、5機能領域）を main にプッシュ
- 並行してリファクタリング計画（失敗テスト修正 + デッドコード削除 + 画像最適化）を完了
- 計画書: `~/.claude/plans/nasa-1k-partitioned-valley.md`

### コミット履歴（main に直接マージ → push）
- `cbc86c8` chore(repo): ignore generated analytics & app store outputs
- `9807d35` refactor: drop Safari Web Extension stack and adopt Planet orb visuals（99 files, -3,379 lines net）
- `82acd7e` feat(analytics): tracking infra + retention/locale user properties（15 files, +400 lines）
- `e677fdf` chore: UX polish + release tooling + memory/docs（37 files, +1,536 lines net）
- `03aa031` perf(assets): downscale NASA planet textures to 1k（-1.4MB）

### 確定した事実（メモリ更新）
- **テスト**: 300スイート / **2213テスト全通過**。以前メモリに残っていた「DashboardScreen.integration / indexRouting / BrandScreen / OnboardingScreen / ConsentStep 失敗中」記述は**全て解消済み**。今後は「失敗テストなし」が現状
- **i18nQuality.test.ts** の失敗（`postPurchaseOnboarding.demo.description` 改行差）は demo ブロック削除で自動解決
- **デッドファイル一掃**: Safari Web Extension スタック（modules/expo-safari-web-extension, plugins/withSafariWebExtension, lib/safariWebExtension, hooks/safariWebExtension, components/safari-web-extension, ExtensionConfirmModal, SafariExtensionAlertCard, DemoStep, SafariSetupStep, useDemoBlockDetection, useWebExtensionStatus, safari-web-extension-setup.tsx, withSafariWebExtension.test.js, 関連 locale キー safariWebExtension/postPurchaseOnboarding.{safariSetup,demo}）と Earth Orb スタック（EarthOrbRenderer, earthOrb shader, skiaEarthInit, earth-equirect.png, content-blocker/*.jpg）を削除

### 永続的影響
- **App Store サイト保護方式が再々転換**: Safari Web Extension → **Screen Time `.auto()` 復帰**（ScreenTimeSetupStep 復活）。これで全ブラウザ対応に戻った。memory/MEMORY.md 上部の `Content Blocker Integration` セクションは**古い情報**になったので注意（次回触る時に書き換える）
- **惑星テクスチャは 1k (1024x512) が現行**。1.9MB → 508KB。Skia シェーダは uniform 駆動でコード変更不要
- **.gitignore 追加**: `data/analytics/`, `docs/analytics/daily-*`, `scripts/appstore/output/` はキャッシュとして除外。analytics データを git に積まない方針が確立

### 未完了・要対応
- ⚠️ 撮影用コード改変の戻し（前回からの繰り越し）: `app/index.tsx` の `DEV_SKIP_ONBOARDING=false`、`lib/dev/seedDevUser.ts` の `streakStartDate`/`goalDays` を本番ビルド前に戻す
- memory/MEMORY.md 上部の **Content Blocker Integration** セクションは Safari Web Extension 前提で書かれているが、現状は Screen Time `.auto()`。次に screen time / content blocker 系を触る前に書き換えが必要
- memory/safari-extension-detection.md は obsolete（拡張機能自体が消えた）

## 2026-06-09 (続き): release-testflight ツーリングのハードニング + TestFlight build 5 アップロード

### 経緯
- 上のセッション直後に `release-testflight` で TestFlight build 5 をアップロード（buildNumber 4 → 5 に bump）
- 実行中に **3つの構造的バグ** が連続して顕在化、その場での復旧 + tooling 修正を実施

### 顕在化した3バグ
1. **`scripts/release-testflight.sh --prebuild` は pod install を `--deployment` 固定で呼ぶ**: prebuild 直後の lockfile rewrite と非互換で必ず失敗
2. **`~/.local/bin/release-testflight` の workspace 検出**: `ls ios/*.xcworkspace ios/*.xcodeproj` は両方揃わないと exit 1。prebuild 直後は `.xcworkspace` がまだ無いので（pod install が生成する）絶対 fail
3. **`plugins/withWidget.js` の idempotency 欠如**: 既存 ios/ に対して prebuild を重ねがけすると `RewireWidgetViews.swift` の SourcesBuildPhase 参照が二重追加され、pod install の post_install フック (`fix_library_search_paths`) が xcodeproj save 時に `[Xcodeproj] Consistency issue` で落ちる

### 修正内容（コミット `3d6cea3`）
- **`~/.local/bin/release-testflight` を直接書き換え**（git 管理外、`~/.local/bin/release-testflight.bak.20260609` にバックアップ済）:
  - `--prebuild` に `--clean` を追加（`expo prebuild -p ios --no-install --clean`）。ios/ を全削除してから regenerate するため、withWidget.js を含む idempotent でない config plugin のバグを全部マスク
  - workspace 検出を **pod install の後ろに reorder**。pod install が `.xcworkspace` を生成してから検出する流れに変更
  - SEARCH_DIR の `ls a b` チェックを `ls a || ls b` に緩和（xcodeproj だけでもOK）
- **Rewire 側**: `scripts/release-testflight.sh` 削除、`scripts/ExportOptions.plist` 削除（global script が動的生成するため）、`package.json` の `release:testflight` を `release-testflight` 直呼びに変更、`docs/release-testflight.md` を rewrite

### 検証
- `release-testflight --prebuild --skip-upload` を smoke test → ARCHIVE SUCCEEDED + EXPORT SUCCEEDED、`build/ipa/Rewire.ipa` (41.1MB) 生成
- Consistency issue 再発無し、`No .xcworkspace` 出ず

### 永続的影響
- 全 Expo プロジェクトで `release-testflight --prebuild` が clean prebuild になる。Rootify / ai-room1 / qibla-compass-app / takt も今後同じ global script を共有可能
- `~/.config/appstore/credentials` で ASC creds は一元管理（既存）
- ExportOptions.plist は `build/ExportOptions.plist` に毎回動的生成（teamID は `$APPLE_TEAM_ID` から）

### 未解決・将来課題
- ⚠️ **`plugins/withWidget.js` の idempotency 修正は未着手**。`addBuildPhase` 前に既存フェーズ check を入れるのが本筋。現在は clean prebuild で実害ゼロだが、**`--prebuild` 無しで pod install を回す devloop では再発する**ので根本修正の価値あり。Option C（EAS の `appExtensions` 設定一本化）も検討余地あり
- TestFlight にアップロードされた build 5 (version 2.2.0) は Export Compliance / Test Information を App Store Connect 上で埋める必要あり（リリーススクリプト範囲外）

### 教訓
- 「`scripts/foo.sh` を作ったら global の同名スクリプトと重複する」パターンは要注意。コードは1箇所に集約 → 全プロジェクトで挙動を保つ
- `set -euo pipefail` 下で `ls a b` 形式の existence check は exit code 1 の罠。`[ -e a ] || [ -e b ]` か `find` を使う
- Config plugin の idempotency は Expo + 自作 plugin 環境では信用しない方が安全。release ビルドは常に `--clean` 推奨

## 2026-06-09: オンボーディングにスクリーンタイム許可フロー追加（Focusity 参考）

### 作業概要
メインオンボーディングの `features`（機能紹介）直後に2画面を新規追加し、購入後オンボーディング(PPO)のスクリーンタイム設定を一本化。
1. **データ保護画面**（`data_protection`）— 利用データが Apple に保護され開発者は閲覧不可と伝える情報画面。共有フッターの「次へ」で進行
2. **スクリーンタイム許可画面**（`screen_time_permission`）— マウント時に `useScreenTimeSetup().startSetup()` でネイティブ許可ダイアログを自動表示。Focusity 風に上下バウンスする誘導矢印で「続ける」ボタンへ誘導（iOS は「許可しない」を青ハイライトするため誤タップ防止）。許可→ブラウザ選択(`DeviceActivitySelectionSheetView`)→シールド適用まで実施。completed/denied/error で次ステップへ自動 advance

### 重要な前提訂正（⚠️ auto-memory が古かった）
- auto-memory(`~/.claude/projects/.../memory/MEMORY.md`)の「現行: Safari Web Extension」は**誤り**。実際は **Screen Time / Family Controls**（`react-native-device-activity` ^0.6.1）が現行。Safari Web Extension は commit `9807d35`(2026-06-09)で削除済み
- `lib/screenTime/screenTimeBridge.ts` の `requestAuthorization()` が JS から iOS 許可ダイアログを呼べる（追加ネイティブコード不要）。`useScreenTimeSetup` フックが許可→ピッカー→シールドの全フローをオーケストレーション
- ネイティブ許可ダイアログはアプリ View の上に別ウィンドウ表示されるため矢印を重ねられない。矢印はダイアログ下の余白に絶対配置で描画（`PermissionArrow.tsx` の `ARROW_LEFT_RATIO`/`ARROW_BOTTOM` で近似。実機で要微調整）

### 新規ファイル
- `components/onboarding/DataProtectionStep.tsx`（+ test）
- `components/onboarding/ScreenTimePermissionStep.tsx`（+ test）— `useScreenTimeSetup` 再利用。マウント時 startSetup（useRef ガード）
- `components/onboarding/PermissionArrow.tsx` — reanimated の withRepeat バウンス chevron-up + ヒント文言

### 変更ファイル
- `constants/onboarding.ts` — OnboardingStep union に2型、STEPS に features 直後挿入、`screen_time_permission` を NO_FOOTER_TYPES/NON_COUNTABLE_TYPES に、両型を canGoBack→false
- `components/onboarding/OnboardingStepRenderer.tsx`（+ test）— 2 case 追加。screen_time は `onComplete={onAutoAdvance}`
- `locales/ja.ts` / `locales/en.ts` — `onboarding.dataProtection` / `onboarding.screenTimePermission` 追加
- PPO 一本化: `constants/postPurchaseOnboarding.ts`（steps を thankYou/complete の2つに）、`app/post-purchase-onboarding/index.tsx`（ScreenTimeSetupStep 除去、thankYou→complete 遷移時に markCompleted）、`components/postPurchaseOnboarding/ScreenTimeSetupStep.tsx` **削除**、PPO テスト2件更新
- 回帰修正: `app/onboarding/__tests__/ConsentStep.test.tsx`（フル遷移ヘルパーに新2ステップ対応＋ScreenTimePermissionStep を auto-advance モック）

### テスト/品質
- **302 suites / 2223 tests 全通過**。変更ソースファイルの lint クリーン。新規ファイルは tsc クリーン（既存の StarryBackground/FeaturesStep 等の tsc エラーは変更前から）
- TDD（Red→Green）で各コンポーネント実装

### 要確認・次回検討
- **課金前シールド適用の是非**: 本フローは無料(ペイウォール前)ユーザーにもコンテンツブロックを有効化。Focusity 型「価値先出し」だが CVR への影響は要観測。許可のみ取得しシールド適用は購入後に遅延させる選択肢もあり
- **矢印位置の実機微調整**: `PermissionArrow.tsx` のオフセットは近似値。development build（Family Controls は実機のみ。`DEV_SKIP_ONBOARDING=false` に戻す）で確認し調整
- 参考画像の「ヘルプ」ボタンは挙動未定義のため未実装

## 2026-07-05: 実機検証 + 画面整理 + アップデート告知/強制更新 + ペイウォール文言修正

### 作業内容
1. **実機「No script URL provided」解消**: Metro 未起動＋Debugビルドの接続先未記録が原因。`npx expo run:ios --device "hiroakiのiPhone"` で再ビルドし解消（実機はUSB接続・要ロック解除。ロック中はインストール後の起動が `device is locked` で失敗する）
2. **/screen-time-setup 画面（「他のブラウザを封印」）削除**: パネルは維持し設定画面のみ削除。`ContentBlockerPanel` に `useScreenTimeSetup`＋`DeviceActivitySelectionSheetView`（Modal）をインライン化。`BrowserShieldToggleCard`（未使用）も削除。`ROUTES.screenTimeSetup`／`_layout` の Stack 登録除去
3. **設定画面にデバッグメニュー**: `constants/debug.ts` の `DEBUG_MENU_ENABLED` で「オンボーディングをもう一度見る」(`router.push('/onboarding')`) を表示。**archive 前に必ず false に戻す**（グローバル auto-memory にも記録済み）
4. **設定「について」→「アプリについて」**（ja）
5. **ウィジェット多言語化（根本対応）**: Swift にハードコードされていた日本語が原因。`WidgetPayload`/`WidgetData` に `locale` を追加（`resolveWidgetLocale`=localeStore 尊重・system は端末言語）、`RewireWidgetViews.swift` に `WidgetStrings`（ja/en 出し分け、旧データは ja フォールバック）、言語変更時 `resyncWidgetFromStores()`（app/settings.tsx）。ウィジェット変更はネイティブ再ビルド必須
6. **アップデート告知モーダル**: `WhatsNewModal`＋`useWhatsNewModal`（AsyncStorage `whats_new_seen_version` vs `constants/appUpdates.ts` の `WHATS_NEW_VERSION`、既存ユーザーのみ・新規は既読記録のみ）。`(tabs)/_layout` に配線、CTA→profileタブ
7. **強制アップデート**: `ForceUpdateModal`（閉じられない・App Store `id6759087214` へ誘導）＋`useForceUpdateGuard`＋`appConfigClient`（Firestore `appConfig/ios` の `minSupportedVersion`、フェイルオープン）＋`lib/version/compareVersions`。RootLayout に配線
8. **ホーム画面にスクリーンタイム許可カード**: `ScreenTimePermissionCard`＋`useScreenTimePermissionCard`（承認済み以外で表示、`requestAuthorization`、AppState 復帰で自動更新）。QuickActionGrid（カレンダーボタン行）の直下
9. **ペイウォール文言修正**: `preBenefits.features`（「Safari カスタム保護」→「全ブラウザを自動ブロック」等、翻訳調を Web リサーチに基づき修正）。`paywall.unavailableMessage` の敬体統一。ja/en 両方

### 重要な注意
- **強制アップデートは配布済み旧バージョンには効かない**（コード未搭載のため遡及不可）。今回のバージョンから機構が有効
- **hiro の作業（GUI）**: Firebase コンソールで ①Firestore に `appConfig` コレクション → `ios` ドキュメント → `minSupportedVersion`（string）作成 ②セキュリティルールで `appConfig` の read 許可（surveys は write のみの想定のため）
- リリース時: `WHATS_NEW_VERSION`（constants/appUpdates.ts）と app.config.ts の version を合わせて上げる。`DEBUG_MENU_ENABLED=false` に戻す
- jest モックの罠: `jest.mock` factory で外側の jest.fn を**オブジェクトリテラルで即時参照すると TDZ で null**（クライアント側 try/catch が握りつぶす）。必ず `() => mockFn(...)` の遅延参照にする（lib/appConfig テスト参照）
- `useScreenTimeSetup` を使う効果フックで「state 更新→依存変化→cleanup の cancelled=true」レースに注意（useWhatsNewModal は checkedRef で回避）

### テスト/品質
- **310 suites / 2272 tests 全通過**（+8 suites/+50 tests）。tsc エラー45件は全て既存ベースライン。lint 新規エラーなし
- 未コミット状態

### 次回やるべきこと
- 実機での動作確認: 許可カード（ホーム）、アプリをブロック（プロフィール、Modal化したピッカー）、デバッグメニュー、ウィジェット言語切替（ネイティブ再ビルド済みバイナリで）
- Firestore ルール設定後、強制アップデートの実機テスト（minSupportedVersion を現行より上に設定して確認）
- グローバル auto-memory の MEMORY.md が197行で読み込み上限(200行)接近 — 整理は hiro に承認を得てから

### 追記: オンボーディング「許可ダイアログが出ない」調査（同日）
- **原因は iOS 仕様**: Family Controls の許可ダイアログは `notDetermined` のときに一度だけ表示。許可済み端末では `requestAuthorization` が即 approved を返し、ブラウザ選択ピッカーに直行する（hiro の実機は許可済みだったためダイアログ非表示）。新規ユーザー端末では表示される
- 修正①: `ScreenTimePermissionStep` の mount 自動起動を「notDetermined のときのみ」に変更（許可済み端末で文脈なしにピッカーが突然開くのを防止）
- 修正②: ホーム許可カード — 拒否済み端末では iOS が二度とダイアログを出さないため、タップ時に「設定を開く」Alert（`Linking.openSettings`）を表示（タップ前が denied かつ結果非承認のときのみ。今まさに拒否した直後は出さない）
- 修正③: オンボーディング説明文に「許可のあと、ブロックしたいブラウザやアプリを選んでください」を明記（ja/en）
- 再テスト方法: 設定 → スクリーンタイム → 一番下の「スクリーンタイムにアクセスできるApp」等から Rewire の許可を取り消すと notDetermined に戻せる場合がある。確実なのは別の実機/シミュレータ
- テスト: 310 suites / 2277 tests 全通過

### 追記: EXC_BAD_ACCESS クラッシュ調査（既知問題・修正見送り）2026-07-05
- **シグネチャ**: `facebook::react::Scheduler::uiManagerDidDispatchCommand(...)::$_0::operator()()` で EXC_BAD_ACCESS（JavaScriptスレッド、実機 Xcode デバッグ中に発生）
- **根本原因（RN 0.81 のフレームワークバグ）**: `Scheduler.cpp` の `uiManagerDidDispatchCommand`（L280）と `uiManagerDidFinishTransaction`（L254）が、遅延実行ラムダに**生ポインタ `delegate_` をキャプチャ**。Scheduler 破棄（JSリロード・サーフェス終了・アプリ終了）後にラムダが実行されると解放済み delegate を参照してクラッシュ。アプリ側コードのバグではない
- **upstream 状況**: main には修正済み（`delegateInvalidated_` = shared_ptr<atomic<bool>> ガード + `enableSchedulerDelegateInvalidation` フラグ）。**0.81-stable（0.81.6含む）には未バックポート**。0.81.5 にはフラグ自体が存在しない
- **修正しなかった理由**: 修正には patch-package で C++ バックポート＋`ios.buildReactNativeFromSource=true`（ios/Podfile.properties.json）への切替が必要だが、**Expo SDK 54 はプリビルド RN core（ReactNativeCore-artifacts）を使用**しており、ソースビルド化で初回+10〜20分/EASビルドも遅化。クラッシュは主にリロード/終了時競合の稀な事象のため、hiro 判断で見送り
- **将来の解消**: Expo SDK 55+（修正入り RN）へのアップグレード時に自然解消見込み。それまで同シグネチャのクラッシュレポートは既知として扱う
- 参考: プリビルド無効化は `ios/Podfile.properties.json` に `"ios.buildReactNativeFromSource": "true"`（Podfile L18 が RCT_USE_PREBUILT_RNCORE を制御）

## 2026-07-06: ASO刷新 — App Store Connect メタデータ変更（日英・ディスクリート案）⚠️審査関連
- **背景**: ASO無料リサーチ（Apple公式サジェストAPI・iTunes Search API・keywordtool.io無料枠）に基づき、タイトル/サブタイトル/キーワードを刷新。ガイドライン2.3.7/2.3.8/1.1.4 の原文確認済み。「オナ禁」「porn」等のセンシティブ語は**非公開のキーワード欄のみ**に置くディスクリート方針（米国最大手 QUITTR と同戦略）
- **ASC入力済み（保存済み・「審査用に追加」は未実行。v2.3 提出時に反映）**:
  - 日本語 名前: `Rewire: 禁欲カウンター・ポルノブロッカー`（旧: Rewire）
  - 日本語 サブタイトル: `アダルトサイトを全ブラウザでブロック`（旧: ポルノをやめるアプリ）
  - 日本語 キーワード: `オナ禁,タイマー,依存症,スマホ依存,ドーパミン,デトックス,やめる,自制心,衝動,集中力,悪習慣,深呼吸,瞑想,回復,習慣,記録,我慢,中毒,制限,禁止`（77/100）
  - 英語(US) 名前: `Rewire: Adult Site Blocker`（旧: Rewire- Reset & Focus）
  - 英語(US) サブタイトル: `Addiction Recovery Day Tracker`（旧: Quit the habit, reboot focus）
  - 英語(US) キーワード: `porn,quit,nofap,dopamine,detox,streak,counter,habit,willpower,urge,relapse,filter,website,safari`（96/100、旧: reboot,dopamine detox,self control,streak,recovery,abstinence,urge,blocker,addiction,willpower）
- **リサーチ要点**: JP主要検索=オナ禁タイマー/カウンター・禁欲カウンター（最大手12,508件）・ポルノブロッカー。US=「porn」系はサジェスト完全抑制、「nofap」「adult content blocker」「dopamine detox」はサジェストあり。QUITTR(32,618件)は公開メタデータにporn不使用。日米とも「Rewire」名の競合アプリ複数あり（ブランド名単独タイトルは埋没リスク）
- **注意**: 「nofap」はNoFap LLCの商標 → キーワード欄限定を維持。万一2.3.7/2.3.8でメタデータリジェクトされたら該当語差し替えのみで再提出可（バイナリ不要）
- **未対応**: プロモーションテキスト（170字・日英とも空欄）— 審査なしで随時設定可能。概要文は今回未変更

## 2026-07-06: スクリーンタイム許可フローを課金後（PPO）へ移動＋ピッカー撤去
- **方針（hiro 指示）**: ①オンボーディングの Choose Activities（ブラウザ/アプリ選択ピッカー）は不要 ②スクリーンタイム許可モーダルは課金ユーザーのみ（ペイウォール後）に表示 ③アプリ別ブロックはプロフィールの「アプリをブロック」からのみ
- **課金前オンボーディング**: `data_protection` / `screen_time_permission` ステップを完全削除（constants/onboarding.ts の union・STEPS・NO_FOOTER_TYPES・NON_COUNTABLE_TYPES・canGoBack、OnboardingStepRenderer の case、ConsentStep.test の遷移ヘルパー）
- **PPO（課金後）**: `thankYou → dataProtection → screenTime → complete` の4ステップに拡張（constants/postPurchaseOnboarding.ts）。logStepViewed は POST_PURCHASE_STEPS[step] 参照に変更
- **新ステップ実装**（components/postPurchaseOnboarding/ に移設）:
  - `DataProtectionStep`（onNext ボタン付きに改修、旧オンボーディング版は共有フッター依存だった）
  - `ScreenTimePermissionStep`（**ピッカーなし**。`useScreenTimeSetup` の新関数 `startWebFilterSetup` を使用 = 許可→`applyAppShield(t, false)`（自動Webフィルターのみ、Layer1）→markShielded→completed。notDetermined のときだけマウント時自動起動）
  - `PermissionArrow` は components/ui/ へ移動
- **locale**: `onboarding.dataProtection`/`onboarding.screenTimePermission` → `postPurchaseOnboarding.*` へ移動。説明文は「許可すると、すべてのブラウザで保護が有効になります」に更新（ピッカー言及を削除）
- **削除**: components/onboarding/{DataProtectionStep,ScreenTimePermissionStep}.tsx + 各テスト
- テスト: **310 suites / 2284 tests 全通過**、変更ファイル lint クリーン、tsc は既存ベースライン45件のみ
- 未コミット状態
- 注意: PPO の Skip は全ステップで markCompleted → tabs 遷移（許可スキップ可能）。ホーム画面の許可カード（昨日実装）が未許可ユーザーのリカバリー導線として機能する

### 追記: ブロッカーOFF時の深呼吸ゲート実装（2026-07-06）
- **仕様**: プロフィールのコンテンツブロッカー電源ボタン（ON→OFF操作）で即オフにせず、閉じられない深呼吸モーダルを強制表示。3回の呼吸サイクル（吸6s→止4s→吐6s、BREATHING_CONFIG 再利用）完了後にのみ「本当にオフにしますか？」確認（保護を続ける=gradient / オフにする=ghost）。確認で clearAppShield+markCleared
- **新規**: `hooks/screenTime/useBreathingGate.ts`（SOSの useBreathingEngine とは別実装: 画面遷移なし・フェーズ毎の単発ハプティクスのみ）、`components/screen-time/BreathingGateModal.tsx`（BreathingCircle を scale 0.6 で再利用、onRequestClose 無効・オーバーレイタップ不可・×なし）
- **変更**: ContentBlockerPanel（enabled 時の power press → gateVisible、handleGateConfirm/Cancel 分離）、locale ja/en（contentBlocker.breathingGate）
- **学び**: `app/__tests__/indexRouting.test.tsx` は本番設定ガード — `DEV_PREVIEW_POST_PURCHASE=true` のままだと正しく fail する（dev フラグ戻し忘れ検知として機能）。PPO プレビュー確認後にフラグを false へ復帰済み
- renderHook で initialProps を使う場合はコールバック引数に明示型注釈（`(props: { active: boolean }) =>`）が必要（unknown 推論で tsc エラー）
- テスト: **312 suites / 2302 tests 全通過**、tsc ベースライン45、lint クリーン。未コミット

### 追記: 深呼吸ゲートを全画面デザインに変更（hiro フィードバック反映）
- カード型モーダル → **SOS呼吸画面（app/breathing）と同一の全画面デザイン**に変更（ダークグラデーション #0f172a→#1e293b、BreathingText/BreathingCircle/BreathingTimer をそのまま再利用、StatusBar hidden、fullScreen presentation）
- **×ボタンは右上**（既存呼吸画面は左上だが、hiro 指定で右上）。呼吸中・確認画面のいつでも×で中断可能（中断＝オフにしない）。Android back（onRequestClose）も同じくキャンセル
- 3回完了後のみ「本当にオフにしますか？」（保護を続ける=gradient / オフにする=ghost）を全画面中央に表示
- locale の breathingGate.title/subtitle は不要になり削除（confirm系のみ残存）
- テスト: 312 suites / 2302 tests 全通過

### 追記: 振り返りシートの宇宙UI背景化（2026-07-06、プラン承認済み）
- ReflectionSheet の背景を BlurView+単色 → `StarryBackground`（`gradients.background` トークン＋星40個 twinkle、ダークのみ星表示）に置換。シートの角丸40+overflow:hidden がクリップ。背景は ReflectionStepContainer の外側（ステップ遷移で星の位相が飛ばない）
- `StarryBackground` を components/onboarding/ → **components/ui/** へ移動（宇宙装飾ファミリーに統一、7ファイルの import/jest.mock パス更新: brand.tsx, onboarding/goal.tsx, BrandScreen.routing/locale, brandRouting, goal, goalAnalytics テスト）
- オーバーレイ `'#000'`×0.6 → `colors.overlay` トークン（アルファ込みのため opacity=progress に変更、他モーダルと統一）
- expo-blur は ReflectionSheet から除去（不透明グラデ下のブラーは無意味）。テストの expo-blur モックも削除
- テスト: **312 suites / 2306 tests 全通過**（+4: starry-background/gradient色/星のダーク表示/ライト非表示）、tsc ベースライン45、lint 新規エラーなし。未コミット

## 2026-07-08: 購入後オンボーディング（PPO）フロー再設計 — ブロックボタン自己起動＋触覚＋トースト（プラン承認済み）
- **背景**: 購入直後に唐突に個人情報の話とスクリーンタイム許可を迫る流れだった。「なぜ許可が必要か」を先に説明し、最後にユーザー自身がブロックボタンを押して保護を開始する体験へ変更
- **新フロー（4→6ステップ）**: ThankYou → **ScreenTimeIntro（新規: 許可の理由説明）** → DataProtection（既存維持） → ScreenTimePermission（**許可のみ取得に変更**） → **BlockerActivation（新規: 全画面ブロックボタン）** → Complete（既存維持→tabs）
  - `constants/postPurchaseOnboarding.ts`: `POST_PURCHASE_STEPS` 6要素、`TOTAL=6`、`BLOCKER_ACTIVATION_ADVANCE_DELAY_MS=1800` 追加。`app/post-purchase-onboarding/index.tsx` は step===0〜5 のハードコード分岐（データ駆動でない点は従来通り）
- **ブロックボタン体験の共通化（PR1）**:
  - `components/ui/Toast.tsx`（表示のみ、RN Animated フェード、`!visible && !rendered` で即描画）＋ `hooks/ui/useToast.ts`（show/hide＋自動消滅タイマー＋unmount クリーンアップ、既定1800ms）
  - `components/screen-time/BlockerPowerButton.tsx`（ContentBlockerPanel の円形パワーボタンUIを抽出。ACTIVE=#3DD68C/INACTIVE=#FF3B3B を export。testID prop で既存 testID 維持）
  - `hooks/screenTime/useShieldActivation.ts`（OFF→ON ロジック共通化: **busyRef で同一レンダー内二重起動ガード**＋`impactAsync(Heavy)`押下→認可フォールバック→`applyAppShield(t,!!selectionToken)`→`markShielded`→`notificationAsync(Success)`→boolean）
  - `ContentBlockerPanel` は power ボタンを `BlockerPowerButton` に、ON分岐を `useShieldActivation.activate()` に委譲、成功時 `toast.show()`。OFF用に `isClearing` state 分離。ON成功時トースト表示（`contentBlocker.activatedToast`）。既存13テスト無変更で通過（useTheme モックに `shadows:{sheet:{}}` 追加のみ）
- **許可のみ化**: `hooks/screenTime/useScreenTimeSetup.ts` の `startWebFilterSetup` → **`requestPermission`** にリネームし applyAppShield/markShielded を削除（許可のみ）。呼び出し元は ScreenTimePermissionStep のみ。→ 次の BlockerActivation でボタンOFF(赤)スタート、押下で ON(緑)
- **BlockerActivation（PR2）**: `hooks/postPurchaseOnboarding/useBlockerActivationStep.ts`（押下→activate→analytics `post_purchase_blocker_activated`→toast→`advanceTimerRef` で1.8秒後 onComplete、成功後の再押下無視、unmount クリーンアップ）＋ `components/postPurchaseOnboarding/BlockerActivationStep.tsx`（表示のみ、testID=`blocker-activation-power-button`/`blocker-activation-toast`）。右上スキップは既存 `step < TOTAL-1` 判定で step4 も表示
- **設定デバッグ再表示（PR3）**: `lib/routing/routes.ts` に `postPurchaseOnboarding: route('/post-purchase-onboarding')` 追加。`app/settings.tsx` デバッグ節に「購入後オンボーディングをもう一度見る」追加（icon=sparkles-outline）。`usePaywallOrchestration.ts:62`・`app/index.tsx` の生文字列を ROUTES 参照に統一
- **ロケール**: ja/en に `postPurchaseOnboarding.screenTimeIntro.{title,description,cta}`・`blockerActivation.{title,description}`、`contentBlocker.activatedToast`（「これでポルノサイトのブロックが完了しました！」）、`settings.labels.replayPostPurchaseOnboarding` 追加。`screenTimePermission.description` を「許可すると保護が有効」→「ダイアログで続けるをタップ」に更新（自動適用しなくなるため）
- **リスク**: 新フローは step4/5 をスキップすると「許可済み・ブロック未適用」になる（`post_purchase_onboarding_skipped {fromStep}` と新規イベントで監視推奨）。`post_purchase_step_viewed` の step 名に screenTimeIntro/blockerActivation 追加＋既存名のインデックス位置変化（イベント名自体は互換）
- **テスト**: **319 suites / 2345 tests 全通過**（TDD 全ステップ Red→Green）。新規テスト7＋既存テスト6更新。lint 新規エラーゼロ（test の import/first 警告は jest.mock 先行の既存慣習）。tsc: 変更ファイルに新規エラーなし（`usePostPurchaseFlow.ts:41` の既存エラーは非変更）
- **未検証**: iOS 実機/dev build でのランタイム E2E（Screen Time/Family Controls はネイティブ・実機必須のため hiro のビルドが必要）。DataProtection/CompleteStep は削除せず維持
- 未コミット状態

## 2026-07-10
- 定期タスク: デイリー分析パイプライン実行（2026-07-09分）
- ASC APIから3レポート取得成功、ファネル分析実行、docs/analytics/daily-report-2026-07-09.md 生成
- 結果: インプレッション71（前日98から減少）、PV率4.2%（前日7.1%）、DL 0件継続。ボトルネックはDL率（0% vs ベンチマーク30%）
- 注意: TikTokチャネルのデータなし。DLゼロが継続中のためプロダクトページ改善が急務
- 変更ファイル: data/analytics/2026-07-09/*.tsv, docs/analytics/daily-report-2026-07-09.md, daily-metrics-2026-07-09.json

## 2026-07-11（定期タスク: rewire-daily-analytics）
- 作業内容: ASC APIから2026-07-10分のデータ取得（5レポート）→ ファネル分析 → 日次レポート生成
- 結果: インプレッション119（前日71から+68%）、ページビュー6（5.0%）、DL 0件。ボトルネックはDL率（0% vs 基準30%）
- 未完了/次回: DL 0が3日以上継続。プロダクトページ改善（スクリーンショット・プレビュー動画・説明文冒頭）が最優先課題
- 変更ファイル: docs/analytics/daily-report-2026-07-10.md, daily-metrics-2026-07-10.json, data/analytics/2026-07-10/*.tsv

## 2026-07-12（日次レポートのメール整形: Focusity形式へ移植）
- 課題: 「Rewire 日次レポート」メールの表が Gmail で崩れて読みづらい。原因は mailer.py の markdown_to_html がパイプ表を丸ごと <pre> にダンプしていたため
- 対応: Focusity(ScreenCity) の scripts/analytics/html_report.py を参考に、Rewire 用の決定論的インラインCSS HTMLレンダラを新規実装
  - 新規: scripts/analytics/html_report.py … build_html(payload, target_date, insights_md=None) / headline(payload)。asc/revenuecat/firebase ペイロードから本物の <table> を生成。色分けセル(⚠️/警告色)、RevenueCat期間の日本語化(P28D→過去28日)、GA4イベント名の日本語化(生IDは用語集のみ)、TL;DR バナー、用語集・注記。データ表は決定論的に生成し、LLMの横断分析/改善提案のみ insights_md から抽出してHTML化
  - 変更: mailer.py に html_body 引数を追加（Focusityと同型。html_body優先、無ければ従来のmarkdown_to_htmlにフォールバック）
  - 変更: send_daily.py … build_html で html_body を組み立て send_email へ渡す。--date YYYY-MM-DD 追加（過去日の再送用）。dry-run時は daily-report-<date>.html を書き出し
  - 変更: data_loader.py に find_metrics_for_date() 追加（-corrected 優先）
- TDD: 先にテストを書いてRed→実装でGreen。test_html_report.py 新規、test_mailer.py / test_send_daily.py / test_data_loader.py 追記。全 163 passed（従来144+新規19）
- 再送: 2026-07-10 分を新フォーマットで再送信済み（Resend, message id aa05ff5a-...）。Gmail着弾確認済（スニペットに |---| ダンプなし）。再送はASCはJSON実データ、RevenueCatは当時のメール記載値(MRR$8/28日・トライアル5・サブスク2・新規37・稼働45)、firebaseは当時と同じGA4 invalid_scope エラーを忠実に再現し、横断分析/改善提案は元の daily-report-2026-07-10-agent.md を流用
- 未完了/次回:
  - 変更は未コミット（ユーザー指示待ち）。scripts/analytics/{html_report.py,mailer.py,send_daily.py,data_loader.py} と tests、docs/analytics/daily-report-2026-07-10.html
  - GA4(Firebase)は invalid_scope で取得失敗が継続中。GOOGLE_APPLICATION_CREDENTIALS のスコープ修正が別途必要（今回は未対応）
  - 以降の日次cronは自動的に新HTMLフォーマットで送信される（send_daily.py 経由）

## 2026-07-12（続き: 日次レポートをFocusityと同一構成へ再設計）
- 要望: RewireのメールをFocusityと「全く同じ構成」（セクション順・見出し・表レイアウト）にし、中身だけRewireの数値に。ユーザーがFocusity 2026-07-11メール全文をフォーマット見本として提示
- 対応: scripts/analytics/html_report.py を Focusity版の構成に完全準拠で作り直し（決定論的・LLMナラティブ廃止）。セクション順:
  1.今日の要点[項目|値|前日比] 2.サマリー（前日vs直近7日平均）[指標|前日|7日平均|変化] 3.回復ファンネル（SOS）※Focusityの集中ファンネル相当 4.収益ファンネル（ペイウォール→購入）※建築とクラフト相当 5.オンボーディング（初回設定） 6.振り返り・記録※タブ利用相当 7.共有 8.収益（RevenueCat）※Rewire固有 9.リテンション（継続率） 10.全イベント発火状況（計測ギャップ検出）[イベント|回数|人数|種別] 11.App Store取得（媒体別・ASC） 12.用語集 13.注記
  - Focusityのドメイン（集中/建築/クラフト/タブ）→Rewireのドメイン（SOS呼吸/ペイウォール/オンボ/振り返り）にマッピング。中身のイベントはREWIRE_KEY_EVENTS
  - 横断分析/改善提案（前turnで追加したLLMナラティブ）は Focusity準拠のため削除。build_htmlのinsights_md引数は後方互換で残すが未使用
  - GA4取得失敗時は各firebaseセクションが「取得できませんでした」フォールバック行に degrade（Focustyと同様）。ASC/RevenueCatは常に表示
- send_daily.py: firebaseに retention（fetch_ga4_retention→summarize_retention）と all_events（fetch_all_events）を追加取得しマージ（各soft-fail）。→リテンション/全イベントもGA4復旧時に埋まる
- TDD: test_html_report.py 全面刷新（Focusity構成の順序・表形状を検証）、test_send_daily.py 追記。全 168 passed
- 再送: 2026-07-11分を新構成で送信済（Resend message id e4db5920-...）。Gmail着弾確認。ASCは実データ(表示218/PV12/タップ2/DL0)、RevenueCatはライブ取得(MRR$8/サブスク2/トライアル5/新規37/稼働45)、GA4は invalid_scope で fallback表示
- ⚠️GA4 invalid_scope の原因特定: RewireのGOOGLE_APPLICATION_CREDENTIALSが ~/.config/gcloud/application_default_credentials.json（type=authorized_user のADC）を指しており、analyticsスコープを付与できず invalid_scope。Focusityは service_account JSON(/Users/arimurahiroaki/.config/firebase/focusity-ga4-sa.json, focusity-analytics-reader@...)を使用。修正=RewireもSA JSONを ~/.config/firebase/ga4-sa.json に置きGA4プロパティにViewer付与→envのGOOGLE_APPLICATION_CREDENTIALSをそこへ。手順はrewireのSETUP_FIREBASE.md既載（ユーザー作業、コンソール操作のため未実施）
- 未完了/次回: 変更未コミット。GA4のSA認証修正はユーザー作業待ち。次回日次cronから自動で新構成HTMLで送信される

## 2026-07-12（続き2: 横断分析・改善提案（従来データ）をFocusity構成の上に復活）
- 要望: 「現状のこの項目に追加して」、RevenueCatのデータと「今まで通りメールに出力していたデータ」もGmailレポートに入れてほしい
- 原因判明: send_daily.py は今も generate_report()（Claude, `claude -p`）で従来形式（App Storeファンネル/収益/ユーザー活動/横断分析/改善提案）の文章を生成しmarkdownファイルには保存していたが、直前のFocusity構成書き換えで html_report.build_html の insights_md 引数が「受け取るが未使用」になっており、横断分析・改善提案がメールから消えていた（＝「今まで通り出力していたデータ」が欠落していた原因）
- 対応: html_report.py に _insights_section/_render_markdown_block/_inline/_NARRATIVE_HEADINGS を再実装し、build_html内で _asc_section の後・_glossary の前に _insights_section(insights_md) を追加。これでFocusity準拠の決定論的テーブル群（今日の要点〜App Store取得）＋横断分析＋改善提案＋用語集/注記、という構成になった。RevenueCatは前回追加済みのセクション8（収益(RevenueCat)）がそのまま残る
- TDD: test_html_report.py に insights_md有無のテスト追加（narrativeの位置がASC後・用語集前であることも検証）、test_send_daily.py に narrative がhtml_bodyまで流れることを検証するテスト追加。全171 passed
- 実パイプラインで確認: `python3 -m scripts.analytics.send_daily --date 2026-07-11 --dry-run` で実際にClaude呼び出し→横断分析/改善提案生成→HTML化を確認（Chromeで目視、位置・整形とも正しい）。その後 `--date 2026-07-11`（dry-run無し）で実送信し、Gmail着弾確認（message id b687e1b5-...）
- 未完了/次回: 変更は未コミット。GA4 invalid_scope は引き続き未修正（前回メモ参照: FocusityのSA JSONを流用するかRewire専用SAを作る）

## 2026-07-13（定期タスク: rewire-daily-analytics）

### 作業内容
- ASC API から 2026-07-12 分のデータ取得（8レポート成功）
- ファネル分析実行 → docs/analytics/daily-report-2026-07-12.md / daily-metrics-2026-07-12.json 生成

### 結果概要
- インプレッション 269（前日 218 から +23%）、ページビュー 24（PV率 8.9%、前日 5.5% から改善だがベンチマーク未達）
- レポート上ダウンロード 0 だが、TSV内の実データは 2026-07-10 付（ASCの約2日ラグ）。07-10 実績: 初回DL 1件、自動更新 3件
- トライアル・課金 0

### 注意事項・発見した問題
- analyze_funnel.py は対象日でフィルタするため、ASCのデータラグ（DL系レポートは~2日遅れ）により Downloads が常に 0 と表示される可能性が高い。日付ラグを考慮した集計ロジックの修正を検討すべき
- サンドボックスから実行する場合 HOME 環境変数の指定が必要（~/.config/asc 解決のため）

### 次回やるべきこと
- analyze_funnel.py のデータラグ対応（DL/購入系はレポート日付ではなくTSV内日付で集計）
- プロダクトページ改善（スクリーンショット・プレビュー動画・説明文冒頭）

### 変更ファイル
- data/analytics/2026-07-12/*.tsv（新規取得）
- docs/analytics/daily-report-2026-07-12.md, daily-metrics-2026-07-12.json
