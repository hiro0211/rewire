# BigQuery Export 有効化手順（hiro 作業）

> **なぜ必要か**: GA4 の通常APIでは「集計済みの数字」しか取れません。
> 「**インストール後何日目に最後にアプリを開いたか**」をユーザー単位で正確に出すには、生イベントログが必要です。
> BigQuery Export はこの生ログを毎日エクスポートします。これが「何日で離脱されているのか」への唯一の正確な答えになります。
>
> ⚠️ **こちらも遡及しません。** 有効化した翌日以降のデータからしか入りません。

---

## 事前情報

| 項目 | 値 |
|---|---|
| Firebase プロジェクト（Rewire本体） | `rewire-4a491` |
| GA4 プロパティID | `526015389` |
| GA4読み取り用 既存SA | `focusity-analytics-reader@focusity-df205.iam.gserviceaccount.com` |
| 必要な権限 | Firebase プロジェクトのオーナー／編集者 |
| 所要時間 | 約10分 + 反映待ち1日 |

> **注意**: 現在のアナリティクス用サービスアカウントは **Focusity プロジェクト（`focusity-df205`）** のもので、Rewire の GA4 プロパティに対して個別に閲覧権限が付与されている構成です。BigQuery のデータは **Rewire 側（`rewire-4a491`）** に出力されるため、後述の STEP 3 で権限を追加します。

---

## 💰 料金について（結論: 無料枠で足ります）

現在の規模（DAU 5前後、イベント数百件/日）では**確実に無料枠内**です。

ただし Firebase のプラン次第で2パターンあります。**どちらか確認してから進めてください**（Firebase コンソール左下に表示されています）。

| プラン | BigQuery の扱い | ⚠️ 重要な制約 |
|---|---|---|
| **Spark（無料）** | BigQuery サンドボックスを無料で利用 | **テーブルが60日で自動削除**されます。60日より前のコホートは分析できません |
| **Blaze（従量課金）** | BigQuery 無料枠（ストレージ10GB/月 + クエリ1TB/月）が適用 | テーブルは消えません。現在の規模なら**課金は発生しません** |

**推奨**: 長期のリテンション分析（D30、月次コホート比較）をやりたいなら **Blaze への切り替えを推奨**します。Blaze でも無料枠の範囲内なら請求は0円ですが、上限を超えると課金されるため、心配なら **予算アラート**（STEP 4）を設定してください。

Spark のままでも D1〜D28 の分析は問題なく可能です。

---

## STEP 1: Firebase と BigQuery をリンクする

1. [Firebase コンソール](https://console.firebase.google.com/) にログイン
2. プロジェクト **`rewire-4a491`**（Rewire）を選択
3. 左メニュー上部の **⚙️（歯車）** → **プロジェクトの設定**
4. 上部タブの **統合（Integrations）** をクリック
5. **BigQuery** のカードで **「リンク」** をクリック
6. 説明画面が出るので **「次へ」**
7. エクスポート対象を選ぶ画面で **「Google アナリティクス」を ON** にする
   - Crashlytics / Performance などは今回不要（ONにしても害はありませんが、データ量が増えます）
8. **データのロケーション** を選択
   - 迷ったら **`asia-northeast1`（東京）** を選んでください
   - ⚠️ **後から変更できません**
9. **エクスポートの種類**:
   - ☑️ **毎日（Daily）** ← 必ずON
   - ☐ **ストリーミング（Streaming）** ← **OFFのまま**。これは有料で、日次レポートには不要です
10. **「BigQuery にリンク」** をクリック

---

## STEP 2: 反映を待つ（翌日）

リンクした当日はデータが入りません。**翌日の同期を待ってください。**

翌日、[BigQuery コンソール](https://console.cloud.google.com/bigquery) を開き、左のエクスプローラで `rewire-4a491` を展開すると `analytics_526015389` というデータセットができています。中に `events_YYYYMMDD` というテーブルが日ごとに作られます。

---

## STEP 3: レポート用サービスアカウントに読み取り権限を付与

日次レポートのスクリプトが BigQuery を読めるようにします。**新しい鍵の発行は不要**で、既存の SA に権限を足すだけです。

1. [IAM コンソール](https://console.cloud.google.com/iam-admin/iam) を開く
2. 画面上部のプロジェクト選択で **`rewire-4a491`** を選ぶ（Focusity ではないので注意）
3. **「アクセスを許可」** をクリック
4. **プリンシパル** に以下を貼り付け:
   ```
   focusity-analytics-reader@focusity-df205.iam.gserviceaccount.com
   ```
5. **ロール** に次の2つを追加:
   - `BigQuery データ閲覧者`（BigQuery Data Viewer）
   - `BigQuery ジョブユーザー`（BigQuery Job User）
6. **保存**

> なぜ2つ必要か: 「データ閲覧者」だけではクエリを**実行**できません。クエリの実行には「ジョブユーザー」が別途必要です。

---

## STEP 4（任意・Blaze の場合のみ）: 予算アラート

万一の課金を防ぎたい場合:

1. [予算とアラート](https://console.cloud.google.com/billing/budgets) を開く
2. **「予算を作成」** → プロジェクトに `rewire-4a491` を指定
3. 金額を **¥1,000** など低めに設定し、50% / 90% / 100% でメール通知を有効化

現在の規模なら実際には0円のままのはずですが、想定外の増加に気づけます。

---

## 完了後の確認方法

STEP 1〜3 が終わり、翌日以降に以下で疎通確認できます（Claude に依頼してOK）:

```bash
cd ~/rewire && /usr/bin/python3 - <<'PY'
import os
from dotenv import dotenv_values
cfg = dotenv_values(os.path.expanduser("~/.config/rewire/.env.analytics"))
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.expanduser(cfg["GOOGLE_APPLICATION_CREDENTIALS"])
from google.cloud import bigquery
client = bigquery.Client(project="rewire-4a491")
rows = client.query(
    "SELECT table_id, row_count "
    "FROM `rewire-4a491.analytics_526015389.__TABLES__` "
    "ORDER BY table_id DESC LIMIT 5"
).result()
for r in rows:
    print(f"  {r.table_id}: {r.row_count} events")
PY
```

`events_20260720: 1234 events` のように出れば成功です。

> `google-cloud-bigquery` が未インストールの場合は `pip3 install google-cloud-bigquery` が必要です（Claude 側で対応します）。

---

## トラブルシューティング

| 症状 | 原因と対処 |
|---|---|
| 「リンク」ボタンが押せない | Firebase プロジェクトのオーナー／編集者権限が必要です |
| 翌日になってもデータセットが無い | GA4 プロパティと Firebase プロジェクトのリンクが切れている可能性。Firebase設定 → 統合 → Google アナリティクス を確認 |
| `403 Access Denied` | STEP 3 のロール付与漏れ。特に「ジョブユーザー」の付け忘れが多いです |
| 60日より前のテーブルが消えている | Spark プランのサンドボックス制約です。Blaze への切り替えを検討してください |

---

## 出典

- [Export Firebase data into BigQuery | Firebase Documentation](https://firebase.google.com/docs/projects/bigquery-export)
- [Link BigQuery to Firebase - Firebase Help](https://support.google.com/firebase/answer/6318765?hl=en)
- [[GA4] Set up BigQuery Export - Analytics Help](https://support.google.com/analytics/answer/9823238?hl=en)
