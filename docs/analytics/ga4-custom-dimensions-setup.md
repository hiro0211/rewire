# GA4 カスタムディメンション登録手順（hiro 作業）

> **なぜ必要か**: 現在 Rewire の GA4 プロパティにはカスタムディメンションが **1件も登録されていません**（2026-07-18 に Metadata API で確認済み）。
> アプリは `onboarding_step_viewed { step_index, step_type }` のようにパラメータを正しく送っていますが、**登録していないパラメータは GA4 上で一切見えません**。
> そのためオンボーディング27ステップは日次レポートで「ステップ表示 57回」という1つの数字にしかならず、**どのステップで離脱したかが原理的に取得できない**状態です。
>
> ⚠️ **登録は遡及しません。** 登録した時点より後のデータにしか適用されないので、着手が遅れた分だけ分析可能な期間が後ろにずれます。**最優先で実施してください。**

---

## 事前情報

| 項目 | 値 |
|---|---|
| GA4 プロパティID | `526015389` |
| 必要な権限 | 編集者（Editor）以上 |
| 所要時間 | 約20〜30分（24項目） |
| 反映まで | 登録から **24〜48時間** |
| 上限 | イベントスコープ **50個** / ユーザースコープ **25個**（今回は24個 + 4個なので余裕あり） |

---

## 操作手順

1. [Google Analytics](https://analytics.google.com/) にログイン
2. 左下の **⚙️ 管理（Admin）** をクリック
3. **プロパティ** 列で Rewire のプロパティ（ID `526015389`）が選択されていることを確認
4. **データの表示（Data display）** → **カスタム定義（Custom definitions）** をクリック
5. **「カスタム ディメンションを作成」** ボタンをクリック
6. 下の表に従って入力し、**保存**
7. 表の全行について 5〜6 を繰り返す

各項目の入力欄は3つです:

| 入力欄 | 何を入れるか |
|---|---|
| ディメンション名（Dimension name） | 下表の「ディメンション名」列。レポート上の表示名なので日本語でOK |
| 範囲（Scope） | 下表の「範囲」列。**イベント** か **ユーザー** |
| イベント パラメータ（Event parameter） | 下表の「パラメータ名」列。**アプリのコードと1文字でも違うと動きません。コピペ推奨** |

---

## 登録する項目

### 🔴 最優先（この5つだけでも先に登録する価値があります）

離脱ポイントの特定と課金導線の評価に直結します。

| # | ディメンション名 | 範囲 | パラメータ名 | 何が分かるか |
|---|---|---|---|---|
| 1 | オンボステップ番号 | イベント | `step_index` | **27ステップのどこで落ちたか**（最重要） |
| 2 | オンボステップ種別 | イベント | `step_type` | どの種類の画面で落ちやすいか |
| 3 | ペイウォール流入元 | イベント | `source` | **課金導線の経路別CVR**（どの導線が効くか） |
| 4 | インストール後日数 | イベント | `days_since_install` | **インストール後何日目の行動か**（離脱日分析） |
| 5 | 発火経路 | イベント | `path` | どの経路で価値体験に到達したか |

> ⚠️ #4 `days_since_install` と #5 `path` は**これから実装するイベント**で使います。先に登録しておいて問題ありません（データが来た時点で自動的に埋まります）。

### 🟡 課金・購入まわり

| # | ディメンション名 | 範囲 | パラメータ名 |
|---|---|---|---|
| 6 | プラン | イベント | `plan` |
| 7 | オファリング | イベント | `offering` |
| 8 | 購入失敗理由 | イベント | `reason` |
| 9 | ユーザーがキャンセル | イベント | `cancelled` |
| 10 | 復元成功 | イベント | `success` |

### 🟢 機能利用・その他

| # | ディメンション名 | 範囲 | パラメータ名 |
|---|---|---|---|
| 11 | 回復トリガー | イベント | `trigger` |
| 12 | 衝動が収まったか | イベント | `urge_resolved` |
| 13 | 目標日数 | イベント | `goal_days` |
| 14 | レッスンID | イベント | `lesson_id` |
| 15 | バッジID | イベント | `badge_id` |
| 16 | バッジ章 | イベント | `chapter` |
| 17 | クイックアクション | イベント | `action` |
| 18 | 通知遷移先 | イベント | `route` |
| 19 | 通知許可 | イベント | `granted` |
| 20 | 通知時刻 | イベント | `hour` |
| 21 | 購入後ステップ | イベント | `step` |
| 22 | 購入後離脱ステップ | イベント | `fromStep` |
| 23 | 直前のストリーク | イベント | `previous_streak` |
| 24 | 評価スター数 | イベント | `stars` |

### 🔵 ユーザースコープ（範囲を「ユーザー」にすること）

**注意**: #25・#26 はアプリが既にユーザープロパティとして送信していますが、未登録のため現在まったく見えていません。#27・#28 はこれから実装します。

| # | ディメンション名 | 範囲 | パラメータ名 | 何が分かるか |
|---|---|---|---|---|
| 25 | 現在のストリーク | **ユーザー** | `current_streak` | 継続日数別のリテンション比較 |
| 26 | 再発回数 | **ユーザー** | `relapse_count` | 再発の多寡と定着の関係 |
| 27 | 発火済みか | **ユーザー** | `is_activated` | **本当のリテンション**（発火済みを分母にした継続率） |
| 28 | 発火した日 | **ユーザー** | `activation_day` | 発火までの日数と定着の関係 |

---

## 完了後の確認方法

登録から24〜48時間後、以下のコマンドで登録が API から見えるか確認できます（hiro が実行しても、Claude に依頼してもOK）:

```bash
cd ~/rewire && /usr/bin/python3 - <<'PY'
import os
from dotenv import dotenv_values
cfg = dotenv_values(os.path.expanduser("~/.config/rewire/.env.analytics"))
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.expanduser(cfg["GOOGLE_APPLICATION_CREDENTIALS"])
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import GetMetadataRequest
md = BetaAnalyticsDataClient().get_metadata(
    GetMetadataRequest(name=f"properties/{cfg['GA4_PROPERTY_ID']}/metadata"))
cd = [d for d in md.dimensions if "custom" in d.api_name]
print(f"登録済みカスタムディメンション: {len(cd)}件")
for d in cd:
    print(" ", d.api_name, "|", d.ui_name)
PY
```

期待される出力: 28件（`customEvent:step_index` などが並ぶ）。

---

## よくあるハマりどころ

- **パラメータ名の打ち間違い**: `step_index` を `stepIndex` や `step-index` と入れると永久に0件になります。上の表からコピペしてください。
- **範囲の選び間違い**: #25〜#28 は必ず「ユーザー」です。イベントにすると意図した集計になりません。
- **すぐ反映されない**: 24〜48時間かかります。翌日見えなくても失敗ではありません。
- **削除してもスロットがすぐ空かない**: 削除後48時間はアーカイブ状態で枠を消費します（今回は上限に余裕があるので問題になりません）。

---

## 出典

- [[GA4] Create event-scoped custom dimensions - Analytics Help](https://support.google.com/analytics/answer/14239696?hl=en)
- [[GA4] About custom dimensions and metrics - Analytics Help](https://support.google.com/analytics/answer/14240153?hl=en)
