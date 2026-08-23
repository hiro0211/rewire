# Rewire イベント定義書

> `constants/analyticsEvents.ts` が実装上の source of truth。このファイルは
> **BigQuery で SQL を書く人のための対応表**と、**語彙を変えた日の記録**を持つ。
>
> 実装との乖離は `scripts/analytics/tests/test_event_registry_sync.py` が
> 機械的に検出する（イベント名のみ。パラメータ名は人が見るしかないので、
> 変更したらこのファイルも直すこと）。

最終更新: 2026-08-15

---

## 1. BigQuery で読むときの型の罠（最重要）

`event_params` は key/value の配列で、value は4つの型付き列を持つ。**どの列に入るかは
JS の型で決まり、間違った列を読むと「0件」ではなく「静かに空」になる。**

| アプリで渡した型 | BigQuery の格納先 | 例 |
|---|---|---|
| `string` | `value.string_value` | `source`, `plan`, `step_type` |
| **`number`** | **`value.double_value`** | `step_index`, `goal_days`, `urge_level` |
| `boolean` | `value.int_value`（0 / 1） | `granted`, `cancelled`, `urge_resolved` |

⚠️ **`number` は `int_value` には入らない。** React Native の Firebase SDK は JS の
number を全て double として送るため、整数に見える `step_index` も `double_value` にしか
入らない。実測 2026-08-08: `step_index` 944行のうち `double_value` 944 / `int_value` 0。
`int_value` だけを読むとオンボーディングファネルが丸ごと空になる。

安全な取り出し方（`scripts/analytics/bq_sql.py` の `param_number()` がこれを1箇所に持つ）:

```sql
CAST(COALESCE(
  (SELECT value.int_value    FROM UNNEST(event_params) WHERE key = 'step_index'),
  CAST((SELECT value.double_value FROM UNNEST(event_params) WHERE key = 'step_index') AS INT64)
) AS INT64)
```

### その他の実測メモ

- **`event_date` はプロパティのタイムゾーン（Asia/Tokyo）** の日付。一方
  `event_timestamp` は **UTC のマイクロ秒**。時間帯・曜日を出すときは必ず
  `TIMESTAMP_MICROS(event_timestamp)` を `Asia/Tokyo` に変換すること。
- **`user_id` は現在ほぼ全行 NULL。** `setUserId` は 2.4.0 で入ったが本番の大半は
  2.3.0（実測: 2.4.0 は1台のみ）。集計単位は `user_pseudo_id`（端末）。
- **`user_first_touch_timestamp` は全行に入っている**（実測 4,273/4,273 行、
  2026-03-26 まで遡る）。インストール後日数はこれから導出するのが正解で、
  アプリが送る `days_since_install` より信頼できる（下記 §4 参照）。
- GA4 は **72時間まで遅延データで日次テーブルを更新し続ける**。直近3日の数字は暫定。

---

## 2. 命名規約

- **パラメータ名は snake_case のみ。** BigQuery の `event_params` は完全一致でしか
  引けないため、camelCase が1つ混ざるとそのイベントだけ別の書き方を強いられる。
- イベント名は `名詞_動詞の過去形`（`paywall_viewed`, `lesson_completed`）。
- 語彙（enum 的な文字列）を持つパラメータは `constants/analytics/` に定数として置き、
  複数イベントで共有する。バラバラに書くと同じ導線が2つの名前に割れる。

---

## 3. イベント一覧

型は TypeScript の型、`BQ` 列は上記の対応表に従った格納先。

### ライフサイクル

| イベント | パラメータ | 型 | BQ | 備考 |
|---|---|---|---|---|
| `app_open` | `days_since_install` | number | double | §4 参照。BQ 側の導出を優先 |
| `activation_reached` | `path` | `'sos'\|'quick_action'\|'onboarding'\|'other'` | string | 1ユーザー1回のみ |
| | `days_since_install` | number（任意） | double | install date 不明時は省略 |

### オンボーディング

| イベント | パラメータ | 型 | BQ | 備考 |
|---|---|---|---|---|
| `onboarding_step_viewed` | `step_index` | number | **double** | 27ステップの通し番号 |
| | `step_type` | `OnboardingStep['type']` | string | `assessment_choice` 等は複数回出るので index と併用 |
| `onboarding_complete` | `goal_days` | number | double | |
| `onboarding_survey_completed` | `discovery_channel` / `age_range` / `motivation` | string | string | 同じ値をユーザープロパティにも設定 |

### コアループ

| イベント | パラメータ | 型 | BQ |
|---|---|---|---|
| `breathing_started` | — | | |
| `breathing_completed` | `urge_resolved` | boolean | int (0/1) |
| `reflection_opened` | `source` | `'manual'\|'notification'\|'auto_reminder'` | string |
| `reflection_completed` | `streak_day` | number | double |
| | `urge_level` | number | double |
| `relapse_recorded` | `previous_streak` | number | double |
| `panic_button_tapped` | — | | |
| `panic_screen_viewed` | — | | |
| `recovery_trigger_selected` | `trigger` | string | string |

### レッスン・ダッシュボード

| イベント | パラメータ | 型 | BQ |
|---|---|---|---|
| `lesson_started` / `lesson_completed` | `lesson_id` | string | string |
| `quick_action_tapped` | `action` | `'breathe'\|'checkin'\|'calendar'` | string |
| `achievements_opened` | — | | |
| `badge_unlocked` | `badge_id`, `chapter` | string | string |
| `share_tapped` | — | | |

### ペイウォール

`source` は3イベント（`paywall_viewed` / `paywall_dismissed` / `pro_purchase_completed`）と
`benefits_screen_viewed` で同じ語彙を共有する。これがないと「どの導線が購入に繋がったか」を
BigQuery で結合できない。語彙は `constants/analytics/paywallSource.ts`。

| イベント | パラメータ | 型 | BQ |
|---|---|---|---|
| `benefits_screen_viewed` | `source` | `PaywallSource` | string |
| `benefits_cta_tapped` | — | | |
| `paywall_viewed` | `source`, `offering` | string | string |
| | `paywall_variant` | `PaywallVariant` | string |
| `plan_selected` | `plan` | string | string |
| `purchase_initiated` | `plan` | string | string |
| `purchase_failed` | `reason` | string | string |
| | `cancelled` | boolean | int (0/1) |
| `restore_tapped` | — | | |
| `restore_completed` | `success` | boolean | int (0/1) |
| `paywall_dismissed` | `source` | `PaywallSource` | string |
| | `paywall_variant` | `PaywallVariant` | string |
| `pro_purchase_completed` | `source`, `plan`, `offering` | string | string |
| | `paywall_variant` | `PaywallVariant` | string |

**`PaywallSource` の語彙**: `onboarding`（オンボ完走後） / `returning`（既存ユーザーの起動時） /
`unknown`（特定不能）。語彙外の値は `toPaywallSource()` が `unknown` に丸めるので、
タイポが新しい source 値として増えて分母が割れることはない。

### A/B バリアント（`paywall_variant`）

**`PaywallVariant` の語彙**: `default`（既存ペイウォール） / `cosmicJourney`（A案「星の旅」）。
割当は `user.id` の決定論的ハッシュ（`lib/paywall/resolvePaywallVariant.ts`）で、
実験IDは `constants/paywall/paywallExperiment.ts` の `PAYWALL_EXPERIMENT_ID`。

param 名を `variant` ではなく **`paywall_variant`** にしているのは、同名のユーザー
プロパティ（§4）と対称にするため。イベントで見るときもユーザー単位で見るときも
同じ列名で書けるので、BigQuery の SQL に2つ目の綴りが増えない。

> ⚠️ **A/B の分母は必ず `paywall_viewed` の `paywall_variant` param 側で取ること。**
> 同名のユーザープロパティも設定しているが、`setUserProperty` は非同期のネイティブ
> 呼び出しで、しかも GA4 のユーザープロパティは「設定後に送られたイベント」にしか
> 付かない。起動直後にペイウォールが出る導線では表示イベントに間に合う保証がなく、
> ユーザープロパティで割ると分母が欠ける。ユーザープロパティは購入後のリテンションや
> 解約をバリアント別に割るための補助と考える。

> ⚠️ **配信前のデータにこのパラメータは存在しない。** バリアント別の集計は
> 配信日以降に限定すること（§5 の変更履歴を参照）。期間をまたぐと、
> パラメータが無い行が全て「不明」に落ちて比率が壊れる。

### コンテンツブロッカー（ポルノ禁の挫折測定）

ブロックを ON にした人が **どれくらい持ちこたえ、どこで解除に向かうか** を測る。
解除フローには3呼吸のゲートが挟まるので、押した時点（requested）と、その後
解除した（confirmed）／思いとどまった（cancelled）を分けて送る。

| イベント | パラメータ | 型 | BQ | 意味 |
|---|---|---|---|---|
| `blocker_enabled` | `source` | `'settings'\|'post_purchase'` | string | ブロック開始。持続時間の起点 |
| `blocker_disable_requested` | `hours_enabled`（任意） | number | double | **やめたくなった瞬間** |
| `blocker_disable_confirmed` | `hours_enabled`（任意） | number | double | **挫折**（実際に解除した） |
| `blocker_disable_cancelled` | `hours_enabled`（任意） | number | double | **踏みとどまった** |

- `hours_enabled` は直近の有効化からの経過時間（時間単位・切り捨て）。
  **これがそのまま「何時間で挫折したか」になる。**
- 切り捨てなのは、ON 直後の解除（最も強い挫折シグナル）を `0` として残すため。
- **有効化の記録が無いときはパラメータごと省く**（`0` を送ると「即解除」と混ざる）。
- 導出できる指標: 挫折率 = `confirmed ÷ enabled`、
  **ゲート引き止め率 = `cancelled ÷ requested`**（呼吸ゲートの存在価値そのもの）。
- 分析は `scripts/analytics/bq_blocker.py`。
- ⚠️ **2.4.0 からの計測。それ以前のデータは存在しない。**

### 課金後オンボーディング

| イベント | パラメータ | 型 | BQ |
|---|---|---|---|
| `post_purchase_step_viewed` | `step` | `PostPurchaseStep` | string |
| `post_purchase_onboarding_skipped` | `from_step` | number | double |
| `post_purchase_blocker_activated` | — | | |

### レビュー・アンケート

| イベント | パラメータ | 型 | BQ |
|---|---|---|---|
| `review_prompt_shown` | — | | |
| `review_prompt_rated` | `stars` | number | double |
| `review_prompt_feedback_tapped` | — | | |
| `review_prompt_dismissed` | — | | |
| `survey_prompt_accepted` / `survey_prompt_dismissed` | — | | |
| `survey_completed` | `question_count` | number | double |
| | `perceived_change` | string | string |

> 自由記述（`free_text`）は **意図的に Analytics へ送らない**。Firestore にのみ残す。

### 通知

| イベント | パラメータ | 型 | BQ |
|---|---|---|---|
| `notification_permission` | `granted` | boolean | int (0/1) |
| `notification_scheduled` | `hour` | number | double |
| `notification_opened` | `route` | string | string |

---

## 4. ユーザープロパティ

GA4 のユーザープロパティは **最後に設定された値で全イベントに遡って付く**わけではなく、
設定後に送られたイベントに付く。過去のイベントには付かない。

| プロパティ | 値 | 設定箇所 |
|---|---|---|
| `goal_days` | 目標日数 | `hooks/useAppInitialization.ts` |
| `is_pro` | `'true'` / `'false'` | 同上 |
| `theme_preference` | `system\|light\|dark` | `hooks/tracking/useThemeLocaleUserProperties.ts` |
| `locale_preference` | `system\|ja\|en` | 同上 |
| `paywall_variant` | `default\|cosmicJourney` | `hooks/tracking/usePaywallVariantUserProperty.ts` |
| `current_streak` | 現在の連続日数 | `lib/tracking/retentionUserProperties.ts` |
| `relapse_count` | 再発回数 | 同上 |
| `days_since_install` | インストール後日数 | `hooks/tracking/useAppOpenTracking.ts` |
| `is_activated` | `'true'` のみ | `lib/tracking/activation.ts` |
| `activation_day` | 発火までの日数 | 同上 |
| `discovery_channel` / `age_range` / `motivation` | オンボアンケートの回答 | `features/survey/surveyService.ts` |

### ⚠️ `days_since_install` はアプリ値を信用しない

実測 2026-08-08: `app_open` が送った `days_since_install` が **0 なのに実際は52日目**
（3行）、**1 なのに53日目**（3行）だった。ローカルの install date が
バージョン更新時のタイミングで誤ってシードされるため。

BigQuery では代わりにこちらを使うこと（全行に入っており、遡及的に正しい）:

```sql
DATE_DIFF(
  DATE(TIMESTAMP_MICROS(event_timestamp), 'Asia/Tokyo'),
  DATE(TIMESTAMP_MICROS(user_first_touch_timestamp), 'Asia/Tokyo'),
  DAY
) AS days_since_install
```

---

## 5. 変更履歴

過去データは遡って書き換わらないため、集計側で新旧の対応が要る。

| 日付 | 変更 | 集計への影響 |
|---|---|---|
| 2026-08-08 | `questionCount` → **`question_count`**（`survey_completed`） | 旧名の実データは1行のみ。実質無視してよい |
| 2026-08-08 | `fromStep` → **`from_step`**（`post_purchase_onboarding_skipped`） | 旧名の実データは0行 |
| 2026-08-08 | iOS の自動 `screen_view` 収集を無効化（`FirebaseAutomaticScreenReportingEnabled=false`） | この設定を含むビルドの配信後、`screen_view` は自前のルートのみになる。**それ以前のデータは 61% が自動収集ノイズ**なので、期間をまたぐ画面数の比較は不可 |
| 2026-08-15 | `paywall_viewed` / `paywall_dismissed` / `pro_purchase_completed` に **`paywall_variant`** を追加。同名のユーザープロパティ `paywall_variant` を新設 | **配信前のデータにはこのパラメータもプロパティも存在しない。バリアント別の集計は配信日以降に限定すること。** 期間をまたぐと配信前の行が全て「不明」に落ちて比率が壊れる。**A/B の分母は `paywall_viewed` の param 側で取る**（ユーザープロパティは非同期設定なので表示イベントに間に合う保証がない） |
| 2026-08-08 | 未型付けだった25イベントを `analyticsEvents.ts` に登録 | 送信内容は不変。型が付いただけ |
| （それ以前） | `paywall_viewed` の `source` 語彙を `onboarding\|returning\|unknown` に統一 | 旧 `direct` は `dismissed` 側にのみ存在 |

---

## 6. 本番で実際に発火しているか（実測 2026-08-08、2026-07-19〜08-06）

「実装済み ≠ 本番で取れている」。未出荷バージョンのイベントは0件のまま。

| 状態 | イベント |
|---|---|
| 十分な件数 | `screen_view`(1,814) `onboarding_step_viewed`(944) `user_engagement`(876) `session_start`(81) `paywall_viewed`(76) `benefits_screen_viewed`(63) `paywall_dismissed`(58) `benefits_cta_tapped`(44) `first_open`(39) |
| 少数だが発火 | `onboarding_complete`(30) `notification_permission`(30) `reflection_opened`(19) `panic_button_tapped`(14) `purchase_initiated`(12) `lesson_started`(11) `breathing_started`(9) `pro_purchase_completed`(2) |
| **0件** | `activation_reached` `notification_opened` `badge_unlocked` `share_tapped` `quick_action_tapped` 以外の一部 — **2.4.0 の配信待ち**、または単に使われていない |

`activation_reached` が0件なのは実装漏れではなく **2.4.0 が本番に出ていない**ため
（実測: 41台が 2.3.0、2.4.0 は1台）。リリース後に再確認すること。
