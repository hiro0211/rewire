iOSアプリでFirebase Analyticsを正しく設定する手順についてまとめました。今回はSwift Package Manager（SPM）を使用して、Firebaseをインストールし、データがFirebaseコンソールに表示されるように設定する方法をご紹介します。

手順1: Firebaseのインストール
まず、XcodeでSPMを使用してFirebaseを追加します。

Xcodeプロジェクトを開く: Xcodeプロジェクトを開きます。

Swift Packagesを追加: メニューバーからFile > Add Packagesを選択します。

Firebase SDKを追加: 次のURLを入力します: https://github.com/firebase/firebase-ios-sdk

Firebaseパッケージを選択: 必要なFirebaseパッケージを選択します。Firebase Analyticsを使用するには、FirebaseAnalyticsパッケージを選択します。

手順2: Firebaseの初期化
AppDelegateに以下のコードを追加して、Firebaseを初期化します。

import FirebaseCore
import FirebaseAnalytics

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        FirebaseApp.configure()
        return true
    }
}

copy
手順3: データ収集の確認
Firebase Analyticsがデータを収集しているか確認します。

デバッグモードの有効化: Xcodeでデバッグモードを有効にして、データ収集状況を確認します。ターミナルで以下のコマンドを実行します。

xcrun simctl spawn booted log stream --predicate 'subsystem == "com.google.firebase.analytics"'

copy
2. イベントのログ出力: イベントを手動でログ出力して、データが収集されているか確認します。

Analytics.logEvent(AnalyticsEventSelectContent, parameters: [
  AnalyticsParameterItemID: "id-\(title!)",
  AnalyticsParameterItemName: title!,
  AnalyticsParameterContentType: "cont"
])

copy
手順4: プライバシー設定の確認
iOS 14以降では、ユーザーのトラッキング許可が必要です。

Info.plistの設定: Info.plistに次のキーを追加します。

<key>NSUserTrackingUsageDescription</key>
<string>このアプリでは、ユーザーのトラッキングを行います。</string>

copy
2. トラッキング許可のリクエスト: アプリ起動時にトラッキング許可をリクエストします。

import AppTrackingTransparency
import AdSupport

func requestTrackingAuthorization() {
    if #available(iOS 14, *) {
        ATTrackingManager.requestTrackingAuthorization { status in
            // トラッキング許可が取得されたかどうかを確認
        }
    }
}

copy
手順5: Firebaseコンソールでの確認
FirebaseコンソールでiOSデータが表示されているか確認します。コンソールにデータが表示されるまでに最大24時間かかることがあります。

ダッシュボードの確認: FirebaseコンソールのAnalyticsダッシュボードでiOSデバイスからのデータが表示されているか確認します。

イベントの確認: 「イベント」セクションで、アプリから送信されたイベントが記録されているか確認します。

手順6: デバイスの確認
アプリがデータを送信しているデバイスがインターネットに接続されていることを確認します。また、iOSシミュレーターではなく実機でテストすることをお勧めします。
問題が解決しない場合
上記の手順をすべて確認したにもかかわらず問題が解決しない場合は、以下を試してみてください。

Firebaseサポートに問い合わせる: Firebaseサポートに問い合わせて、問題の詳細を提供し、サポートを受けることを検討してください。

ドキュメントの再確認: Firebase Analyticsの公式ドキュメントを再度確認し、設定に漏れがないか確認してください。

これらの手順を踏むことで、Swift Package Managerを使用してFirebase AnalyticsをiOSアプリに正しく設定し、データ収集を確認できるはずです。

