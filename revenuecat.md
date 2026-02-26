  残りの手順: RevenueCat → EAS Build → TestFlight

  現在の完了状況

  - RevenueCat: Entitlement「Rewire Pro」作成済み
  - RevenueCat: Monthly / Yearly を Entitlement に紐付け済み（Test Store）
  - RevenueCat: Offering & Packages 作成
  - RevenueCat: Paywall デザイン
  - RevenueCat: discount Offering 作成（7日無料トライアル付き）
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
  Step 1.5: RevenueCat で discount Offering を作成

  1. 「Offerings」 → 「+ New Offering」
  2. Identifier: discount
  3. Packages: 7日間無料トライアル付きの Monthly / Annual を紐付け
  4. App Store Connect で Introductory Offer (Free Trial 7 days) を設定済みの Product を使用

  ---
  Step 2: RevenueCat で Paywall をデザイン

  2つのPaywallが必要:

  A. default Paywall（通常価格）:
  1. 左メニュー 「Paywalls」 → 「+ New Paywall」
  2. Offering: default を選択
  3. テンプレートを選択
  4. エディターで日本語にカスタマイズ:
    - タイトル: Rewire Proにアップグレード
    - 特典例: 全機能アクセス / コンテンツブロッカー / 全記事アクセス / 詳細統計
    - ボタン: 購入する
  5. Monthly と Annual の2パッケージが表示されることを確認
  6. 「Publish Paywall」

  B. discount Paywall（7日間無料トライアル）:
  1. 「Paywalls」 → 「+ New Paywall」
  2. Offering: discount を選択
  3. テンプレートを選択
  4. エディターで日本語にカスタマイズ:
    - ヘッドライン: 7日間無料で全機能を体験
    - トライアル後の価格を明示
    - ボタン: 無料トライアルを開始
  5. 「Publish Paywall」

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

  ハードペイウォールテスト:
  - 新規ユーザー: オンボーディング → ペイウォール（通常価格）表示
  - ペイウォール dismiss → 2回目のペイウォール（7日間無料トライアル）表示
  - 2回目のペイウォール dismiss → 閉じられない（再表示される）
  - 既存無課金ユーザー: アプリ起動 → ハードペイウォール表示
  - 課金ユーザー: 通常通りアプリ利用可能

  サブスクリプション（RevenueCat）テスト:
  - Monthly / Annual プランが表示される
  - サンドボックス購入が動作する
  - 設定画面 →「サブスクリプション管理」が開く

  広告が完全に除去されていることの確認:
  - 全画面にバナー広告が表示されないこと
  - チェックイン完了後にインタースティシャル広告が表示されないこと
  - 記事がすべてロック解除されていること

  その他:
  - コンテンツブロッカーにPro制限なし
  - プライバシーポリシーに広告言及なし
