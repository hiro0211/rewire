# Rewire（リワイア） — MVP 要件定義書・画面設計・技術設計

> **プロダクト名：** Rewire（リワイア）
>
> **名前の意味：** Rewire = 脳の再配線・習慣の再構築。ポルノによって形成された神経回路を、自制心・集中力・キャリアに向けた回路へ再配線していくというコンセプトを一語で体現する。
>
> **コンセプト：** 人生を前に進めるために、ポルノを捨てるアプリ
>
> **ターゲット：** 日本の20〜40代男性（キャリア志向・自己研鑽志向）
>
> **技術スタック：** React Native / Expo / TypeScript / iOS / Supabase（将来）
>
> **ビジネスモデル：** フリーミアム ＋ Google AdMob（無料ユーザー向け広告）
>
> **最終更新：** 2026-02-11

---

## 目次

1. [画面一覧（画面ID付き）](#1-画面一覧)
2. [主要画面のUI構成](#2-主要画面のui構成)
3. [ユーザーフロー図](#3-ユーザーフロー図)
4. [フリーミアム境界の整理表](#4-フリーミアム境界の整理表)
5. [データモデル設計（簡易ER）](#5-データモデル設計)
6. [通知設計](#6-通知設計)
7. [React Native + Expo 実装構成案（アーキテクチャ設計）](#7-実装構成案)
    - 7.0 アーキテクチャ設計原則（SRP・レイヤー依存ルール）
    - 7.1 ディレクトリ構成（Frontend / lib 分離）
    - 7.2 レイヤー間のデータフローパターン
    - 7.3〜7.6 各レイヤーの実装ルール（Screen / Component / lib / features）
    - 7.7 主要ライブラリ
    - 7.8 状態管理設計（Zustand）
    - 7.9 汎用型定義
    - 7.10 ファイル命名規約
8. [iOS Safari Content Blocker Extension 連携方針](#8-safari-content-blocker-連携方針)
9. [日本人男性に刺さるUIトーン＆ビジュアル指針](#9-uiトーンビジュアル指針)
10. [深呼吸インターベンション詳細仕様](#10-深呼吸インターベンション詳細仕様)
11. [AdMob 広告設計方針](#11-admob-広告設計方針)

---

## 1. 画面一覧

| 画面ID | 画面名 | カテゴリ | Free/Pro |
|--------|--------|----------|----------|
| S-001 | スプラッシュ | システム | Free |
| S-002 | オンボーディング（3ステップ） | システム | Free |
| S-003 | 目標設定（初回） | システム | Free |
| D-001 | ダッシュボード（ホーム） | メイン | Free（一部Pro） |
| B-001 | 深呼吸ガイド（衝動介入） | 呼吸 | Free |
| B-002 | 呼吸後の質問画面 | 呼吸 | Free |
| B-003 | 成功メッセージ画面 | 呼吸 | Free |
| C-001 | チェックイン入力画面 | チェックイン | Free |
| C-002 | チェックイン完了画面 | チェックイン | Free |
| R-001 | リカバリー（振り返り）画面 | リカバリー | Free |
| R-002 | リカバリージャーナル | リカバリー | **Pro** |
| A-001 | 記事一覧 | コンテンツ | Free（3本/週）|
| A-002 | 記事詳細 | コンテンツ | Free/Pro |
| P-001 | Safariブロック管理画面 | プロテクション | **Pro** |
| H-001 | 履歴・レポート画面 | データ | **Pro** |
| H-002 | 詳細統計レポート | データ | **Pro** |
| T-001 | 設定画面 | システム | Free |
| T-002 | プロフィール・目標編集 | システム | Free |
| T-003 | 通知設定 | システム | Free |
| T-004 | Pro アップグレード画面 | 課金 | Free |
| T-005 | App内課金完了画面 | 課金 | — |

---

## 2. 主要画面のUI構成

### D-001 ダッシュボード（ホーム）

```
┌──────────────────────────────┐
│  ステータスバー               │
├──────────────────────────────┤
│                              │
│  [連続日数 大表示]            │
│  "12 Days"                   │
│  目標: 30日                  │
│  ── プログレスバー ──        │
│                              │
├──────────────────────────────┤
│  週間サマリーカード           │
│  ┌────┐ ┌────┐ ┌────┐       │
│  │成功率│ │誘惑│ │評価│       │
│  │85%  │ │低  │ │4.2│       │
│  └────┘ └────┘ └────┘       │
│                              │
├──────────────────────────────┤
│  📰 今日のインサイト（記事）  │
│  カード1枚プレビュー         │
│                              │
├──────────────────────────────┤
│  [AdMob バナー広告]          │
│  ※ Pro ユーザーは非表示      │
│                              │
├──────────────────────────────┤
│                              │
│  🔴 SOSボタン（衝動時タップ） │
│  フローティング・右下固定    │
│                              │
└──────────────────────────────┘
  [Home] [記事] [設定]  ← タブバー
```

**セクション詳細：**

| セクション | 内容 | 備考 |
|-----------|------|------|
| ヘッダー | 日付、ユーザー名（ニックネーム） | 挨拶は「おかえり」等、簡潔に |
| メインカード | 連続日数（大数字）＋目標プログレスバー | 最も目立つ領域 |
| 週間サマリー | 成功率 / 誘惑平均 / 自己評価平均 | 3カラムカード |
| インサイト | 記事カード1枚（Freeは週3本） | 横スワイプ不可、1枚のみ |
| 広告 | AdMob バナー（320×50） | Free ユーザーのみ表示 |
| SOSボタン | フローティングアクションボタン | 常時表示、ワンタップで B-001 起動 |
| タブバー | Home / 記事 / 設定 | 3タブ構成 |

### B-001 深呼吸ガイド（衝動介入）

```
┌──────────────────────────────┐
│  ■■■■■■ フルスクリーン ■■■■ │
│                              │
│  背景: ダークグラデーション    │
│                              │
│                              │
│        ╭─────────╮           │
│       ╱           ╲          │
│      │   ● 円形   │  ← 拡大/縮小│
│       ╲           ╱          │
│        ╰─────────╯           │
│                              │
│  「ゆっくり息を吸ってください」│
│                              │
│  ○ ○ ● ← サイクルインジケータ│
│                              │
│                              │
│  × 閉じる（左上・小さく）     │
│                              │
└──────────────────────────────┘
```

**構成要素：**

| 要素 | 仕様 |
|------|------|
| 背景 | ダーク〜ネイビーのグラデーション。外部情報を遮断するフルスクリーン |
| 中央の円 | 半透明の白〜淡いブルー。吸うフェーズで6秒かけて拡大、吐くフェーズで6秒かけて縮小 |
| テキスト | 吸う時：「ゆっくり息を吸ってください」 / 吐く時：「ゆっくり息を吐いてください」 |
| サイクルインジケータ | ドット3つ。現在のサイクル位置を示す（○○● → ○●● → ●●●） |
| 閉じるボタン | 左上に小さく配置。誤タップ防止でやや小さめ |
| タイマー | **表示しない**（没入優先） |

### B-002 呼吸後の質問画面

```
┌──────────────────────────────┐
│                              │
│                              │
│  「今、誘惑は落ち着きましたか？」│
│                              │
│                              │
│   ┌──────────┐              │
│   │   はい    │  ← primary  │
│   └──────────┘              │
│                              │
│   ┌──────────┐              │
│   │   いいえ  │  ← secondary│
│   └──────────┘              │
│                              │
│                              │
└──────────────────────────────┘
```

### B-003 成功メッセージ画面

```
┌──────────────────────────────┐
│                              │
│                              │
│       🎊（紙吹雪アイコン）    │
│                              │
│    「素晴らしい、{name}！」   │
│                              │
│    欲求の波に抵抗するたびに、 │
│    あなたの脳は少しずつ       │
│    変化し、自制心と集中力が    │
│    積み上がっています。       │
│                              │
│                              │
│    [タップして続ける]          │
│                              │
│                              │
└──────────────────────────────┘
```

### C-001 チェックイン入力画面

```
┌──────────────────────────────┐
│  ← 戻る      デイリーチェックイン│
├──────────────────────────────┤
│                              │
│  今日の振り返り               │
│                              │
│  ❶ ポルノを見ましたか？       │
│     [ はい ]  [ いいえ ]      │
│                              │
│  ❷ オナニーをしましたか？     │
│     [ はい ]  [ いいえ ]      │
│                              │
│  ❸ 誘惑レベル                │
│     [──●──────] なし〜高い    │
│                              │
│  ❹ ストレスレベル            │
│     [────●────] 低〜高       │
│                              │
│  ❺ 今日の生活の質            │
│     [──────●──] 1〜5         │
│                              │
│  ❻ 一言メモ（任意）          │
│     [_________________________]│
│                              │
│     [ 記録する ]              │
│                              │
├──────────────────────────────┤
│  [AdMob バナー広告]          │
└──────────────────────────────┘
```

**入力仕様：**

| 項目 | 入力形式 | 値 |
|------|----------|------|
| ポルノ視聴 | 2択ボタン | yes / no |
| オナニー | 2択ボタン | yes / no |
| 誘惑レベル | スライダー | 0（なし）〜 4（高い） |
| ストレスレベル | スライダー | 0（低）〜 4（高） |
| 生活の質 | スライダー | 1〜5 |
| 一言メモ | テキスト入力 | 最大140文字、任意 |

### R-001 リカバリー（振り返り）画面

チェックインで「ポルノを見た：はい」選択時に C-002 の代わりに遷移する。

```
┌──────────────────────────────┐
│                              │
│  大丈夫。ここから始めよう。   │
│                              │
│  ──────────────────          │
│                              │
│  「何が引き金になったと       │
│    思いますか？」             │
│                              │
│  [ストレス] [退屈] [孤独]    │
│  [疲れ] [SNS] [その他]       │
│                              │
│  ──────────────────          │
│                              │
│  「次にどうする？」           │
│                              │
│  ・深呼吸をする → B-001      │
│  ・記事を読む → A-001        │
│  ・ホームに戻る → D-001      │
│                              │
│  ──────────────────          │
│  あなたの連続記録は           │
│  リセットされましたが、       │
│  学びの記録は残っています。   │
│                              │
└──────────────────────────────┘
```

**設計方針：** 失敗を責めない。「振り返り → 次の行動」へ自然に接続する。リセットは事実として伝えるが、強調しない。

### A-001 記事一覧

```
┌──────────────────────────────┐
│  インサイト           フィルタ│
├──────────────────────────────┤
│                              │
│  ┌────────────────────┐      │
│  │ 🧠 記事カード 1     │      │
│  │ タイトル            │      │
│  │ サブテキスト (2行)  │      │
│  │ 読了時間: 3分  🔓   │      │
│  └────────────────────┘      │
│                              │
│  ┌────────────────────┐      │
│  │ 📊 記事カード 2     │      │
│  │ タイトル            │      │
│  │ サブテキスト (2行)  │      │
│  │ 読了時間: 5分       │      │
│  └────────────────────┘      │
│                              │
│  [AdMob ネイティブ広告]      │
│                              │
│  ┌────────────────────┐      │
│  │ 🧠 記事カード 3     │      │
│  │ ...                 │      │
│  └────────────────────┘      │
│                              │
└──────────────────────────────┘
```

**記事カテゴリ：**

| カテゴリ | 内容例 |
|----------|--------|
| 🧠 脳科学 | ドーパミン報酬系、前頭前皮質の可塑性 |
| 📊 習慣形成 | ハビットループ、キューの特定 |
| 🎯 集中力 | ディープワーク、フロー状態 |
| 💼 キャリア | 自制心と生産性の相関 |
| 🔬 研究要約 | 学術論文のわかりやすい要約 |

### P-001 Safariブロック管理画面（Pro）

```
┌──────────────────────────────┐
│  ← 設定     プロテクション    │
├──────────────────────────────┤
│                              │
│  Safari ブロック              │
│  ┌──────────────────────┐    │
│  │ コンテンツブロッカー     │    │
│  │              [ON/OFF] │    │
│  └──────────────────────┘    │
│                              │
│  ステータス                  │
│  ✅ 有効（xxx サイト遮断中） │
│                              │
│  ──────────────────          │
│                              │
│  ⚠️ 注意                     │
│  Safari以外のブラウザには     │
│  適用されません。             │
│  iOS設定 > Safari > 拡張機能  │
│  から有効にしてください。     │
│                              │
│  [設定を開く]                │
│                              │
└──────────────────────────────┘
```

### T-004 Pro アップグレード画面

```
┌──────────────────────────────┐
│  × 閉じる                    │
├──────────────────────────────┤
│                              │
│  Rewire Pro                │
│                              │
│  「集中と自制の環境を         │
│    完全に整える」             │
│                              │
│  ✓ Safariブロッカー          │
│  ✓ 詳細レポート＆分析        │
│  ✓ すべての履歴閲覧          │
│  ✓ リカバリージャーナル      │
│  ✓ すべての記事              │
│  ✓ 広告非表示               │
│                              │
│  ──────────────────          │
│                              │
│  ¥480/月  または  ¥3,800/年  │
│                              │
│  [Pro にアップグレード]       │
│                              │
│  7日間の無料体験つき         │
│                              │
└──────────────────────────────┘
```

---

## 3. ユーザーフロー図

### 3.1 初回起動フロー

```
アプリ起動
  → S-001 スプラッシュ
  → S-002 オンボーディング
    Step1: コンセプト説明（「人生を前に進めるアプリ」）
    Step2: 匿名ニックネーム設定
    Step3: チェックイン通知時間設定
  → S-003 目標設定
    連続日数目標（7日 / 14日 / 30日 / 90日 / カスタム）
  → D-001 ダッシュボード
```

### 3.2 日常利用フロー

```
通知受信（指定時刻）
  → C-001 チェックイン入力
    → ポルノ視聴 = No の場合
      → C-002 チェックイン完了（「いい一日だった」）
      → D-001 ダッシュボード
    → ポルノ視聴 = Yes の場合
      → R-001 リカバリー（振り返り）
        → 引き金の選択
        → 次のアクション選択
          → B-001 深呼吸 or A-001 記事 or D-001 ホーム
```

### 3.3 衝動介入フロー

```
D-001 SOSボタンタップ
  → B-001 深呼吸ガイド（即起動・説明画面なし）
    → 3回の呼吸サイクル（各12秒 × 3 = 36秒）
    → B-002 質問画面「誘惑は落ち着きましたか？」
      → 「はい」→ B-003 成功メッセージ → D-001
      → 「いいえ」→ B-001 再度3回呼吸（ループ）
```

### 3.4 記事閲覧フロー

```
タブバー「記事」タップ
  → A-001 記事一覧
    → Freeユーザー：週3本のみタップ可。ロック記事は🔓表示
      → ロック記事タップ → T-004 Pro アップグレード
    → A-002 記事詳細（カード型読み切り）
```

### 3.5 Pro アップグレードフロー

```
各画面のProゲートからの導線
  → T-004 Pro アップグレード画面
  → Apple In-App Subscription（月額 or 年額）
  → T-005 完了画面
  → 元の画面へ戻る（Proコンテンツ解放）
```

---

## 4. フリーミアム境界の整理表

| 機能 | Free | Pro |
|------|------|-----|
| デイリーチェックイン | ✅ | ✅ |
| 深呼吸インターベンション | ✅ | ✅ |
| 連続日数表示 | ✅ | ✅ |
| 週間成功率表示 | ✅ | ✅ |
| 誘惑平均・自己評価 | 直近7日のみ | 全期間 |
| 科学記事 | 週3本 | 全記事 |
| Safariブロッカー | ❌ | ✅ |
| 詳細レポート（グラフ・分析） | ❌ | ✅ |
| 過去チェックイン履歴フル閲覧 | 直近7日のみ | 全期間 |
| リカバリージャーナル | ❌ | ✅ |
| リカバリー振り返り（基本） | ✅ | ✅ |
| 広告表示 | バナー＋ネイティブ | 非表示 |
| キャリア連動機能（将来） | ❌ | ✅ |

**広告表示ポリシー（Free）：**

| 画面 | 広告タイプ | 備考 |
|------|-----------|------|
| D-001 ダッシュボード | バナー（320×50） | SOSボタンの上に配置 |
| C-001 チェックイン | バナー（320×50） | 入力フォーム下部 |
| A-001 記事一覧 | ネイティブ広告 | 記事カード間に挿入 |
| B-001 深呼吸ガイド | **広告なし** | 衝動介入中は絶対に広告を出さない |
| R-001 リカバリー | **広告なし** | ユーザーが脆弱な状態では広告を出さない |

---

## 5. データモデル設計

### 5.1 簡易ER図

```
┌──────────────┐     ┌──────────────────┐
│    User       │     │    DailyCheckIn   │
├──────────────┤     ├──────────────────┤
│ id (PK)      │──┐  │ id (PK)          │
│ nickname     │  │  │ user_id (FK)     │
│ created_at   │  ├──│ date             │
│ goal_days    │  │  │ watched_porn     │
│ streak_start │  │  │ masturbated      │
│ is_pro       │  │  │ urge_level (0-4) │
│ timezone     │  │  │ stress_level(0-4)│
│ notify_time  │  │  │ quality_of_life  │
│ notify_on    │  │  │ memo             │
└──────────────┘  │  │ created_at       │
                  │  └──────────────────┘
                  │
                  │  ┌──────────────────┐
                  │  │  BreathSession    │
                  │  ├──────────────────┤
                  ├──│ id (PK)          │
                  │  │ user_id (FK)     │
                  │  │ total_cycles     │
                  │  │ urge_resolved    │
                  │  │ created_at       │
                  │  └──────────────────┘
                  │
                  │  ┌──────────────────┐
                  │  │  Recovery         │
                  │  ├──────────────────┤
                  ├──│ id (PK)          │
                  │  │ user_id (FK)     │
                  │  │ checkin_id (FK)  │
                  │  │ trigger          │
                  │  │ journal (Pro)    │
                  │  │ created_at       │
                  │  └──────────────────┘
                  │
                  │  ┌──────────────────┐
                  │  │  Article          │
                  │  ├──────────────────┤
                  │  │ id (PK)          │
                  │  │ title            │
                  │  │ body             │
                  │  │ category         │
                  │  │ read_minutes     │
                  │  │ is_free          │
                  │  │ published_at     │
                  │  └──────────────────┘
                  │
                  │  ┌──────────────────┐
                  │  │  ArticleRead      │
                  │  ├──────────────────┤
                  └──│ id (PK)          │
                     │ user_id (FK)     │
                     │ article_id (FK)  │
                     │ read_at          │
                     └──────────────────┘
```

### 5.2 MVPストレージ方針

MVPではバックエンド（Supabase）は最小限とし、主にローカルストレージで管理する。

| データ | ストレージ | 備考 |
|--------|-----------|------|
| User | AsyncStorage | デバイスローカル |
| DailyCheckIn | AsyncStorage | ローカル保存、将来Supabase同期 |
| BreathSession | AsyncStorage | ローカルのみ |
| Recovery | AsyncStorage | ローカル保存 |
| Article | ハードコード or JSON | MVP初期は15〜20本をアプリバンドル |
| ArticleRead | AsyncStorage | ローカル |
| Pro Status | RevenueCat | In-App Purchase管理 |

**将来拡張（Supabase移行時）：**
- ユーザー認証（Apple Sign In）
- データ同期・バックアップ
- 記事のCMS管理
- 匿名統計ダッシュボード

---

## 6. 通知設計

### 6.1 通知一覧

| 通知ID | 種別 | タイミング | 文言例 | Free/Pro |
|--------|------|-----------|--------|----------|
| N-001 | デイリーチェックイン | ユーザー指定時刻（デフォルト22:00） | 「今日の振り返りをしませんか」 | Free |
| N-002 | ストリーク祝福 | 7, 14, 30, 60, 90日達成時 | 「30日達成。確実に前に進んでいます」 | Free |
| N-003 | リマインド（未チェックイン） | 指定時刻の2時間後 | 「まだ今日の記録が入っていません」 | Free |
| N-004 | 週間レポート通知 | 毎週月曜 9:00 | 「先週のレポートが完成しました」 | Pro |

### 6.2 通知トーン指針

- 説教しない。命令しない
- 「〜しませんか」「〜が完成しました」など提案・報告型
- 絵文字は使わない（通知テキスト内）
- ポルノ・依存に関する直接的な単語は通知に含めない（プライバシー配慮）

### 6.3 技術実装

| 項目 | 方針 |
|------|------|
| ライブラリ | `expo-notifications`（ローカル通知） |
| スケジューリング | `scheduleNotificationAsync` で日次リピート設定 |
| 権限要求 | オンボーディング Step3 で要求 |
| バッジ | 未チェックイン日のみバッジ1 |

---

## 7. 実装構成案

### 7.0 アーキテクチャ設計原則

本プロジェクトは以下の原則を遵守し、保守性・可読性・変更容易性を最大化する。

#### 単一責任の原則（SRP）

| レイヤー | 責務 | やってはいけないこと |
|---------|------|-------------------|
| `app/` (Screen) | ルーティング＋レイアウト組み立てのみ | ビジネスロジック、API呼び出し、直接的な状態操作 |
| `components/` | UIの描画と見た目の制御のみ | データフェッチ、ストア直接参照、ナビゲーション |
| `features/` | ドメインごとのビジネスロジック集約 | 他featureへの直接依存、UI描画 |
| `hooks/` | 状態とロジックの橋渡し（UIとfeatureの接続） | 永続化処理、API直接呼び出し |
| `stores/` | クライアント状態の管理のみ | API呼び出し、UIロジック |
| `lib/` | 外部サービス・API・バックエンドとの通信 **すべて** | ビジネスロジック、UI依存コード |

#### レイヤー依存ルール

```
app/ (Screen)
  │  参照OK
  ▼
hooks/  ←──  components/ (propsで受け取る)
  │  参照OK
  ▼
features/ (ビジネスロジック)
  │  参照OK
  ├──→ stores/ (状態読み書き)
  └──→ lib/ (外部通信)
          │  参照OK
          ▼
        外部SDK・API・AsyncStorage・Supabase
```

**禁止される依存方向：**
- `lib/` → `features/`, `hooks/`, `components/`, `app/`
- `stores/` → `lib/`（store は純粋な状態管理のみ。API呼び出しは features/ 経由）
- `components/` → `stores/`（component は props で受け取り、store を直接参照しない）
- `features/A` → `features/B`（feature 間の直接依存禁止。必要なら `features/shared/` を作る）

### 7.1 ディレクトリ構成

フロントエンド（React Native）とバックエンド通信（lib）を明確に分離する。

```
rewire/
│
│  ===================================================
│  lib/ — バックエンド通信・外部サービス連携層
│  すべてのAPI/SDK/永続化はここを経由する
│  ===================================================
│
├── lib/
│   ├── api/                          # 将来のSupabase REST API クライアント
│   │   ├── client.ts                 # Supabase クライアント初期化（将来用）
│   │   ├── checkinApi.ts             # チェックインCRUD（将来: Supabase同期）
│   │   ├── articleApi.ts             # 記事取得（将来: CMS連携）
│   │   └── userApi.ts                # ユーザー情報（将来: 認証・プロフィール同期）
│   │
│   ├── storage/                      # ローカル永続化層（MVP主力）
│   │   ├── asyncStorageClient.ts     # AsyncStorage の薄いラッパー（get/set/remove）
│   │   ├── checkinStorage.ts         # DailyCheckin の保存・取得・削除
│   │   ├── breathSessionStorage.ts   # BreathSession の保存・取得
│   │   ├── recoveryStorage.ts        # Recovery の保存・取得
│   │   ├── userStorage.ts            # User設定 の保存・取得
│   │   └── articleReadStorage.ts     # 記事既読状態 の保存・取得
│   │
│   ├── purchases/                    # 課金（RevenueCat）
│   │   ├── purchaseClient.ts         # RevenueCat SDK 初期化・設定
│   │   ├── purchaseService.ts        # 購入実行、復元、ステータス確認
│   │   └── purchaseTypes.ts          # Offering, Entitlement 型定義
│   │
│   ├── ads/                          # 広告（Google AdMob）
│   │   ├── adMobClient.ts            # AdMob SDK 初期化
│   │   └── adConfig.ts               # 広告ユニットID、表示ルール定数
│   │
│   ├── notifications/                # 通知（expo-notifications）
│   │   ├── notificationClient.ts     # expo-notifications ラッパー
│   │   └── notificationScheduler.ts  # スケジュール登録・解除ロジック
│   │
│   ├── contentBlocker/               # Safari Content Blocker Native Bridge
│   │   ├── contentBlockerBridge.ts   # Native Module 呼び出し（enable/disable/status）
│   │   └── contentBlockerTypes.ts    # ブロッカー状態型
│   │
│   └── analytics/                    # 分析（将来用）
│       └── analyticsClient.ts        # イベント送信の抽象レイヤー
│
│  ===================================================
│  フロントエンド — React Native アプリケーション層
│  ===================================================
│
├── app/                              # Expo Router — ルーティング＋画面組み立てのみ
│   ├── _layout.tsx                   # Root layout（Providerラップ、フォント読込）
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Tab layout（タブバー定義）
│   │   ├── index.tsx                 # D-001 ダッシュボード
│   │   ├── articles.tsx              # A-001 記事一覧
│   │   └── settings.tsx              # T-001 設定
│   ├── onboarding/
│   │   ├── index.tsx                 # S-002 オンボーディング
│   │   └── goal.tsx                  # S-003 目標設定
│   ├── breathing/
│   │   ├── index.tsx                 # B-001 深呼吸ガイド
│   │   ├── ask.tsx                   # B-002 質問画面
│   │   └── success.tsx               # B-003 成功メッセージ
│   ├── checkin/
│   │   ├── index.tsx                 # C-001 チェックイン入力
│   │   └── complete.tsx              # C-002 完了
│   ├── recovery/
│   │   ├── index.tsx                 # R-001 リカバリー
│   │   └── journal.tsx               # R-002 ジャーナル (Pro)
│   ├── article/
│   │   └── [id].tsx                  # A-002 記事詳細
│   ├── history/
│   │   ├── index.tsx                 # H-001 履歴
│   │   └── report.tsx                # H-002 詳細レポート (Pro)
│   ├── protection.tsx                # P-001 Safari ブロック (Pro)
│   ├── upgrade.tsx                   # T-004 Pro アップグレード
│   └── +not-found.tsx
│
├── features/                         # ドメインごとのビジネスロジック
│   ├── checkin/
│   │   ├── checkinService.ts         # チェックイン登録・バリデーション・ストリーク更新
│   │   ├── checkinValidator.ts       # 入力バリデーションルール
│   │   └── streakCalculator.ts       # ストリーク日数計算ロジック（純粋関数）
│   │
│   ├── breathing/
│   │   ├── breathingService.ts       # 呼吸セッション記録・完了処理
│   │   └── breathingTimer.ts         # タイミング定数・サイクル計算（純粋関数）
│   │
│   ├── recovery/
│   │   ├── recoveryService.ts        # リカバリー記録・トリガー集計
│   │   └── recoveryFlow.ts           # リカバリー導線の分岐ロジック
│   │
│   ├── articles/
│   │   ├── articleService.ts         # 記事取得・既読管理・Free/Pro制限判定
│   │   └── articleAccessPolicy.ts    # 週間無料枠の計算（純粋関数）
│   │
│   ├── stats/
│   │   ├── statsService.ts           # 週間/月間統計の集計
│   │   └── statsCalculator.ts        # 成功率・平均誘惑・平均評価の計算（純粋関数）
│   │
│   ├── subscription/
│   │   ├── subscriptionService.ts    # Pro状態判定、アップグレードフロー制御
│   │   └── adPolicy.ts              # 広告表示可否の判定ロジック（純粋関数）
│   │
│   └── contentBlocker/
│       └── contentBlockerService.ts  # ブロッカー有効化/無効化のビジネスロジック
│
├── components/                       # UIコンポーネント（表示専用・props駆動）
│   ├── ui/                           # 汎用UIプリミティブ
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Slider.tsx
│   │   ├── ToggleButton.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── FullScreenMessage.tsx     # B-003, C-002 等で再利用
│   │   └── SectionHeader.tsx
│   │
│   ├── breathing/                    # 呼吸機能専用コンポーネント
│   │   ├── BreathingCircle.tsx       # Reanimated 円アニメーション
│   │   ├── BreathingText.tsx         # 吸う/吐くテキスト（フェード付き）
│   │   └── CycleIndicator.tsx        # ドットインジケーター
│   │
│   ├── checkin/                      # チェックイン専用コンポーネント
│   │   ├── BinaryQuestion.tsx        # はい/いいえ
│   │   ├── LevelSlider.tsx           # 誘惑/ストレス/QoLスライダー
│   │   └── MemoInput.tsx             # 一言メモ入力
│   │
│   ├── dashboard/                    # ダッシュボード専用コンポーネント
│   │   ├── StreakCard.tsx
│   │   ├── WeeklySummaryCard.tsx
│   │   ├── InsightCard.tsx           # 記事プレビューカード
│   │   └── SOSButton.tsx
│   │
│   ├── articles/                     # 記事専用コンポーネント
│   │   ├── ArticleListItem.tsx       # 記事一覧の1行
│   │   └── ArticleContent.tsx        # 記事本文レンダリング
│   │
│   ├── recovery/                     # リカバリー専用コンポーネント
│   │   ├── TriggerSelector.tsx       # 引き金選択チップ
│   │   └── NextActionList.tsx        # 次のアクション選択肢
│   │
│   ├── ads/                          # 広告コンポーネント
│   │   ├── BannerAdView.tsx          # AdMob バナー表示（Pro判定済み前提）
│   │   └── NativeAdView.tsx          # AdMob ネイティブ表示
│   │
│   └── common/                       # 共通レイアウト
│       ├── ProGate.tsx               # Pro機能ゲート（children or アップグレード誘導）
│       ├── AdSlot.tsx                # 広告表示スロット（表示判定をhookから受け取る）
│       └── SafeAreaWrapper.tsx
│
├── hooks/                            # カスタムフック（UI ↔ features の橋渡し）
│   ├── breathing/
│   │   ├── useBreathingEngine.ts     # 呼吸フェーズ状態管理・アニメーション制御
│   │   └── useBreathingSession.ts    # セッション記録の読み書き
│   │
│   ├── checkin/
│   │   ├── useCheckinForm.ts         # フォーム状態管理・バリデーション
│   │   ├── useCheckinSubmit.ts       # 送信処理（feature呼び出し→store更新）
│   │   └── useTodayCheckin.ts        # 今日のチェックイン状態取得
│   │
│   ├── dashboard/
│   │   ├── useStreak.ts              # ストリーク情報取得
│   │   └── useWeeklyStats.ts         # 週間統計取得
│   │
│   ├── articles/
│   │   ├── useArticleList.ts         # 記事一覧取得（Free制限込み）
│   │   └── useArticleDetail.ts       # 記事詳細取得・既読記録
│   │
│   ├── subscription/
│   │   ├── useProStatus.ts           # Pro状態の購読
│   │   └── useAdVisibility.ts        # 画面別広告表示判定
│   │
│   ├── recovery/
│   │   └── useRecoveryFlow.ts        # リカバリー入力・フロー管理
│   │
│   └── common/
│       ├── useNotificationSetup.ts   # 通知権限・スケジュール管理
│       └── useAppLifecycle.ts        # フォア/バックグラウンド検知
│
├── stores/                           # Zustand — クライアント状態のみ（副作用なし）
│   ├── userStore.ts                  # ユーザー設定・ニックネーム・目標
│   ├── checkinStore.ts               # チェックイン一覧・今日のチェックイン
│   ├── breathStore.ts                # 呼吸セッション一覧
│   ├── articleStore.ts               # 記事データ・既読状態
│   ├── subscriptionStore.ts          # Pro状態・サブスクリプション情報
│   └── settingsStore.ts              # 通知設定・テーマ設定
│
├── constants/                        # 定数・設定値
│   ├── theme.ts                      # カラーパレット、フォント、スペーシング
│   ├── breathing.ts                  # 呼吸タイミング定数（INHALE_DURATION等）
│   ├── articles.ts                   # MVPハードコード記事データ
│   ├── triggers.ts                   # リカバリー引き金の選択肢定数
│   ├── adUnits.ts                    # AdMob ユニットID
│   └── blocklist.json                # Content Blocker ルール
│
├── types/                            # 型定義（全レイヤー共通）
│   ├── models.ts                     # ドメインモデル型（User, DailyCheckin等）
│   ├── breathing.ts                  # BreathPhase, BreathSession型
│   ├── checkin.ts                    # チェックイン入力型、バリデーション型
│   ├── articles.ts                   # Article, ArticleCategory型
│   ├── subscription.ts               # ProStatus, PurchaseResult型
│   ├── navigation.ts                 # ルートパラメータ型
│   └── common.ts                     # 汎用型（Result<T>, AsyncState<T>等）
│
├── utils/                            # 純粋ユーティリティ関数
│   ├── date.ts                       # 日付フォーマット、日数差計算
│   ├── id.ts                         # UUID生成
│   └── validation.ts                 # 汎用バリデーションヘルパー
│
├── assets/
│   ├── fonts/
│   └── images/
│
├── ios/
│   └── ContentBlockerExtension/      # Safari Content Blocker
│       ├── Info.plist
│       └── blockerList.json
│
├── app.json
├── eas.json
└── tsconfig.json
```

### 7.2 レイヤー間のデータフローパターン

画面（app/）からバックエンド（lib/）までのデータフローを、チェックイン機能を例に示す。

```
┌─────────────────────────────────────────────────────────────────┐
│  app/checkin/index.tsx (Screen)                                 │
│  ─ useCheckinForm() から formState と handlers を取得           │
│  ─ useCheckinSubmit() から submit 関数を取得                    │
│  ─ components に props として渡す                               │
│  ─ ナビゲーション制御（submit成功 → complete画面へ遷移）        │
└──────────────────────┬──────────────────────────────────────────┘
                       │ calls hooks
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  hooks/checkin/useCheckinSubmit.ts                              │
│  ─ features の checkinService.submitCheckin() を呼ぶ            │
│  ─ 結果を stores の checkinStore に反映                         │
│  ─ loading / error 状態を管理してScreenに返す                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │ calls feature
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  features/checkin/checkinService.ts                             │
│  ─ checkinValidator でバリデーション                             │
│  ─ streakCalculator でストリーク再計算                           │
│  ─ lib/storage の checkinStorage.save() で永続化                │
│  ─ 将来: lib/api の checkinApi.sync() でサーバー同期            │
└──────────────────────┬──────────────────────────────────────────┘
                       │ calls lib
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  lib/storage/checkinStorage.ts                                  │
│  ─ asyncStorageClient 経由で AsyncStorage に保存                │
│  ─ 将来: lib/api/checkinApi.ts に差し替え or 併用              │
└─────────────────────────────────────────────────────────────────┘
```

**この設計により得られる変更容易性：**

| 将来の変更 | 影響範囲 | 変更不要 |
|-----------|---------|---------|
| AsyncStorage → Supabase移行 | `lib/storage/` → `lib/api/` 差替え＋ `features/` 内の呼び出し先変更 | `hooks/`, `components/`, `app/`, `stores/` |
| AdMob → 別広告SDK | `lib/ads/` の差替え | `features/`, `hooks/`, `components/`（AdSlotのpropsは不変） |
| RevenueCat → 別課金SDK | `lib/purchases/` の差替え | `features/subscription/` のインターフェースが同じなら全て不変 |
| チェックインに新項目追加 | `types/` → `components/checkin/` → `features/checkin/` → `lib/storage/` | `app/` のレイアウトは最小変更 |
| 新しいタブ画面追加 | `app/(tabs)/` に1ファイル追加 | 既存ファイル変更なし |

### 7.3 Screen（app/）の実装ルール

Screen ファイルは「配線係」であり、ロジックを持たない。

```typescript
// ✅ 正しい Screen の例: app/checkin/index.tsx
export default function CheckinScreen() {
  const { formState, setField } = useCheckinForm();
  const { submit, isLoading, error } = useCheckinSubmit();
  const { isPro } = useProStatus();
  const { shouldShowAd } = useAdVisibility('C-001');
  const router = useRouter();

  const handleSubmit = async () => {
    const result = await submit(formState);
    if (result.success) {
      if (formState.watchedPorn) {
        router.push('/recovery');
      } else {
        router.push('/checkin/complete');
      }
    }
  };

  return (
    <SafeAreaWrapper>
      <BinaryQuestion
        label="ポルノを見ましたか？"
        value={formState.watchedPorn}
        onChange={(v) => setField('watchedPorn', v)}
      />
      <LevelSlider
        label="誘惑レベル"
        value={formState.urgeLevel}
        onChange={(v) => setField('urgeLevel', v)}
      />
      {/* ... 他の入力コンポーネント ... */}
      <Button title="記録する" onPress={handleSubmit} loading={isLoading} />
      {shouldShowAd && <AdSlot type="banner" />}
    </SafeAreaWrapper>
  );
}

// ❌ 禁止: Screen 内でやってはいけないこと
// - AsyncStorage.getItem() を直接呼ぶ
// - store の set 関数を直接呼ぶ
// - 日数計算ロジックを書く
// - fetch / API呼び出しを書く
```

### 7.4 Component の実装ルール

Component は props で完結する純粋なUIとする。

```typescript
// ✅ 正しい Component の例: components/checkin/BinaryQuestion.tsx
interface BinaryQuestionProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export function BinaryQuestion({ label, value, onChange }: BinaryQuestionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.buttons}>
        <ToggleButton
          title="はい"
          active={value === true}
          onPress={() => onChange(true)}
        />
        <ToggleButton
          title="いいえ"
          active={value === false}
          onPress={() => onChange(false)}
        />
      </View>
    </View>
  );
}

// ❌ 禁止: Component 内でやってはいけないこと
// - useCheckinStore() 等の store を直接参照
// - useRouter() でナビゲーション
// - lib/ の関数を呼ぶ
```

### 7.5 lib/ の実装ルール

lib/ は外部世界との境界であり、アプリのビジネスロジックを一切知らない。

```typescript
// ✅ 正しい lib の例: lib/storage/checkinStorage.ts
import { asyncStorageClient } from './asyncStorageClient';
import type { DailyCheckin } from '@/types/models';

const STORAGE_KEY = 'checkins';

export const checkinStorage = {
  async getAll(): Promise<DailyCheckin[]> {
    const raw = await asyncStorageClient.get<DailyCheckin[]>(STORAGE_KEY);
    return raw ?? [];
  },

  async getByDate(date: string): Promise<DailyCheckin | null> {
    const all = await this.getAll();
    return all.find((c) => c.date === date) ?? null;
  },

  async save(checkin: DailyCheckin): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex((c) => c.date === checkin.date);
    if (index >= 0) {
      all[index] = checkin;
    } else {
      all.push(checkin);
    }
    await asyncStorageClient.set(STORAGE_KEY, all);
  },

  async remove(date: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter((c) => c.date !== date);
    await asyncStorageClient.set(STORAGE_KEY, filtered);
  },
};

// ❌ 禁止: lib 内でやってはいけないこと
// - ストリーク計算（ビジネスロジックは features/）
// - Zustand store への書き込み
// - React hooks の使用
```

### 7.6 features/ の実装ルール

features/ はドメインロジックの中心であり、lib/ を呼び出し、純粋関数で計算する。

```typescript
// ✅ 正しい feature の例: features/checkin/checkinService.ts
import { checkinStorage } from '@/lib/storage/checkinStorage';
import { userStorage } from '@/lib/storage/userStorage';
import { checkinValidator } from './checkinValidator';
import { streakCalculator } from './streakCalculator';
import type { DailyCheckin, CheckinFormInput } from '@/types/checkin';
import type { Result } from '@/types/common';

export const checkinService = {
  async submitCheckin(input: CheckinFormInput): Promise<Result<DailyCheckin>> {
    // 1. バリデーション（純粋関数）
    const validation = checkinValidator.validate(input);
    if (!validation.ok) {
      return { ok: false, error: validation.error };
    }

    // 2. エンティティ生成
    const checkin: DailyCheckin = {
      id: generateId(),
      date: getTodayString(),
      ...input,
      createdAt: new Date().toISOString(),
    };

    // 3. 永続化（lib経由）
    await checkinStorage.save(checkin);

    // 4. ストリーク再計算（純粋関数）
    if (input.watchedPorn) {
      await userStorage.update({ streakStartDate: getTodayString() });
    }

    return { ok: true, data: checkin };
  },
};
```

### 7.7 主要ライブラリ

| ライブラリ | 用途 | 使用レイヤー |
|-----------|------|------------|
| expo-router | ルーティング | `app/` |
| react-native-reanimated | アニメーション | `components/breathing/` |
| zustand | 状態管理 | `stores/` |
| @react-native-async-storage/async-storage | ローカル保存 | `lib/storage/` |
| expo-notifications | ローカル通知 | `lib/notifications/` |
| react-native-purchases (RevenueCat) | 課金管理 | `lib/purchases/` |
| react-native-google-mobile-ads | AdMob | `lib/ads/` |
| expo-haptics | 触覚フィードバック | `hooks/` |
| date-fns | 日付計算 | `utils/`, `features/` |

### 7.8 状態管理設計（Zustand）

Store は純粋な状態コンテナとし、非同期処理や副作用を持たない。

```typescript
// stores/userStore.ts
// ✅ 状態の読み書きのみ。API呼び出し・永続化は features/ → lib/ で行う。
interface UserState {
  nickname: string;
  goalDays: number;
  streakStartDate: string | null;
  currentStreak: number;
  isPro: boolean;
  notifyTime: string;
  notifyEnabled: boolean;
}

interface UserActions {
  setNickname: (name: string) => void;
  setGoalDays: (days: number) => void;
  setStreakStart: (date: string | null) => void;
  setCurrentStreak: (days: number) => void;
  setIsPro: (isPro: boolean) => void;
  setNotifyTime: (time: string) => void;
  setNotifyEnabled: (enabled: boolean) => void;
  reset: () => void;
}

// stores/checkinStore.ts
interface CheckinState {
  checkins: DailyCheckin[];
  todayCheckin: DailyCheckin | null;
}

interface CheckinActions {
  setCheckins: (checkins: DailyCheckin[]) => void;
  setTodayCheckin: (checkin: DailyCheckin | null) => void;
  addCheckin: (checkin: DailyCheckin) => void;
}

// stores/breathStore.ts
interface BreathState {
  sessions: BreathSession[];
}

interface BreathActions {
  addSession: (session: BreathSession) => void;
  setSessions: (sessions: BreathSession[]) => void;
}

// stores/subscriptionStore.ts
interface SubscriptionState {
  isPro: boolean;
  expiresAt: string | null;
}

interface SubscriptionActions {
  setProStatus: (isPro: boolean, expiresAt?: string) => void;
}
```

### 7.9 汎用型定義

```typescript
// types/common.ts

/** 非同期処理の結果型（例外ではなく値で成否を返す） */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Hook 内の非同期状態 */
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}
```

### 7.10 ファイル命名規約

| 対象 | 規約 | 例 |
|------|------|-----|
| Screen（app/） | kebab-case（Expo Router準拠） | `app/checkin/index.tsx` |
| Component | PascalCase | `BreathingCircle.tsx` |
| Hook | camelCase（use prefix） | `useCheckinForm.ts` |
| Feature service | camelCase + Service suffix | `checkinService.ts` |
| Feature 純粋関数 | camelCase + 役割suffix | `streakCalculator.ts` |
| lib クライアント | camelCase + Client suffix | `asyncStorageClient.ts` |
| lib ストレージ | camelCase + Storage suffix | `checkinStorage.ts` |
| Store | camelCase + Store suffix | `checkinStore.ts` |
| 型定義 | camelCase | `models.ts`, `checkin.ts` |
| 定数 | camelCase | `theme.ts`, `breathing.ts` |
| ユーティリティ | camelCase | `date.ts`, `id.ts` |

---

## 8. Safari Content Blocker 連携方針

### 8.1 技術概要

iOS の Content Blocker Extension は、Safari のリクエストをルールベースでブロックするネイティブ拡張機能。

### 8.2 仕組み

| 項目 | 内容 |
|------|------|
| 形式 | App Extension（NSExtension, type: `com.apple.Safari.content-blocker`） |
| ルール | `blockerList.json`（JSON配列形式） |
| 最大ルール数 | 約50,000ルール |
| 対象 | **Safari のみ**（Chrome, Firefox等は非対応） |
| 更新方法 | `SFContentBlockerManager.reloadContentBlocker()` |

### 8.3 ルール形式

```json
[
  {
    "trigger": {
      "url-filter": ".*\\.pornhub\\.com"
    },
    "action": {
      "type": "block"
    }
  },
  {
    "trigger": {
      "url-filter": ".*\\.xvideos\\.com"
    },
    "action": {
      "type": "block"
    }
  }
]
```

### 8.4 Expo + Content Blocker の技術的制約

| 制約 | 詳細 | 対処 |
|------|------|------|
| Expo Goでは動作しない | App Extension はネイティブビルド必須 | `eas build` で Development Build を使用 |
| Config Plugin が必要 | Expo の管理外ターゲット | カスタム Config Plugin を作成してXcode Extension ターゲットを追加 |
| React Native との通信 | App Extension はサンドボックスが別 | App Groups（`UserDefaults(suiteName:)`）でON/OFF状態を共有 |
| ルール更新 | アプリ本体からExtensionのルールを更新 | Native Module を Bridge してリロードを呼ぶ |
| 審査 | Apple は Content Blocker を許可している | 適切な説明文をReview Notesに記載 |

### 8.5 MVP実装方針

1. **Expo Config Plugin** を自作し、`ios/` 以下に Extension ターゲットを自動生成
2. **blockerList.json** は初期版で約500ドメインをバンドル（主要アダルトサイト）
3. **Native Module**（Swift）を作成し、以下をReact Nativeから呼び出し可能にする
   - `enableBlocker()` / `disableBlocker()`
   - `getBlockerStatus(): boolean`
   - `reloadBlockerRules()`
4. **App Groups** で本体アプリ ↔ Extension 間のON/OFF状態を共有
5. ユーザーには「iOS設定 > Safari > 拡張機能」で有効化するよう案内UI（P-001）

### 8.6 正直な制約事項

- Safari以外（Chrome, アプリ内ブラウザ）はブロック不可
- VPN方式やDNSフィルタはApple審査でリスクが高く、MVPでは採用しない
- シークレットモードでも有効だが、拡張機能自体をユーザーが無効化可能
- 「完璧なブロック」ではなく「意図的なアクセスへのスピードバンプ」として位置づける

---

## 9. UIトーン＆ビジュアル指針

### 9.1 カラーパレット

| 用途 | カラー | Hex | 意図 |
|------|--------|-----|------|
| 背景（メイン） | ほぼ黒 | `#0A0A0F` | 男性的、高級感、没入 |
| 背景（カード） | ダークグレー | `#16161E` | コンテンツ領域 |
| テキスト（メイン） | オフホワイト | `#E8E8ED` | 目に優しい |
| テキスト（サブ） | グレー | `#6B6B7B` | 補助情報 |
| アクセント（プライマリ） | ブルー | `#4A90D9` | 信頼、冷静 |
| アクセント（成功） | グリーン | `#3DD68C` | 達成、成長 |
| アクセント（警告/SOS） | アンバー | `#F0A030` | 衝動ボタン（赤ではなく） |
| アクセント（Pro） | ゴールド | `#C8A84E` | Premium感 |

**注意：赤は使わない。** 赤は「失敗」「危険」を想起させ、ネガティブな感情を増幅する。衝動時のSOSボタンはアンバー系で「安全な場所」のイメージ。

### 9.2 タイポグラフィ

| 用途 | フォント | サイズ | Weight |
|------|---------|--------|--------|
| 大見出し（連続日数など） | System (SF Pro) | 48-64pt | Bold |
| セクション見出し | System | 20pt | Semibold |
| 本文 | System | 16pt | Regular |
| サブテキスト | System | 14pt | Regular |
| ラベル | System | 12pt | Medium |

**注意：** カスタムフォントは導入しない（MVPでは System font で十分。日本語レンダリングの安定性優先）。

### 9.3 余白・レイアウト

| 要素 | 値 |
|------|-----|
| 画面左右パディング | 20px |
| カード内パディング | 16px |
| カード間マージン | 12px |
| セクション間マージン | 24px |
| カード角丸 | 12px |
| ボタン角丸 | 10px |
| ボタン高さ | 52px |

### 9.4 文言トーン指針

**DO（推奨）：**

| シーン | 文言例 |
|--------|--------|
| ストリーク達成 | 「14日。着実に進んでいる」 |
| チェックイン促し | 「今日の振り返りをしませんか」 |
| 失敗時 | 「大丈夫。ここから始めよう」 |
| 記事導入 | 「集中力と脳の関係を知る」 |
| 呼吸完了 | 「自制心と集中力が積み上がっています」 |

**DON'T（禁止）：**

| 禁止カテゴリ | 禁止例 |
|-------------|--------|
| 依存症ワード | 「依存」「中毒」「治療」「回復」「克服」 |
| 弱者表現 | 「あなたは一人じゃない」「助けを求めて」 |
| 宗教・精神性 | 「祈り」「マインドフルネス瞑想」（呼吸法はOK） |
| 説教 | 「ポルノは悪です」「やめるべきです」 |
| 罪悪感 | 「また見てしまいましたね」「失敗しました」 |
| 過度な応援 | 「絶対できる！」「頑張って！」 |

### 9.5 全体のムードボード

```
キーワード：
静か / 知的 / ダーク / ミニマル / 投資家向けアプリ感 / Bloomberg的 / 男性的

参考UI感：
- Apple Fitness のミニマルなカード
- Oura Ring の静かなダッシュボード
- Day One のジャーナルUI
- Arc Browser のダーク設計

避けるUI感：
- ゲーミフィケーション過剰（バッジだらけ）
- カラフルすぎる配色
- イラスト多用
- ソーシャル機能強調
```

---

## 10. 深呼吸インターベンション詳細仕様

### 10.1 基本パラメータ

| パラメータ | 値 |
|-----------|-----|
| 1サイクル | 吸う6秒 ＋ 吐く6秒 = 12秒 |
| 1セット | 3サイクル = 36秒 |
| 最大セット数 | 制限なし（MVPでは） |
| 起動方法 | SOSボタンワンタップ |
| 説明画面 | **なし**（即起動） |

### 10.2 状態遷移図

```
[idle]
  │
  │ SOSボタンタップ
  ▼
[inhale] ──── 6秒経過 ────→ [exhale]
  ▲                            │
  │                        6秒経過
  │                            ▼
  │                     cycleCount++
  │                            │
  │              ┌─── count < 3 ───┐
  │              ▼                  ▼
  │          [inhale]          [cycleComplete]
  │          (次サイクル)           │
  │                                ▼
  │                          [askResult]
  │                         「落ち着いた？」
  │                            │
  │              ┌──── はい ────┤──── いいえ ────┐
  │              ▼                              ▼
  │          [success]                      [retry]
  │          成功画面                     cycleCount = 0
  │              │                              │
  │              ▼                              ▼
  │          [idle]                         [inhale]
  │         (ホームへ)                     (再開)
  └─────────────────────────────────────────────┘
```

### 10.3 アニメーション仕様

```typescript
// hooks/useBreathingEngine.ts

import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';

// 円のスケール値
const MIN_SCALE = 0.4;
const MAX_SCALE = 1.0;
const PHASE_DURATION = 6000; // 6秒

// Easing: 自然な呼吸感
const INHALE_EASING = Easing.bezier(0.4, 0.0, 0.2, 1); // ease-out寄り
const EXHALE_EASING = Easing.bezier(0.4, 0.0, 0.2, 1);

// 状態型
type BreathPhase = 
  | 'idle' 
  | 'inhale' 
  | 'exhale' 
  | 'cycleComplete' 
  | 'askResult' 
  | 'success' 
  | 'retry';

// スケールアニメーション
// 吸う: MIN_SCALE → MAX_SCALE (6秒)
// 吐く: MAX_SCALE → MIN_SCALE (6秒)
```

### 10.4 バックグラウンド中断対応

| シナリオ | 対応 |
|---------|------|
| アプリがバックグラウンドへ | タイマー一時停止 |
| フォアグラウンド復帰 | **現在のサイクルを最初からやり直す**（途中再開しない） |
| 通知やコールで中断 | 同上 |
| 長時間バックグラウンド（5分以上） | idle に戻し、SOSボタンから再起動 |

**理由：** 呼吸のリズムが途切れた場合、途中から再開するよりサイクルの最初からやり直す方が没入体験を維持できる。

### 10.5 UI詳細

**円のスタイル：**
- 色: `rgba(74, 144, 217, 0.3)`（アクセントブルー30%透過）
- ボーダー: `2px solid rgba(74, 144, 217, 0.6)`
- サイズ: 画面幅の 50%（最大スケール時）
- 背景にぼんやりとした光の拡散効果（`shadowRadius`）

**テキスト切り替え：**
- フェーズ切り替え時にテキストを0.3秒フェードで切り替え
- フォント: 16pt, Regular, `#E8E8ED`

**サイクルインジケータ：**
- 3つの小さな円ドット
- 完了: `#4A90D9`（塗り）
- 未完了: `rgba(255,255,255,0.2)`（枠線のみ）
- サイズ: 8px
- 間隔: 12px

**閉じるボタン：**
- 左上 `(20, safeAreaTop + 12)`
- `×` アイコン、24px、`rgba(255,255,255,0.4)`
- タップ領域: 44×44px（A11y）

---

## 11. AdMob 広告設計方針

### 11.1 広告タイプ

| 広告タイプ | 使用箇所 | SDK |
|-----------|---------|-----|
| バナー広告 | ダッシュボード下部、チェックイン下部 | `react-native-google-mobile-ads` |
| ネイティブ広告 | 記事一覧のフィード内 | `react-native-google-mobile-ads` |

### 11.2 広告非表示ゾーン（絶対）

以下の画面では、いかなる場合でも広告を表示しない。

| 画面 | 理由 |
|------|------|
| B-001 深呼吸ガイド | 衝動介入中。没入を阻害 |
| B-002 質問画面 | 感情的に脆弱な瞬間 |
| B-003 成功メッセージ | 承認体験を汚さない |
| R-001 リカバリー | 失敗直後。広告は逆効果 |
| R-002 ジャーナル | 内省の場 |
| S-002 オンボーディング | 初体験の質 |

### 11.3 Pro による広告非表示

```typescript
// hooks/useAdMob.ts
const useAdMob = () => {
  const { isPro } = useUserStore();
  
  const shouldShowAd = (screenId: string): boolean => {
    if (isPro) return false;
    const noAdScreens = ['B-001', 'B-002', 'B-003', 'R-001', 'R-002', 'S-002'];
    return !noAdScreens.includes(screenId);
  };
  
  return { shouldShowAd };
};
```

### 11.4 広告頻度制限

- バナー広告: 画面あたり1つまで
- ネイティブ広告: 記事3枚ごとに1つ
- インタースティシャル広告: **使用しない**（UXを著しく損なうため）
- リワード広告: **使用しない**（コンセプトに合わない）

### 11.5 AdMob 実装メモ

```bash
# インストール
npx expo install react-native-google-mobile-ads
```

`app.json` に AdMob App ID を設定:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "iosAppId": "ca-app-pub-xxxxxxxx~yyyyyyyyyy"
        }
      ]
    ]
  }
}
```

**ATT（App Tracking Transparency）対応：**
- iOS 14.5+ で必須
- `expo-tracking-transparency` を使用し、初回起動時にトラッキング許可を要求
- 拒否されてもアプリは正常動作（広告のパーソナライズ精度が下がるだけ）

---

## 付録A: MVP開発フェーズ計画（参考）

| フェーズ | 期間目安 | スコープ |
|---------|---------|---------|
| Phase 1 | 2週間 | オンボーディング、ダッシュボード、チェックイン、深呼吸 |
| Phase 2 | 1週間 | 記事コンテンツ、リカバリー導線、通知 |
| Phase 3 | 1週間 | AdMob統合、RevenueCat統合、Pro機能ゲート |
| Phase 4 | 2週間 | Safari Content Blocker Extension |
| Phase 5 | 1週間 | QA、TestFlight、App Store 審査準備 |

**合計目安：** 約7週間（1名フルタイム想定）

---

## 付録B: App Store 審査対応メモ

| 項目 | 方針 |
|------|------|
| カテゴリ | Health & Fitness または Lifestyle |
| 年齢レーティング | 17+（テーマ上必要） |
| プライバシー | データはローカル保存。ヘルスデータの収集なしとして申告 |
| Content Blocker | Review Notes に「Safari Content Blocker Extension として動作」と明記 |
| 課金 | Auto-Renewable Subscription として申請 |
| 広告 | AdMob使用を Privacy Nutrition Labels に記載 |
| 医療表現 | 「治療」「改善」等の医療断定は一切しない。「〜といった研究があります」形式 |

---

## 付録C: 型定義（参考）

```typescript
// types/index.ts

export interface User {
  id: string;
  nickname: string;
  goalDays: number;
  streakStartDate: string | null;
  isPro: boolean;
  notifyTime: string;
  notifyEnabled: boolean;
  createdAt: string;
}

export interface DailyCheckin {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  watchedPorn: boolean;
  masturbated: boolean;
  urgeLevel: 0 | 1 | 2 | 3 | 4;
  stressLevel: 0 | 1 | 2 | 3 | 4;
  qualityOfLife: 1 | 2 | 3 | 4 | 5;
  memo: string;
  createdAt: string;
}

export interface BreathSession {
  id: string;
  userId: string;
  totalCycles: number;
  urgeResolved: boolean;
  createdAt: string;
}

export interface Recovery {
  id: string;
  userId: string;
  checkinId: string;
  trigger: 'stress' | 'boredom' | 'loneliness' | 'fatigue' | 'sns' | 'other';
  journal?: string; // Pro only
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  body: string;
  category: 'neuroscience' | 'habit' | 'focus' | 'career' | 'research';
  readMinutes: number;
  isFree: boolean;
  publishedAt: string;
}

export type BreathPhase = 
  | 'idle' 
  | 'inhale' 
  | 'exhale' 
  | 'cycleComplete' 
  | 'askResult' 
  | 'success' 
  | 'retry';

export interface WeeklyStats {
  successRate: number;
  avgUrge: number;
  avgQuality: number;
  totalCheckins: number;
}
```

---

> **Document Version:** 1.0
> **Prepared for:** MVP Development
> **Product Name:** Rewire（リワイア）
