# Release to TestFlight (local Xcode archive)

ローカル Mac の `xcodebuild` で archive → IPA 書き出し → `altool` で TestFlight にアップロードする手順。EAS Build は使わない。

## ワンライナー

```bash
npm run release:testflight
```

これだけで `Rewire` scheme を Release archive → IPA → TestFlight にアップロードする。
反映までは App Store Connect 側で 5〜15 分。

## 初回セットアップ（1度だけ）

### 1. App Store Connect API Key

App Store Connect → Users and Access → Integrations → App Store Connect API → Team Keys で
**App Manager** ロールのキーを発行し、`.p8` を以下に保存:

```bash
mkdir -p ~/.config/rewire
mv ~/Downloads/AuthKey_XXXXXXXXXX.p8 ~/.config/rewire/
chmod 600 ~/.config/rewire/AuthKey_*.p8
```

現行値（`scripts/release-testflight.sh` にデフォルトとして埋め込み済み）:

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
npm run release:testflight
```

### 2. Distribution 証明書

Xcode → Settings → Accounts → Apple ID → Team `KV6CYPA7JK` → Manage Certificates で
**Apple Distribution** が無ければ **+** で発行。スクリプトは `-allowProvisioningUpdates` を付けているので、
未取得の provisioning profile は Xcode が自動で取りに行く。

### 3. ios/ ディレクトリ

`/ios` は `.gitignore` 入り＝prebuild 産物。初回または `app.config.ts` を変更した直後は:

```bash
npx expo prebuild --platform ios
```

または release スクリプトに `--prebuild` を渡せば同等のことをしてくれる:

```bash
./scripts/release-testflight.sh --prebuild
```

## 通常リリースの流れ

1. **build number を上げる**: `app.json` の `expo.ios.buildNumber` を 1 増やす。
   （TestFlight は同じ `(version, buildNumber)` の組み合わせを拒否する）
2. （`app.config.ts` を変更した場合のみ）`npx expo prebuild --platform ios`
3. `npm run release:testflight`
4. App Store Connect → My Apps → Rewire → TestFlight → Builds で 5〜15 分後にビルドが現れる
5. Export Compliance / Test Information を埋めて内部テスターに配布

## オプション

```bash
./scripts/release-testflight.sh --prebuild       # expo prebuild も走らせる
./scripts/release-testflight.sh --skip-pods      # pod install をスキップ（高速反復用）
./scripts/release-testflight.sh --skip-upload    # IPA まで作るが altool 上げはスキップ
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
```

### `pod install` が失敗する

```bash
cd ios && pod repo update && pod install
```

## スコープ外（やらないこと）

- build number の自動 increment（明示承認の上で別タスク）
- TestFlight のリリースノート自動入力
- GitHub Actions 等の CI 連携

## 関連ファイル

- `scripts/release-testflight.sh` — 本体
- `scripts/ExportOptions.plist` — App Store 配布用 export 設定
- `eas.json` — Submit 用 ASC AppId などは流用元として保持
- `app.json` — `expo.ios.buildNumber` をここで管理
