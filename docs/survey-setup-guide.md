# アンケート機能 — hiro対応事項ガイド

このガイドでは、アンケート機能を動作させるために hiro が手動で行う必要がある手順をまとめています。

---

## 1. Firebase Console で Firestore を有効化する

1. [Firebase Console](https://console.firebase.google.com/project/rewire-4a491/firestore) を開く
2. 左メニューから **「構築」→「Firestore Database」** をクリック
3. **「データベースを作成」** ボタンをクリック
4. **「本番環境モードで開始」** を選択して「次へ」
5. ロケーションを **`asia-northeast1`（東京）** に設定
6. **「有効にする」** をクリック

---

## 2. Firestore セキュリティルールを設定する

1. Firestore の画面で **「ルール」** タブをクリック
2. 以下のルールをコピーして貼り付け、**「公開」** をクリック

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /surveys/{surveyId} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

このルールにより:
- アプリからアンケート回答の **書き込みのみ** が許可されます
- 読み取り・更新・削除はクライアントからはできません（Firebase Console からのみアクセス可能）

---

## 3. Firestore パッケージをインストールする

ターミナルで以下を実行:

```bash
cd ~/rewire
npm install @react-native-firebase/firestore
```

---

## 4. app.config.ts を更新する

`app.config.ts` の `forceStaticLinking` 配列に `'RNFBFirestore'` を追加:

**変更前:**
```typescript
forceStaticLinking: ['RNFBApp', 'RNFBAnalytics'],
```

**変更後:**
```typescript
forceStaticLinking: ['RNFBApp', 'RNFBAnalytics', 'RNFBFirestore'],
```

---

## 5. Dev Client を再ビルドする

ネイティブモジュールが追加されたため、dev client の再ビルドが必要です:

```bash
npx expo prebuild --clean
npx expo run:ios
```

ビルドが完了すると、Firestore が使えるようになります。

---

## 6. アンケートデータを確認・エクスポートする

### Firebase Console で確認

1. [Firestore Console](https://console.firebase.google.com/project/rewire-4a491/firestore/databases/-default-/data) を開く
2. `surveys` コレクションを選択
3. 各ドキュメントをクリックして回答内容を確認

### データをエクスポートする（分析用）

**方法A: Firebase Console から手動エクスポート**
1. Firestore の「データ」タブで `surveys` コレクションを開く
2. 右上の「⋮」メニューから「コレクションをエクスポート」を選択

**方法B: Google スプレッドシートに連携**
1. Firebase Extensions から「Export Collections to BigQuery」をインストール
2. BigQuery からスプレッドシートに接続して分析

**方法C: シンプルにスクリーンショットで共有**
- 回答数が少ないうちは Console で直接確認が最も簡単です

---

## 注意事項

- Android 版は `google-services.json` が未設定のため、Firestore は iOS のみで動作します
- Android 対応が必要な場合は Firebase Console からファイルをダウンロードしてプロジェクトルートに配置してください
