# Firebase / GA4 セットアップ手順（Phase C）

> このガイドは Rewire 日次レポートに **Firebase Analytics (GA4) のデータ**を統合するための、hiro 専用ステップバイステップ手順書です。
> 所要時間: **約 25 分**（GCP Console 初回操作なら +10 分）。
> このガイドの内容は 2026-06-01 時点の最新 UI に基づいています。

---

## ゴールと前提

### 何をするか
GA4 Data API 経由で以下を取得し、毎朝のメールに含めます:
- DAU / WAU / 新規ユーザー / セッション / 平均セッション時間
- Rewire 固有イベント（`paywall_viewed`, `pro_purchase_completed`, `breathing_completed`, `panic_button_tapped` など）の発火数
- 滞在画面 Top 10

### 必要なもの
- Rewire の Firebase / GCP プロジェクトへの **オーナー（または編集者）権限**でログインできる Google アカウント
- ターミナルアクセス（最後のファイル配置で使用）

### 取得する 2 つの値
最終的に `~/.config/rewire/.env.analytics` に追記する **2 行**:
```
GA4_PROPERTY_ID=<10桁数字>
GOOGLE_APPLICATION_CREDENTIALS=~/.config/firebase/ga4-sa.json
```

---

## Step 1: GA4 Property ID を取得（所要 3 分）

### 1-1. Firebase Console を開く
ブラウザで [https://console.firebase.google.com/](https://console.firebase.google.com/) を開く。

### 1-2. Rewire プロジェクトを選択
プロジェクト一覧から **Rewire** をクリック。

### 1-3. Project settings に移動
- 左サイドバー上部の **⚙️ プロジェクト設定**（歯車アイコン）をクリック
- 表示されたメニューから **Project settings** を選択

### 1-4. Integrations タブをクリック
画面上部のタブから **Integrations**（統合）をクリック。

### 1-5. Google Analytics カードで "Connected" を確認
- `Google Analytics` カードに「**Connected**」と表示されていることを確認
- 「**Manage**」または「**View**」リンクをクリック → GA4 プロパティのページが新しいタブで開く

### 1-6. Property ID を控える
- 開いた GA4 設定画面の左下 **⚙️ Admin** → **Property** 列 → **Property details**（プロパティ詳細）
- もしくはページ上部・右側に表示されている `Property ID` を見つける
- **10 桁の数字**（例: `123456789`）をメモ

✅ **Step 1 完了**: `GA4_PROPERTY_ID` の値が手元にある状態

> 💡 **見つからない場合**: GA4 画面右上のプロパティ選択ドロップダウンの下に小さく `(ID: 123456789)` の形で表示されていることが多いです。

---

## Step 2: Google Cloud Console で API を有効化（所要 3 分）

### 2-1. GCP Console を開く
[https://console.cloud.google.com/](https://console.cloud.google.com/) を開く。

### 2-2. Rewire と同じプロジェクトを選択
- 画面上部のプロジェクト選択ドロップダウン（左上、Google Cloud ロゴの右隣）をクリック
- Firebase で使っているのと**同じプロジェクト**（プロジェクト名は Firebase Console と同じはず）を選択

> ⚠️ **重要**: Firebase プロジェクトと GCP プロジェクトは同一のものです。別のプロジェクトを選ぶと、後で「Property が見つからない」エラーが出ます。

### 2-3. Analytics Data API のページに直接移動
最速ルート: [https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com](https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com) を開く（プロジェクトが選択された状態で）。

手動ルートの場合:
- 左サイドバー → **APIs & Services** → **Library**
- 検索バーに `Google Analytics Data API` と入力
- 検索結果から **Google Analytics Data API** をクリック

### 2-4. Enable をクリック
- ページ中央の青い **`ENABLE`** ボタンをクリック
- 数秒待つと「API enabled」のような確認メッセージが表示される

✅ **Step 2 完了**: GA4 Data API が有効化された状態

---

## Step 3: Service Account を作成（所要 5 分）

### 3-1. IAM & Admin に移動
- 左サイドバー → **IAM & Admin** → **Service Accounts**
- もしくは直リンク: [https://console.cloud.google.com/iam-admin/serviceaccounts](https://console.cloud.google.com/iam-admin/serviceaccounts)

### 3-2. CREATE SERVICE ACCOUNT
ページ上部の **`+ CREATE SERVICE ACCOUNT`** ボタンをクリック。

### 3-3. Service account details
- **Service account name**: `rewire-analytics-reader`
- **Service account ID**: 自動で `rewire-analytics-reader` が入る（変更不要）
- **Service account description** (任意): `Daily analytics report reader for Rewire`
- **`CREATE AND CONTINUE`** をクリック

### 3-4. Grant this service account access to project（**スキップ**）
- ⚠️ **ここは何も選択せず、`CONTINUE` をクリック**
- 理由: GCP プロジェクトレベルの Role を付けず、GA4 Property レベルでのみ Viewer を付与する**最小権限**方針

### 3-5. Grant users access to this service account（スキップ）
- ここも何も入力せず **`DONE`** をクリック

✅ **Step 3 完了**: Service Account が作成されサービスアカウント一覧に表示される

---

## Step 4: JSON Key をダウンロード（所要 2 分）

### 4-1. 作成した Service Account の詳細を開く
Service Accounts 一覧から **`rewire-analytics-reader@<project-id>.iam.gserviceaccount.com`** をクリック。

### 4-2. Keys タブに移動
タブ群（DETAILS / PERMISSIONS / **KEYS** / METRICS / LOGS）から **KEYS** をクリック。

### 4-3. ADD KEY → Create new key
- **`ADD KEY`** ボタン → ドロップダウンから **`Create new key`** を選択

### 4-4. JSON を選択
- ダイアログで **Key type: JSON** が選択されていることを確認
- **`CREATE`** をクリック
- 自動的に JSON ファイルが `~/Downloads/` にダウンロードされる
- ファイル名は `<project-id>-xxxxxxxxxxxx.json` のような形式

> ⚠️ **このキーは一度しかダウンロードできません**。なくしても再発行は可能ですが、念のため保管場所を決めてからダウンロードを。

✅ **Step 4 完了**: `~/Downloads/<project-id>-xxxxxxxxxxxx.json` が手元にある状態

---

## Step 5: JSON ファイルを安全な場所に配置（所要 2 分）

ターミナルで以下を実行（Downloads 内のファイル名は自分のものに合わせる）:

```bash
# ディレクトリ作成
mkdir -p ~/.config/firebase

# JSON を移動（Downloads のファイル名を実際のものに置き換え）
mv ~/Downloads/<project-id>-xxxxxxxxxxxx.json ~/.config/firebase/ga4-sa.json

# 権限を 600（自分のみ読書）に
chmod 600 ~/.config/firebase/ga4-sa.json

# client_email を確認（後で必要）
cat ~/.config/firebase/ga4-sa.json | grep client_email
```

最後のコマンドで以下のように表示される:
```
"client_email": "rewire-analytics-reader@<project-id>.iam.gserviceaccount.com",
```

この `rewire-analytics-reader@...iam.gserviceaccount.com` 部分を**コピー**。

✅ **Step 5 完了**: JSON が `~/.config/firebase/ga4-sa.json` に配置され、client_email がコピーボードにある状態

> ⚠️ **絶対にやってはいけないこと**: この JSON ファイルを git にコミットする / Slack や他人に送る / プロジェクト内に置く。漏れると GA4 データが全部読めてしまいます。

---

## Step 6: GA4 Property に Service Account を Viewer 追加（所要 5 分）

### 6-1. Google Analytics を開く
[https://analytics.google.com/](https://analytics.google.com/) を開く。

### 6-2. Rewire のプロパティを選択
画面左上のプロパティ選択ドロップダウンで、Step 1 で確認した Property ID と同じ Rewire プロパティを選択。

### 6-3. Admin に移動
画面左下の **⚙️ Admin**（管理）をクリック。

### 6-4. Property access management
- Admin ページに **Account 列** と **Property 列** が並んで表示される
- **Property 列の中** から **Property access management**（プロパティのアクセス管理）をクリック

### 6-5. ユーザーを追加
- 右上の青い **`+`** ボタンをクリック
- ドロップダウンから **Add users**（ユーザーを追加）を選択

### 6-6. メールアドレスと権限を入力
- **Email addresses**: Step 5 でコピーした client_email（`rewire-analytics-reader@<project-id>.iam.gserviceaccount.com`）をペースト
- **Notify new users by email**: チェックを**外す**（service account なのでメール通知不要）
- **Direct roles and data restrictions** セクションで:
  - ☑️ **Viewer** にチェック
  - 他のロール（Administrator / Editor / Marketer / Analyst）には**チェックしない**
- 右上の **`Add`** ボタンをクリック

✅ **Step 6 完了**: Property access management の一覧に rewire-analytics-reader が Viewer として表示される

---

## Step 7: `.env.analytics` に 2 行追加（所要 2 分）

### 7-1. ファイルを開く
```bash
open -e ~/.config/rewire/.env.analytics
```

### 7-2. 末尾に追加
ファイルの末尾に以下を追加（Step 1 で控えた Property ID に置き換え）:

```bash

# --- Firebase / GA4 ---
GA4_PROPERTY_ID=123456789
GOOGLE_APPLICATION_CREDENTIALS=/Users/arimurahiroaki/.config/firebase/ga4-sa.json
```

> 💡 `~/` はシェル展開記号で `.env` ファイルでは展開されないことがあるため、フルパス `/Users/arimurahiroaki/.config/firebase/ga4-sa.json` を推奨します。Claude 側のコードは `~` 展開もサポートするので、`~/.config/firebase/ga4-sa.json` でも動きます。

保存して閉じる。

✅ **Step 7 完了**: env ファイルが GA4 設定を持つ状態

---

## Step 8: 動作確認（所要 3 分）

Claude Code に**「揃った」と一言**伝えてください。私（Claude）が以下を自動実行します:

1. **Config validation**: `cfg.has_firebase` が `True` を返すか確認
2. **API 疎通確認**: 実 GA4 から 1 リクエストして 200 が返るか確認
3. **Dry-run**: `python3 -m scripts.analytics.send_daily --dry-run` でレポート生成のみ
4. **本送信**: 3 ソース統合レポートを `arimurahiroaki40@gmail.com` に送信

---

## 失敗時の切り分け早見表

| 症状 | 原因 | 対処 |
|---|---|---|
| `has_firebase: False` のまま | `.env.analytics` に 2 行追加していない or プレースホルダのまま | Step 7 を再確認、ファイル保存忘れも確認 |
| `has_firebase: False`（env はある） | JSON ファイルが指定パスに無い | `ls -la ~/.config/firebase/ga4-sa.json` で確認 |
| `403 PERMISSION_DENIED` | Service Account を GA4 Property に Viewer 追加していない | Step 6 を再実行（client_email のスペル違いに注意） |
| `403 PERMISSION_DENIED`（Step 6 済） | GA4 と GCP のプロジェクトが別 | Step 2-2 を再確認、Firebase と同じプロジェクトを GCP で選択 |
| `400 INVALID_ARGUMENT property` | Property ID の形式不正 | 純粋な 10 桁数字のみ（`properties/` 等の prefix 不要） |
| `404` がどこかで出る | API が有効化されていない | Step 2-4 の Enable をやり直し |
| `eventCount` が全イベント 0 | 直近で iOS Production / TestFlight ビルドが配布されていない | `analyticsClient` は dev/シミュレータでは no-op。本番ビルドの確認 |
| `cred file not found` | パスの typo or `~` 展開失敗 | `cat ~/.config/firebase/ga4-sa.json | head -1` でファイル実在確認 |

---

## セキュリティ・運用注意

- **`~/.config/firebase/ga4-sa.json` は絶対にコミットしない**。プロジェクト内に置くと事故るので `~/.config/` 配下のみ
- **GCP プロジェクトレベル Role は付けない**: Property レベル Viewer のみ。鍵漏洩時の被害最小化
- **JSON ファイル権限**: `chmod 600`（自分のみ読書可）
- **キー更新**: Service Account Key は 90 日で警告が出る場合あり。半年に 1 回くらい新しいキーを発行→入れ替えるのが安全
- **API quota**: 1 property あたり 200k tokens/日。日次 3 リクエストなら全く問題なし（実測 1-2% 利用）

---

## 参考リンク（公式ドキュメント）

- [Find your GA4 Property ID](https://developers.google.com/analytics/devguides/reporting/data/v1/property-id)
- [Google Analytics Data API quickstart](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart)
- [Create and delete service account keys (GCP IAM)](https://docs.cloud.google.com/iam/docs/keys-create-delete)
- [Connect Firebase to Google Analytics](https://support.google.com/analytics/answer/9289234)
- [GA4 user access management](https://support.google.com/analytics/answer/9305587)
