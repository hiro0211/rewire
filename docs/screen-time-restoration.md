# Screen Time API 復元手順書

Family Controls entitlement が Apple から承認されたタイミングで Screen Time API 統合を復元するための手順書。

## 1. 背景

### なぜ撤去したか

- `com.apple.developer.family-controls` entitlement は **Apple の審査承認が必須**。未承認の状態で Xcode からアップロードを試みると **App Store 審査に到達せずに弾かれる** (Apple DTS Engineer 公式回答)。
- 各 Extension (ShieldConfiguration / ShieldAction / DeviceActivityMonitor) も **個別に承認が必要**で、1つでも未承認だと全体がブロックされる。
- Rewire のコア体験 (Safari でのアダルトサイト遮断 → カスタムページ → 通知 → `/panic`) は **Safari Web Extension だけで完結**しており Family Controls 不要のため、Screen Time 関連を切り離して先に App Store 提出できる状態にした。
- 犠牲にしたもの: Chrome / Firefox / Brave 等の非 Safari ブラウザでのアダルトサイト遮断 (iOS 純正ブロックページ経由)。

### 撤去の参照コミット

- **撤去直前の HEAD**: `dc36738` (feat: transition from content blocker to Safari web extension setup)
- このコミットには Screen Time 実装一式 (プラグイン、ブリッジ、UI、Setup 画面、テスト) が揃っている
- 復元時のファイル取得は `git show dc36738:<path>` で可能

### 撤去日

2026年4月21日

---

## 2. 復元前提条件（Apple Developer Portal）

復元作業を始める前に以下を **すべて確認** すること。1つでも未承認だと Xcode のアップロードが失敗する。

- [ ] メインアプリ `rewire.app.com` の **Family Controls (Distribution)** が承認済み
- [ ] `rewire.app.com.ShieldConfiguration` の Family Controls (Distribution) が承認済み
- [ ] `rewire.app.com.ShieldAction` の Family Controls (Distribution) が承認済み
- [ ] `rewire.app.com.DeviceActivityMonitor` の Family Controls (Distribution) が承認済み
- [ ] Distribution Provisioning Profile を **再発行** し、ローカルの Xcode に再ダウンロード済み

承認状況は Apple Developer Portal → Identifiers → 各 Bundle ID → Additional Capabilities → Family Controls (Distribution) のステータスを確認。

---

## 3. 復元する依存関係

```bash
npm install react-native-device-activity@^0.6.1
```

バージョンは撤去時点のもの。復元時点で新しい major が出ていたら [CHANGELOG](https://github.com/kingstinct/react-native-device-activity/releases) を確認して breaking changes に対応すること。

---

## 4. 復元するファイル（`git show dc36738:<path>` で取得）

各ファイルは以下のコマンドで撤去前の状態を取得できる:

```bash
# プラグイン本体
git show dc36738:plugins/withScreenTime.js > plugins/withScreenTime.js
git show dc36738:plugins/__tests__/withScreenTime.test.js > plugins/__tests__/withScreenTime.test.js

# @bacons/apple-targets configs
mkdir -p targets/ShieldConfiguration targets/ShieldAction targets/ActivityMonitorExtension
git show dc36738:targets/ShieldConfiguration/expo-target.config.js > targets/ShieldConfiguration/expo-target.config.js
git show dc36738:targets/ShieldAction/expo-target.config.js > targets/ShieldAction/expo-target.config.js
git show dc36738:targets/ActivityMonitorExtension/expo-target.config.js > targets/ActivityMonitorExtension/expo-target.config.js

# ネイティブモジュール
mkdir -p modules/expo-screen-time/ios modules/expo-screen-time/src
git show dc36738:modules/expo-screen-time/expo-module.config.json > modules/expo-screen-time/expo-module.config.json
git show dc36738:modules/expo-screen-time/src/index.ts > modules/expo-screen-time/src/index.ts
git show dc36738:modules/expo-screen-time/ios/ScreenTimeModule.swift > modules/expo-screen-time/ios/ScreenTimeModule.swift

# JS ブリッジ
mkdir -p lib/screenTime/__tests__
git show dc36738:lib/screenTime/screenTimeBridge.ts > lib/screenTime/screenTimeBridge.ts
git show dc36738:lib/screenTime/shieldConfig.ts > lib/screenTime/shieldConfig.ts
git show dc36738:lib/screenTime/__tests__/screenTimeBridge.test.ts > lib/screenTime/__tests__/screenTimeBridge.test.ts
git show dc36738:lib/screenTime/__tests__/screenTimeBridge.android.test.ts > lib/screenTime/__tests__/screenTimeBridge.android.test.ts
git show dc36738:lib/screenTime/__tests__/shieldConfig.test.ts > lib/screenTime/__tests__/shieldConfig.test.ts

# Hooks
mkdir -p hooks/screenTime/__tests__
git show dc36738:hooks/screenTime/useScreenTimeSetup.ts > hooks/screenTime/useScreenTimeSetup.ts
git show dc36738:hooks/screenTime/__tests__/useScreenTimeSetup.test.ts > hooks/screenTime/__tests__/useScreenTimeSetup.test.ts
git show dc36738:hooks/settings/useScreenTimeStatus.ts > hooks/settings/useScreenTimeStatus.ts

# Zustand store
mkdir -p stores/__tests__
git show dc36738:stores/screenTimeStore.ts > stores/screenTimeStore.ts
git show dc36738:stores/__tests__/screenTimeStore.test.ts > stores/__tests__/screenTimeStore.test.ts

# UI コンポーネント
mkdir -p components/screen-time
git show dc36738:components/screen-time/ScreenTimeSetupIntro.tsx > components/screen-time/ScreenTimeSetupIntro.tsx
# その他 components/screen-time/ 配下のファイルも同様に `git show dc36738:<path>` で取得

# Setup 画面
mkdir -p app/__tests__
git show dc36738:app/screen-time-setup.tsx > app/screen-time-setup.tsx
```

※ 実際に `git show dc36738 --name-only` で撤去前の全ファイル一覧を確認してから網羅的に取得すること。

---

## 5. 復元する定数

`constants/screenTime/screenTimeConfig.ts` に以下を **復活** する（撤去時に `PANIC_ROUTE` 以外は削除済み）:

```typescript
export const WEB_FILTER_ACTIVITY_ID = 'rewire-web-filter';
export const SHIELD_ID = 'rewire-adult-shield';
export const PANIC_NOTIFICATION_IDENTIFIER = 'rewire-shield-panic';
export const PANIC_ROUTE = '/panic';  // 既存
```

---

## 6. 変更する既存ファイル（撤去時に編集済のものを元に戻す）

### `app.config.ts`

`plugins` 配列に `react-native-device-activity` を追加:

```typescript
plugins: [
  // ...既存プラグイン...
  [
    'react-native-device-activity',
    {
      appleTeamId: 'KV6CYPA7JK',
      appGroup: 'group.rewire.app.com',
    },
  ],
  // ...
],
```

`extra.eas.build.experimental.ios.appExtensions` には `@bacons/apple-targets` が自動で追加するので、明示的な編集は不要（targets/ が機能する）。

### `app/_layout.tsx`

`<Stack.Screen name="screen-time-setup" options={{ headerShown: false }} />` を `<Stack.Screen>` 群の中に追加。

### `lib/routing/routes.ts`

```typescript
export const ROUTES = {
  // ...
  screenTimeSetup: route('/screen-time-setup'),
  // ...
};
```

### `locales/ja.ts` / `locales/en.ts`

`screenTime: { ... }` ブロックを撤去時点から復活。`git show dc36738:locales/ja.ts` で該当箇所を参照。具体的なキー:

- `title`, `intro`, `enableButton`, `skip`, `completionTitle`, `completionDescription`
- `deniedTitle`, `deniedDescription`, `settingsStatus`
- `enabled`, `disabled`, `setupGuide`, `shieldPrimaryButton`, `shieldSecondaryButton`

`preBenefits.features.screenTime` の文言を「Safariカスタム保護」から元の「全ブラウザで遮断」に戻すかは、併存運用として好ましい方を選択。

### `app/settings.tsx`

- `import { useScreenTimeStatus } from '@/hooks/settings/useScreenTimeStatus';` 復活
- `const { screenTimeStatus } = useScreenTimeStatus();` 復活
- Safari Web Extension 行の上に Screen Time 用の SettingItem 行を追加（非iOS ガードの中）
- `isLast` フラグを Safari Web Extension 行のみに付ける

### `hooks/useNotificationDeepLink.ts`

Shield Action からの通知 (`categoryIdentifier = 'rewire-shield-panic'`) をフォールバックで `/panic` に誘導するロジックを復活（Safari Web Extension の `userInfo.route` 経路はそのまま維持、両立可能）:

```typescript
import { PANIC_NOTIFICATION_IDENTIFIER, PANIC_ROUTE } from '@/constants/screenTime/screenTimeConfig';

function handleResponse(response, push) {
  const route = response.notification.request.content.data?.route;
  if (typeof route === 'string') {
    push(route);
    return;
  }
  const categoryId = response.notification.request.content.categoryIdentifier;
  if (categoryId === PANIC_NOTIFICATION_IDENTIFIER) {
    push(PANIC_ROUTE);
  }
}
```

### `hooks/__tests__/useNotificationDeepLink.test.ts`

Shield フォールバックのテストを復活 (`categoryIdentifier === 'rewire-shield-panic'` で `/panic` に遷移)。

### Settings テスト 3 ファイル

`app/__tests__/settings.{test,crash.test,theme.test}.tsx` に以下のモックを追加:

```typescript
jest.mock('@/lib/screenTime/screenTimeBridge', () => ({
  screenTimeBridge: {
    getAuthorizationStatus: jest.fn().mockResolvedValue('notDetermined'),
  },
}));
```

---

## 7. 復元後の検証手順

```bash
# 1. 全テスト通過
npm test

# 2. iOS プロジェクト再生成
rm -rf ios && npx expo prebuild --platform ios --clean
```

以下を `ios/` 以下で確認:

- [ ] `ios/ShieldConfiguration/` ディレクトリが生成されている
- [ ] `ios/ShieldAction/` ディレクトリが生成されている
- [ ] `ios/ActivityMonitorExtension/` ディレクトリが生成されている
- [ ] `ios/Rewire/Rewire.entitlements` に `com.apple.developer.family-controls` が含まれている

```bash
# 3. 署名込みビルド
cd ios && xcodebuild -workspace Rewire.xcworkspace -scheme Rewire \
  -configuration Debug -destination 'generic/platform=iOS' build
# BUILD SUCCEEDED を確認

# 4. EAS production build
cd .. && eas build --profile production --platform ios
```

### 実機検証

- [ ] 実機にインストール後、設定画面で「Web 保護」セクションが表示される
- [ ] Screen Time 権限ダイアログが出てアクセス許可できる
- [ ] Chrome で missav.ai にアクセス → **iOS 純正ブロックページ** が表示される
- [ ] Safari で missav.ai にアクセス → **Rewire カスタムページ** が表示される（Safari Web Extension 側の動作が維持されている）
- [ ] 両経路とも `/panic` に到達できる

---

## 8. 互換性メモ

- **Safari Web Extension の通知**: `content.userInfo.route = '/panic'` を設定する → `useNotificationDeepLink` の route 優先分岐で処理
- **Shield Action の通知**: `categoryIdentifier = 'rewire-shield-panic'` を設定 (Shield 側で `userInfo.route` も設定している場合はそちらが優先される) → `useNotificationDeepLink` のフォールバック分岐で処理
- 両通知が **同時に届いても競合しない**（どちらも `/panic` に同じ遷移）

---

## 9. 復元方針の注意事項

### ❌ `git revert` は推奨しない

撤去から復元までの間に他の変更（UI変更、Safari Web Extension 追加機能、依存アップデート等）が入る可能性が高く、単純 revert は衝突する。

### ✅ 手動で必要な部分だけ別 PR で復活

このドキュメントと `git show dc36738:<path>` の組み合わせで必要ファイルを取得し、現在のコードベースに手作業で統合する。

### App Store 提出前チェックリスト

- [ ] Apple Developer Portal で 4 つの Bundle ID すべて Family Controls (Distribution) 承認済み
- [ ] Provisioning Profile 最新版がダウンロード済み
- [ ] ローカル `xcodebuild` で署名成功
- [ ] EAS Build で `com.apple.developer.family-controls` entitlement エラー無し
- [ ] App Store Connect へアップロード成功（ITMS エラー無し）
- [ ] Release notes に「Chrome/Firefox でのアダルトサイト遮断を再度サポート」と追記

---

## 10. 参考リンク

- [Apple Family Controls entitlement documentation](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.family-controls)
- [Requesting the Family Controls entitlement](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement)
- [Apple Developer Forum: Uploading app with Family Controls to TestFlight](https://developer.apple.com/forums/thread/712870)
- [react-native-device-activity GitHub](https://github.com/kingstinct/react-native-device-activity)
- 撤去時コミット: `dc36738` (撤去前の最終状態)
