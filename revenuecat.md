  残りの手順: RevenueCat → EAS Build → TestFlight

  現在の完了状況

  - RevenueCat: Entitlement「Rewire Pro」作成済み
  - RevenueCat: Monthly / Yearly を Entitlement に紐付け済み（Test Store）
  - RevenueCat: Offering & Packages 作成
  - RevenueCat: Paywall デザイン
  - app.json: RevenueCat plugin 追加
  - eas.json 作成
  - EAS Build（iOS）
  - TestFlight 配信

  ---
  Step 1: RevenueCat で Offering & Packages を作成

  1. RevenueCat ダッシュボード → 左メニュー 「Offerings」
  2. デフォルトの default Offering をクリック（すでに存在するはず）
  3. 「+ Add package」 を2回:
  ┌─────┬──────────────────────────────┬───────────────────────┐
  │  #  │ Identifier（ドロップダウン） │   紐付ける Product    │
  ├─────┼──────────────────────────────┼───────────────────────┤
  │ 1   │ $rc_monthly                  │ monthly（Test Store） │
  ├─────┼──────────────────────────────┼───────────────────────┤
  │ 2   │ $rc_annual                   │ yearly（Test Store）  │
  └─────┴──────────────────────────────┴───────────────────────┘
  4. 各パッケージ作成時に対応するProductを選択 → 「Save」

  すでにPackagesが作成済みなら、このStepはスキップしてください。

  ---
  Step 2: RevenueCat で Paywall をデザイン

  1. 左メニュー 「Paywalls」 → 「+ New Paywall」
  2. Offering: default を選択
  3. テンプレートを選択（好みのデザインを選ぶ）
  4. エディターで日本語にカスタマイズ:
    - タイトル: Rewire Proにアップグレード
    - 特典例: 広告を完全非表示 / 全記事アクセス / 詳細統計
    - ボタン: 購入する
  5. Monthly と Annual の2パッケージが表示されることを確認
  6. 「Publish Paywall」 をクリック

  コード側の <RevenueCatUI.Paywall /> がこのデザインを自動表示します。

  ---
  Step 3: app.json に RevenueCat plugin を追加

  現在の app.json に RevenueCat の Expo plugin が未設定です。これを追加する必要があります。

  これはコード変更なので、確認後に私が編集します。追加内容:

  "plugins": [
    ...既存のplugins,
    "react-native-purchases",
    ["react-native-purchases-ui"]
  ]

  ---
  Step 4: EAS CLI セットアップ & eas.json 作成

  4-1. EAS CLI インストール
  npm install -g eas-cli

  4-2. Expo アカウントにログイン
  eas login
  （Expoアカウントがなければ https://expo.dev で先に作成）

  4-3. プロジェクト設定
  eas build:configure
  → プラットフォーム選択で 「iOS」 を選択
  → eas.json が自動生成される

  ---
  Step 5: EAS Build でiOSビルド

  eas build --platform ios

  初回実行時に以下のプロンプトが表示されます:
  ┌──────────────────────────┬────────────────────────────────────────────┐
  │        プロンプト        │                    回答                    │
  ├──────────────────────────┼────────────────────────────────────────────┤
  │ Apple ID                 │ あなたのApple Developer アカウントのメール │
  ├──────────────────────────┼────────────────────────────────────────────┤
  │ Apple ID Password        │ パスワード（2FAコードも入力）              │
  ├──────────────────────────┼────────────────────────────────────────────┤
  │ Bundle Identifier        │ com.rewire.app（自動検出されるはず）       │
  ├──────────────────────────┼────────────────────────────────────────────┤
  │ Provisioning Profile     │ 「Generate a new one」 を選択              │
  ├──────────────────────────┼────────────────────────────────────────────┤
  │ Distribution Certificate │ 「Generate a new one」 を選択              │
  └──────────────────────────┴────────────────────────────────────────────┘
  → ビルドがクラウド上で開始されます（10〜20分程度）
  → 完了するとダウンロードURLが表示される

  ---
  Step 6: TestFlight に提出

  方法A: EAS Submit（推奨）
  eas submit --platform ios
  → App Store Connect API Key の設定を求められる場合があります

  方法B: ワンコマンド（ビルド＋提出を一括）
  npx testflight
  → ビルドからTestFlight提出まで自動で行います

  提出後:
  1. https://appstoreconnect.apple.com にログイン
  2. Rewire → 「TestFlight」 タブ
  3. ビルドが処理されるまで数分待つ
  4. 処理完了後 → 内部テスター グループに自分を追加
  5. iPhoneの TestFlight アプリ でインストール

  ---
  Step 7: TestFlight でテスト確認

  テスト項目:

  広告（AdMob）テスト:
  - ダッシュボードにバナー広告が表示される
  - 記事画面にインタースティシャル広告が表示される
  - テスト広告IDが正しく動作する

  サブスクリプション（RevenueCat）テスト:
  - オンボーディング後にペイウォール画面が表示される
  - Monthly / Annual プランが表示される
  - 「無料で続ける」ボタンでスキップできる
  - 設定画面 →「Proにアップグレード」からペイウォール表示
  - サンドボックス購入が動作する（Test Store使用時）

  注意: 現在のAPIキー test_pVgLfwZlCInIPSNBIyYWweimmUU は RevenueCat Test Store用です。Apple
  Sandboxでの実課金テストには、RevenueCatの Apple用APIキー（appl_
  で始まるもの）に切り替えが必要です。まずはTest Storeでの動作確認を優先してください。