# Release to TestFlight (local Xcode archive)

ローカル Mac の `xcodebuild` で archive → IPA 書き出し → `altool` で TestFlight にアップロードする手順。EAS Build は使わない。

実体は hiro の `~/.local/bin/release-testflight`（全 Expo プロジェクトで共用、認証は `~/.config/appstore/credentials` を参照）。本プロジェクト固有のラッパー (`scripts/release-testflight.sh`) は 2026-06-09 に削除して global に一本化した。

## ワンライナー

```bash
npm run release:testflight -- --prebuild
```

これだけで `expo prebuild --clean` → `pod install` → `Rewire` scheme を Release archive → IPA → TestFlight にアップロードする。
反映までは App Store Connect 側で 5〜15 分。

`--` 以降は global スクリプトに透過的に渡されるので、後述の各種フラグもそのまま使える。

## 初回セットアップ（1度だけ）

### 1. App Store Connect API Key

App Store Connect → Users and Access → Integrations → App Store Connect API → Team Keys で
**App Manager** ロールのキーを発行し、`.p8` を以下に保存:

```bash
mkdir -p ~/.config/rewire
mv ~/Downloads/AuthKey_XXXXXXXXXX.p8 ~/.config/rewire/
chmod 600 ~/.config/rewire/AuthKey_*.p8
```

認証情報は `~/.config/appstore/credentials` に集約されており、全 Expo プロジェクトで共用される:

| 項目 | 値 |
| --- | --- |
| Key ID | `2X7YAY8C29` |
| Issuer ID | `f9b7f07e-d315-46ba-895a-144635852ffd` |
| .p8 パス | `~/.config/rewire/AuthKey_2X7YAY8C29.p8` |
| Team ID | `KV6CYPA7JK` |
| Bundle ID | `rewire.app.com` |

別のキーに切り替える場合は環境変数で上書き:

```bash
ASC_KEY_ID=ABCD1234EF \
ASC_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
ASC_KEY_PATH=~/.config/rewire/AuthKey_ABCD1234EF.p8 \
npm run release:testflight -- --prebuild
```

### 2. Distribution 証明書

Xcode → Settings → Accounts → Apple ID → Team `KV6CYPA7JK` → Manage Certificates で
**Apple Distribution** が無ければ **+** で発行。スクリプトは `-allowProvisioningUpdates` を付けているので、
未取得の provisioning profile は Xcode が自動で取りに行く。

### 3. ios/ ディレクトリ

`/ios` は `.gitignore` 入り＝prebuild 産物。本番リリースは常に **clean prebuild** を推奨するので、毎回 `--prebuild` を付けて実行すれば良い:

```bash
npm run release:testflight -- --prebuild
```

これで `~/.local/bin/release-testflight` 内部で `expo prebuild --clean` が走り、ios/ を全削除してから再生成される。

## 通常リリースの流れ

1. **build number を上げる**: `app.json` の `expo.ios.buildNumber` を 1 増やす。
   （TestFlight は同じ `(version, buildNumber)` の組み合わせを拒否する）
2. `npm run release:testflight -- --prebuild`
3. App Store Connect → My Apps → Rewire → TestFlight → Builds で 5〜15 分後にビルドが現れる
4. Export Compliance / Test Information を埋めて内部テスターに配布

## オプション

```bash
npm run release:testflight -- --prebuild         # expo prebuild --clean → pod install (non-deployment) → archive → upload
npm run release:testflight                       # ios/ 既存前提で pod install --deployment から開始
npm run release:testflight -- --skip-pods        # pod install をスキップ（高速反復用）
npm run release:testflight -- --skip-upload      # IPA まで作るが altool 上げはスキップ
npm run release:testflight -- --scheme Rewire    # scheme 明示指定
```

global スクリプトを直接呼ぶことも可能（npm 経由のラップが不要なときに便利）:

```bash
release-testflight --prebuild --skip-upload
```

## トラブルシューティング

### `No signing certificate "Apple Distribution" found`

Mac の Keychain に Distribution 証明書が無い。Xcode → Settings → Accounts で発行。

### `Invalid provisioning profile` / `Provisioning profile doesn't match`

Bundle ID の不一致が大半。`rewire.app.com` / `rewire.app.com.RewireWidget`
の 2 つの profile が Apple Developer Portal にあるか確認。`-allowProvisioningUpdates` で
Xcode が自動取得するはずだが、失敗するなら手動で:

```bash
open ios/Rewire.xcworkspace
# Signing & Capabilities タブで Team を選択 → Automatically manage signing を ON
```

### `The bundle version must be higher than the previously uploaded version`

`app.json` の `expo.ios.buildNumber` が前回と同じ。1 上げて再実行。

### `Authentication credentials are missing or invalid`

`.p8` のパス・パーミッション・Key ID / Issuer ID の組み合わせを確認:

```bash
ls -la ~/.config/rewire/AuthKey_*.p8   # -rw------- 1 owner であること
cat ~/.config/appstore/credentials     # ASC_KEY_ID / ASC_ISSUER_ID / APPLE_TEAM_ID が正しいか
```

### `[Xcodeproj] Consistency issue: no parent for object 'RewireWidgetViews.swift': SourcesBuildPhase, SourcesBuildPhase`

既存 ios/ に対して prebuild を重ねがけしたときに `plugins/withWidget.js` が duplicate な SourcesBuildPhase を作るバグ。**`--prebuild` 付きでスクリプトを呼べば** `expo prebuild --clean` が ios/ を全削除してから再生成するので自動回避される。

万一それでも残るなら手動で:

```bash
rm -rf ios build && npm run release:testflight -- --prebuild
```

### `pod install --deployment` で lockfile checksum エラー

```
[!] There were changes to the lockfile in deployment mode
```

prebuild が Podfile を rewrite した直後に `--deployment` で pod install を呼ぶと出る。**`--prebuild` 付きで呼べば**スクリプトが自動的に non-deployment モードに切り替えるので発生しない。`--prebuild` 無しで手動 prebuild した場合のみ起こる。

### `pod install` が他の理由で失敗する

```bash
cd ios && pod repo update && pod install
```

## スコープ外（やらないこと）

- build number の自動 increment（明示承認の上で別タスク）
- TestFlight のリリースノート自動入力
- GitHub Actions 等の CI 連携
- `plugins/withWidget.js` の idempotency バグ修正（clean prebuild で実害が消えるため先送り中、`addBuildPhase` 前に既存フェーズ check を入れるのが本筋）

## 関連ファイル

- `~/.local/bin/release-testflight` — 本体（全 Expo プロジェクト共用）
- `~/.config/appstore/credentials` — ASC 認証情報（全 Expo プロジェクト共用）
- `eas.json` — Submit 用 ASC AppId などは流用元として保持
- `app.json` — `expo.ios.buildNumber` をここで管理

ExportOptions.plist は global スクリプトが `build/ExportOptions.plist` に毎回動的生成する（method=app-store-connect / teamID は `$APPLE_TEAM_ID` から）。
