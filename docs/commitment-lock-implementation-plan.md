# コミットメントロック機能 実装計画

> **Status**: 未実装 / 計画段階
> **作成日**: 2026-04-23
> **対応メモリ**: `memory/screentime-device-activity.md`, `docs/screen-time-restoration.md`

---

## 1. Context — なぜこの機能を作るか

Rewire は性依存からの回復を支援するセルフコントロールアプリ。ユーザーが**衝動に駆られた瞬間に Rewire 自体をアンインストールしてブロック機能を回避する**挙動を防ぎたい。

QUITTR、Opal、Jomo、BlockerX などの競合は全て同様の「アンインストール防止」機能を持つ。Rewire にも同等の保護機能が必要だが、「完全防止」ではなく「**心理的フリクションと時間的遅延**」で冷静さを取り戻す時間を作ることが目的。

### 命名

- 機能名: **コミットメントロック** / Commitment Lock
- Opal の "Hardcore Session" や直接的な "Uninstall Protection" は避け、「自分との約束をロックする」というポジティブなニュアンスを採用
- App Store 審査でダークパターンと判定されるリスクを最小化

---

## 2. iOS 技術的背景（2026-04-23 時点の調査結果）

### 2-1. iOS でアプリアンインストールを防ぐ公式な方法

| 方式 | 効果 | entitlement | supervised? | 採否 |
|------|------|-------------|-------------|------|
| **Family Controls + `ManagedSettings.application.denyAppRemoval = true`** | API 制御で長押しメニューから「アプリを削除」を消す | ✅ 要（申請中） | unsupervised OK | **Phase B で採用** |
| 手動 Screen Time (`設定 > スクリーンタイム > コンテンツとプライバシー制限 > Appの削除 > 許可しない`) | ユーザー操作で同じ効果。Safari 拡張も副次的にロック | 不要 | 不要 | **Phase A で採用** |
| Configuration Profile (.mobileconfig) の `allowAppRemoval` | iOS 13+ で supervised-only に制限、消費者向けには使えない | - | supervised-only | ❌ 不採用 |
| MDM (DEP enrollment) | 最強だが Apple Business Manager 必須 | - | 企業向けのみ | ❌ 不採用 |

### 2-2. 競合アプリの実装方式

- **Opal (iOS 26.4+)**: アプリ内 PIN + iOS Screen Time パスコードの二重ロック。Family Controls 使用
- **Jomo**: Emergency Mode で random code or accountability buddy の 4桁パスコード
- **BlockerX**: アカウンタビリティパートナー通知 + VPN プロファイル（推定）

### 2-3. Rewire プロジェクトの経緯

- 2026-04-19: Screen Time API（Family Controls + ManagedSettings + DeviceActivity）を実装
- 2026-04-21: entitlement 審査難で**撤去**、Safari Web Extension に切替
- 2026-04-23: Family Controls entitlement を**再申請中**
- 現行コード状態: `modules/expo-screen-time/`, `plugins/withScreenTime.js`, `hooks/screenTime/`, `lib/screenTime/`, `app/screen-time-setup.tsx` 全て削除済み
- `constants/screenTime/blockedDomains.ts`（ドメインリスト）のみ残存

---

## 3. 2段階実装戦略

### Phase A — entitlement 承認前（MVP、即座にリリース可能）

**方式**: 手動 Screen Time 誘導 + アカウンタビリティパスコード戦略

1. ユーザーを iOS 設定アプリへディープリンクで誘導（`App-Prefs:SCREEN_TIME_PASSCODE`、fallback は `Linking.openSettings()`）
2. 「Appの削除 → 許可しない」をユーザー自身に設定してもらう
3. Screen Time パスコードを 3戦略から選択して設定
4. **アプリ側は「セットアップ完了しました」の自己申告のみ受け取る**（iOS 仕様上、検知不可）
5. 解除試行時: 60秒カウントダウン + リフレクション + accountability partner 通知

### Phase B — entitlement 承認後（堅牢化）

**方式**: Family Controls API で `denyAppRemoval` をプログラム制御

1. Phase A の UX はそのまま維持（ユーザーの既存 Screen Time パスコードは無効化しない）
2. 追加で `ManagedSettingsStore.application.denyAppRemoval = true` を呼ぶネイティブモジュール実装
3. Family Activity Picker でアプリ選択（Rewire 自身 + ユーザー指定のアダルトアプリ）
4. 保護状態をアプリ側で**確実に検知**できるようになる

### 抽象化レイヤー設計（Phase A 時点から準備）

```ts
// lib/commitmentLock/nativeProtectionBridge.ts
interface NativeProtectionBridge {
  // Phase A: no-op (return true immediately)
  // Phase B: call ManagedSettings.application.denyAppRemoval
  requestNativeLock(): Promise<{ success: boolean }>;
  releaseNativeLock(): Promise<{ success: boolean }>;
  isNativeLockActive(): Promise<boolean>;
}

// Phase A 実装: 全て Promise.resolve で no-op
// Phase B 実装: modules/expo-screen-time/ を新規追加してネイティブ呼び出し
```

これにより Phase A → Phase B の移行はネイティブモジュール追加と bridge 実装差し替えのみで済む。

---

## 4. Phase A 実装詳細（entitlement 不要）

### 4-1. フェーズ分割（PR ごと）

| Phase | 内容 | 新規ファイル数 |
|-------|------|----------------|
| A-1 | 型定義・Store・Storage | 5 |
| A-2 | セットアップフロー画面 | 6 |
| A-3 | パスコード戦略モジュール | 4 |
| A-4 | 設定画面統合 | (変更のみ) |
| A-5 | 解除試行フロー | 4 |
| A-6 | オンボーディング統合 | (変更のみ) |

### 4-2. 新規・変更ファイル一覧

#### Phase A-1: 基盤（純粋ロジックのみ、UI なし）

**新規**
- `types/commitmentLock.ts` — 型定義（~30行）
- `lib/storage/commitmentLockStorage.ts` — AsyncStorage ラッパ（~40行）
- `stores/commitmentLockStore.ts` — Zustand store（~120行）
- `lib/commitmentLock/generateRandomPasscode.ts` — 6桁乱数生成（~20行）
- `lib/commitmentLock/openScreenTimeSettings.ts` — iOS 設定誘導（~30行）
- `lib/commitmentLock/nativeProtectionBridge.ts` — Phase B 用の抽象化インターフェース（no-op 実装）（~50行）
- `constants/commitmentLock.ts` — ステップ定義、文言キー（~80行）
- 各 `__tests__/*.test.ts`

#### Phase A-2: セットアップフロー画面

**新規**
- `app/commitment-lock/setup.tsx` — ルートコンテナ（~80行）
- `app/commitment-lock/_layout.tsx` — Stack navigator（~20行）
- `components/commitment-lock/SetupIntro.tsx` — 目的説明、正直な仕組み説明（~70行）
- `components/commitment-lock/StrategyPicker.tsx` — 3モード選択（~120行）
- `components/commitment-lock/SettingsDeepLinkStep.tsx` — iOS 設定誘導 + スクショ（~110行）
- `components/commitment-lock/SetupConfirmation.tsx` — 完了確認（~80行）
- `hooks/commitmentLock/useCommitmentLockSetup.ts` — ステップ進行ロジック（~100行）

#### Phase A-3: パスコード戦略

**新規**
- `components/commitment-lock/strategies/RandomPasscodeView.tsx` — 生成→1回表示→忘れさせる（~120行）
- `components/commitment-lock/strategies/AccountabilityEmailView.tsx` — `expo-mail-composer` 利用（~110行）
- `components/commitment-lock/strategies/SelfPickView.tsx` — 自分で設定（警告付き、~70行）
- `lib/commitmentLock/sendAccountabilityEmail.ts` — メール生成（送信は iOS 標準に委譲、~60行）

#### Phase A-4: 設定画面統合

**変更**
- `app/settings.tsx` — SettingSection 追加（~10行増）
- `lib/routing/routes.ts` — `commitmentLockSetup`, `commitmentLockUnlock` 追加
- `app/_layout.tsx` — Stack.Screen 登録
- `locales/ja.ts`, `locales/en.ts` — `commitmentLock.*` キー追加

#### Phase A-5: 解除試行フロー

**新規**
- `app/commitment-lock/unlock.tsx` — 解除画面ルート（~80行）
- `components/commitment-lock/UnlockCountdown.tsx` — 60秒カウントダウン（~90行）
- `components/commitment-lock/UnlockReflection.tsx` — リフレクション3問（~100行）
- `hooks/commitmentLock/useUnlockFlow.ts` — フロー制御（~80行）

#### Phase A-6: オンボーディング統合

**変更**
- `app/onboarding/index.tsx` or 対応画面 — 最終 CTA の後にオプショナル導線
- スキップ可、新規ユーザーの離脱リスクを最小化

### 4-3. 主要な型定義

```ts
// types/commitmentLock.ts
export type PasscodeStrategy =
  | 'accountability_email'  // 信頼する人にメールで送信
  | 'random_forget'         // ランダム生成、忘れる前提
  | 'self_pick';            // 自分で決めて iOS に入力

export interface CommitmentLockState {
  enabled: boolean;
  strategy: PasscodeStrategy | null;
  enabledAt: string | null;             // ISO 8601
  accountabilityEmail: string | null;   // email 戦略時のみ
  lastUnlockAttemptAt: string | null;
  disableHistory: Array<{
    at: string;
    reason?: string;
  }>;
  // Phase B 用の予約フィールド
  nativeLockActive: boolean;
  // NOTE: パスコード本体は絶対に保存しない
  //       （プライバシー原則 + 「忘れさせる」戦略のため）
}
```

### 4-4. Zustand Store インターフェース

```ts
// stores/commitmentLockStore.ts
interface CommitmentLockActions {
  enable: (strategy: PasscodeStrategy, email?: string) => Promise<void>;
  disable: (reason?: string) => Promise<void>;
  recordUnlockAttempt: () => Promise<void>;
  load: () => Promise<void>;
  reset: () => Promise<void>;  // userStore.reset() からチェーン呼び出し
}
```

### 4-5. コア UX フロー（セットアップ）

1. **エントリー**: `settings.tsx` → 「コミットメントロック」タップ → `/commitment-lock/setup`
2. **Intro**: 正直な仕組み説明
   - 「iOS の仕様上、完全防止は不可能です」
   - 「しかし二重ロックで衝動を止める時間を作れます」
   - `commitmentLockStore.startedAt` を記録
3. **戦略選択** (`StrategyPicker`):
   - `accountability_email` / `random_forget` / `self_pick` を明示的な pros/cons と共に提示
4. **パスコード決定**（戦略別）:
   - **random**: `generateRandomPasscode()` で6桁生成 → 画面に1回だけ表示 → アプリには**絶対に保存しない** → 「このコードはコピー禁止、iOS に入力後は忘れてください」
   - **email**: 信頼する人のメール選択 → `expo-mail-composer` でパスコード送信（ユーザー自身は見ない）→ 返信で共有
   - **self**: ユーザーが自分で4桁を決めて iOS に直接入力（アプリに一切渡さない）
5. **iOS 設定誘導**: スクリーンショット付きステップ
   - 「設定 → スクリーンタイム → コンテンツとプライバシー制限 → Appの削除 → 許可しない → スクリーンタイム・パスコード設定」
   - 「設定アプリを開く」ボタン（`App-Prefs:SCREEN_TIME_PASSCODE` → `Linking.openSettings()` fallback）
6. **AppState 復帰検知**: ユーザーが設定アプリから戻ってきたら `useCommitmentLockSetup` がチェックポイント表示 → 「私はパスコードを設定しました」トグル（**自己申告**、iOS API では検証不可）
7. **完了**: `commitmentLockStore.setEnabled(true, strategy)` → 完了画面で「解除したくなったら設定画面から。ただし60秒のクールダウンがあります」を提示
8. **ダッシュボード表示**: tabs のどこかに薄く「コミットメントロック ON」バッジ（透明性確保）

### 4-6. コア UX フロー（解除試行）

1. 設定画面「コミットメントロックを解除」タップ → `/commitment-lock/unlock`
2. 60秒カウントダウン + 呼吸ガイド（既存 `/breathing` ではなく専用、離脱防止）
3. リフレクション3問:
   - 「今の気分は？」
   - 「5分後も同じ気持ちですか？」
   - 「代わりに散歩や友人への連絡はできますか？」
4. 「それでも解除する」→ 確認モーダル（accountability partner に通知される旨を明示）
5. 解除成功 → `commitmentLockStore.setEnabled(false)` + `disableHistory` に記録
6. iOS 側の Screen Time 制限は**ユーザー自身が設定アプリで解除する必要がある**ことを画面上で明示

---

## 5. Phase B 実装詳細（Family Controls entitlement 承認後）

### 5-1. 追加フェーズ

| Phase | 内容 | 新規ファイル数 |
|-------|------|----------------|
| B-1 | ネイティブモジュール復活 | 10+ |
| B-2 | Bridge 実装差し替え | 1 |
| B-3 | Family Activity Picker 統合 | 3 |
| B-4 | Shield Action Extension 連携 | (既存 panic ルート利用) |

### 5-2. 新規・変更ファイル一覧

**Phase B で復活 or 新規**
- `modules/expo-screen-time/` — ネイティブモジュール再構築（過去コミット `dc36738` 参照）
  - `expo-module.config.json`
  - `src/index.ts` — JS API
  - `ios/ScreenTimeModule.swift` — `ManagedSettingsStore.application.denyAppRemoval` 制御
- `plugins/withScreenTime.js` — Config Plugin で entitlement / Info.plist / Extension ターゲット生成
- `app.config.ts` — Family Controls entitlement 追加（Bundle ID: `rewire.app.com`, `.ShieldConfiguration`, `.ShieldAction`, `.DeviceActivityMonitor`）
- `components/commitment-lock/FamilyActivityPickerView.tsx` — ブロック対象アプリ選択 UI
- `lib/commitmentLock/familyActivityStore.ts` — `ActivitySelection` 状態管理

**変更**
- `lib/commitmentLock/nativeProtectionBridge.ts` — no-op から実装差し替え
  ```ts
  export const nativeProtectionBridge: NativeProtectionBridge = {
    requestNativeLock: () => ExpoScreenTime.enableAppRemovalBlock(),
    releaseNativeLock: () => ExpoScreenTime.disableAppRemovalBlock(),
    isNativeLockActive: () => ExpoScreenTime.isAppRemovalBlocked(),
  };
  ```
- `stores/commitmentLockStore.ts` — `nativeLockActive` フラグを bridge と同期

### 5-3. ネイティブ実装ポイント

```swift
// ios/ScreenTimeModule.swift
import FamilyControls
import ManagedSettings

let store = ManagedSettingsStore()

func enableAppRemovalBlock() async throws {
  try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
  store.application.denyAppRemoval = true
}

func disableAppRemovalBlock() {
  store.application.denyAppRemoval = false
}
```

### 5-4. Phase B への移行チェックリスト

- [ ] Apple Developer Portal で Family Controls entitlement が承認されている
- [ ] 4つの Bundle ID が Apple Portal に登録済み（main app + 3 extensions）
- [ ] Provisioning Profile が entitlement を含む状態で更新済み
- [ ] `app.config.ts` の `ios.entitlements` に `com.apple.developer.family-controls: true` 追加
- [ ] `modules/expo-screen-time/` を過去コミット `dc36738` から復元 or 新規作成
- [ ] `nativeProtectionBridge.ts` の実装を no-op から実装に差し替え
- [ ] `commitmentLockStore` で `nativeLockActive` を bridge と同期
- [ ] E2E テスト: 実機で `denyAppRemoval` 有効化 → 長押しメニューから「アプリを削除」が消えることを確認
- [ ] リグレッション: 既存 Safari Web Extension、/panic、通知フローが影響を受けないこと

---

## 6. App Store Review Guidelines 観点

### 6-1. 注意すべきポイント

- **Guideline 2.5.1 / 4.0 (非公開 API)**: `App-Prefs:SCREEN_TIME_PASSCODE` は公式には非推奨。`Linking.openSettings()` を優先し、`App-Prefs:` は fallback として段階的に試す設計にする
- **Guideline 5.1.1 (プライバシー)**: パスコードを一切保存しない設計を README・設定画面に明記
- **Guideline 4.5 (ダークパターン)**: 「解除を困難にする」のは OK だが、以下は NG
  - 無限ループで解除不能にする
  - 偽のエラー表示
  - 欺瞞的な挙動
  - → 必ず「解除できる」導線を残す（60秒クールダウンまでは許容範囲）
- **Health/Wellness カテゴリ**: ポルノ関連は過去リジェクト事例あり。文言は「習慣改善」「セルフコントロール」に留め、明示的な医療効能訴求を避ける
- **Family Controls entitlement 依存** (Phase B): 申請時に用途を明確に説明

### 6-2. 透明性の確保（CLAUDE.md の原則）

- 設定画面に「この機能はパスコードを保存しません」と明記
- iOS 側で解除できる方法を明示
- ダッシュボードに「コミットメントロック ON」バッジを薄く表示
- アカウンタビリティメールの送信前にプレビュー

---

## 7. 検証方法

### 7-1. ユニットテスト

- `generateRandomPasscode`:
  - 6桁であること
  - 数字のみであること
  - エントロピー（100万回生成して重複率 < 0.01%）
- `commitmentLockStore`:
  - state 遷移
  - `userStore.reset` からの連鎖 reset
  - `disableHistory` 記録
- `useCommitmentLockSetup`:
  - ステップ進行
  - AppState 復帰時の完了判定
- `useUnlockFlow`:
  - 60秒カウントダウン
  - リフレクション必須バリデーション

### 7-2. E2E 手動フロー（実機 iOS）

1. 新規インストール → オンボーディング完了 → 設定 → コミットメントロック
2. `random_forget` 戦略選択 → 表示された6桁コードを iOS スクリーンタイムに入力
3. アプリを長押しして「Appを削除」が**表示されない**ことを確認
4. Phase B: `denyAppRemoval` で**API経由でも**削除不可になることを確認
5. 設定画面 → 解除 → 60秒カウントダウン → リフレクション3問 → 成功
6. iOS 側の Screen Time 制限は手動解除が必要であることを画面上で確認
7. アカウンタビリティメール: `expo-mail-composer` 経由でメール送信画面が開くこと

### 7-3. リグレッション

- 既存 Safari Web Extension セットアップが影響を受けないこと
  - `plugins/withSafariWebExtension.js`
  - `modules/expo-safari-web-extension/`
  - `app/safari-web-extension-setup.tsx`
- `useAppInitialization` のフローが壊れないこと
- `_layout.tsx` の Stack 順序が壊れないこと
- Reflection Sheet、チェックインフローが影響を受けないこと

---

## 8. リスクと代替案

| リスク | 説明 | 代替案 |
|-------|------|--------|
| **検知不可** | iOS 側でパスコード実設定したかを API で確認不可（Phase A） | 自己申告 + AppState 復帰タイミングの推定で妥協。Phase B で `nativeLockActive` 確認 |
| **URL スキーム非対応** | `App-Prefs:SCREEN_TIME_PASSCODE` が iOS バージョンで無効 | `Linking.openSettings()` fallback + スクショ案内を厚く |
| **メール戦略の誤用** | 信頼できない相手に送るとロックアウト | 選択時に警告モーダル + confirm |
| **random で完全に忘れる** | ユーザーが iOS スクリーンタイムを自力で解除できなくなり、Rewire 以外も困る | Apple ID リセット手順を設定画面にリンク |
| **審査リジェクト** | 「アンインストール防止」の直接表現でダークパターン判定 | 中立的な「コミットメントロック」命名、Opal 先例を示す |
| **Family Controls 非承認（Phase B）** | 再申請も却下される可能性 | Phase A のみで完結する設計を維持、Phase B は optional enhancement として扱う |

---

## 9. 未解決の設計判断（実装着手時に確認）

以下はユーザー（hiro）承認後に実装開始:

- [x] スコープ: **フル実装（Phase 1-6、オンボーディング統合含む）**
- [x] 命名: **コミットメントロック / Commitment Lock**
- [x] Family Controls 将来方針: **再申請中、抽象化レイヤー入れる**
- [ ] パスコード戦略: 3モード全部実装 or 特定のみ？（MVP では `random_forget` + `accountability_email` の2つで十分か、`self_pick` も含めるか）
- [ ] オンボーディング統合のタイミング: 新規ユーザー全員に提示するか、ストリーク N 日後に offer するか
- [ ] ダッシュボードのバッジ表示: 「ロック ON」を常時表示するか、設定画面のみに留めるか
- [ ] Accountability partner への通知手段: メールのみか、今後 Push Notification 統合も視野に入れるか

---

## 10. 関連リソース

### コードベース内

- `memory/screentime-device-activity.md` — 過去 Screen Time 実装の記録
- `docs/screen-time-restoration.md` — 過去実装の撤去と復元手順
- `memory/MEMORY.md` 内 "Content Blocker Integration" セクション
- `constants/screenTime/blockedDomains.ts` — ブロック対象ドメインリスト（流用可能）
- 過去コミット `dc36738` — Screen Time 実装の完全なスナップショット（復元元）

### 外部参照

- [Apple Developer Forum: denyAppRemoval 仕様](https://developer.apple.com/forums/thread/729637)
- [Apple: Family Controls Documentation](https://developer.apple.com/documentation/familycontrols)
- [Apple: ManagedSettings Documentation](https://developer.apple.com/documentation/managedsettings)
- [Apple: Configuring Family Controls](https://developer.apple.com/documentation/xcode/configuring-family-controls)
- [Apple: Requesting the Family Controls entitlement](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement)
- [Opal: App Uninstall Protection FAQ](https://opalapp.com/help/what-is-app-uninstall-protection)

---

## 11. 実装開始時のチェックリスト

```markdown
Phase A 着手前:
- [ ] この計画書を最新の Apple ガイドライン情報で更新する（日付確認）
- [ ] 未解決設計判断（セクション9）を hiro に確認
- [ ] 既存 settings.tsx の変更箇所を再確認
- [ ] locales の i18n キー命名規則を再確認
- [ ] テスト戦略を TDD で先に書く

Phase B 着手条件:
- [ ] Apple から Family Controls entitlement 承認メール受領
- [ ] 4つの Bundle ID 承認済み（main + 3 extensions）
- [ ] Phase A が実機で動作確認済み
- [ ] Phase A のリグレッションテスト全通過
```
