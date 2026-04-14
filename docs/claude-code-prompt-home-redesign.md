# Claude Code 投入用プロンプト — ホーム画面リデザイン

> このファイルは Claude Code にそのままコピペするためのプロンプトです。
> `CLAUDE.md` の原則（TDD / Plan Mode / SRP / 小さなPR）を遵守して実装します。

---

## プロンプト本文（ここから下をコピーして Claude Code に貼り付け）

Rewire（React Native / Expo / TypeScript）のホーム画面を、現状の世界観（青く光るオーブ・星空背景・シアン基調）を保ったまま、QUITTR 由来のコンポーネント構造でリデザインする作業を開始します。

**重要: まず Plan Mode に入り、コードを1行も書かずに設計書を提出してください。私が承認するまで実装は禁止です。`CLAUDE.md` の §3-1（計画→承認→TDD）を厳守。**

---

### 1. ゴール

ホーム画面を以下の新構成に刷新する。世界観は残し、構造と配色トークンのみ近代化する。

```
[status bar]
Rewireロゴ                         🌙 Day 0 チップ（任意）

        ●  青いオーブ（残す）
        Dawn · Day 0                成長ステージ表示を追加

┌─ SegmentedStreakCard（3分割） ──────────┐
│ 🔄 リセット │ ⏱ 記録（主役/シアン） │ 🎯 目標 │
│    0       │     0 分              │  30日   │
└──────────────────────────────────────────┘

─── Brain Rewiring ───────────── 0% ───    プログレスバー

○ リラックス  ○ チェックイン
○ 記録        ○ 学ぶ                     2x2 の QuickActionGrid

┌─ Ambient Sound Player ▶ ────────────┐
└──────────────────────────────────────┘

Begin Learning
● ポルノと脳科学     Start →
🔒 よくある誤解
🔒 心理と環境要因

[ホーム  履歴  学ぶ  プロフィール]
```

**赤い「ポルノを見たくなったら」Panic Button は撤去**。SOSは4円のうちの1枠（もしくは「学ぶ」と入れ替え）に統合する。どちらの構成にするかは Plan 段階で私に確認すること。

---

### 2. 守るべき設計原則（CLAUDE.md からの抜粋・要約）

- **TDD 厳守**: Red → Green → Refactor。失敗テストなしにプロダクションコード禁止。
- **SRP**: 1ファイル=1責任、150行を超えたら分割。コンポーネントにビジネスロジックを書かない。
  - `components/` → 表示のみ
  - `lib/` → 純粋関数（計算・変換）
  - `hooks/` → 状態・副作用
  - `constants/` → 定数
- **TypeScript strict, `any` 禁止**。
- **1PR = 1機能**。下記のPR分割に従う。
- **最新の公式ドキュメントを必ず参照**（Expo / React Native / iOS HIG の最新版）。
- **API キー/本番変更/GUI操作は私が行う**。エージェントは絶対に実行しない。

---

### 3. 色トークン（最初にこれを作る）

`constants/colors.ts` を新規作成。既存の色定義があれば移行計画を提示すること。

```ts
export const colors = {
  // 背景
  bgBase: '#0A0D1F',
  bgSurface: 'rgba(255,255,255,0.04)',
  bgSurfaceElevated: 'rgba(255,255,255,0.06)',
  // アクセント（シアン基調・紫は補助）
  primary: '#5EC4E6',
  primaryDim: 'rgba(94,196,230,0.5)',
  primaryGlow: 'rgba(94,196,230,0.15)',
  secondary: '#B085F5',
  // 枠線
  borderSubtle: 'rgba(255,255,255,0.08)',
  borderActive: 'rgba(94,196,230,0.5)',
  // テキスト
  textPrimary: 'rgba(255,255,255,0.95)',
  textSecondary: 'rgba(255,255,255,0.70)',
  textTertiary: 'rgba(255,255,255,0.45)',
  // 機能色
  success: '#7BE0C6',
  warning: '#F5C06F',
  danger: '#FF7A70', // SOS限定。Panic Buttonは作らない
} as const;
```

---

### 4. PR 分割（この順で実装）

各PRは独立してmerge可能な単位。PR を切る前に私に進捗を報告すること。

#### PR1: 色トークン & Glass 基盤コンポーネント
- `constants/colors.ts`
- `components/ui/GlassCard.tsx`（半透明カード、`backdrop-filter` は Expo の `BlurView` で実装）
- `components/ui/GlassCircle.tsx`（円形ボタン、直径・アイコン・ラベルをprops化）
- テスト: スナップショット + タップハンドラ呼び出し

#### PR2: SegmentedStreakCard（3分割メトリクスチップ）
- `lib/streak/calculateStreak.ts`（純粋関数）
  - 入力: `{ startedAt: Date, now: Date }`
  - 出力: `{ days, hours, minutes, totalMinutes }`
  - **テスト先行**: 境界値（0秒/59秒/60秒/23h59m/24h0m）、異常系（startedAt > now）
- `lib/streak/formatDuration.ts`（純粋関数）
  - 出力: `"0分"`, `"5時間23分"`, `"Day 3 · 5時間23分"`
- `components/home/SegmentedStreakCard.tsx`
  - 3分割チップ、中央を `borderActive` + `primaryGlow` で強調
  - 左: `resetCount`、中央: `currentDuration`、右: `goalDays`
  - 150行以内。ロジックは `lib/` 側。

#### PR3: BrainRewiringBar
- `lib/progress/calculateProgress.ts`（純粋関数）
  - 入力: `{ currentDays, goalDays }` 出力: `{ percent: number }` (0〜100)
- `components/home/BrainRewiringBar.tsx`
  - 高さ8pt、シアン→パープルのグラデーション
  - `react-native-svg` または `expo-linear-gradient` を使用

#### PR4: QuickActionGrid（4円）
- `components/home/QuickActionCircle.tsx`（1個単位、`GlassCircle`をラップ）
- `components/home/QuickActionGrid.tsx`（2x2 レイアウト）
- アイコンは `lucide-react-native`、stroke 1.75、サイズ 26pt、色は `textPrimary`
- タップ時: haptic light impact（`expo-haptics`）
- ラベル構成は Plan 段階で私に確認（`リラックス / チェックイン / 記録 / 学ぶ` or `…/ SOS`）

#### PR5: 成長ステージロジック + オーブのステージ駆動
- `lib/stage/resolveStage.ts`（純粋関数）
  - 入力: `days: number`
  - 出力: `{ name: 'Spark'|'Dawn'|'Nebula'|'Galaxy'|'Cosmos', tier: 0..4 }`
  - テスト: Day 0, 6, 7, 29, 30, 89, 90, 364, 365 の境界
- `components/home/OrbStage.tsx`
  - 既存オーブのラッパー。tier に応じて色/グロー/粒子エフェクトを切り替え
  - tier 0: 小さく暗い青
  - tier 1: 現状サイズ、シアンの縁光
  - tier 2: 紫が加わる
  - tier 3: 公転する星粒子
  - tier 4: 銀河の渦

#### PR6: AmbientSoundPlayer
- `components/home/AmbientSoundPlayer.tsx`
- `hooks/useAmbientSound.ts`（`expo-av` の状態管理）
- 音源は仮でOK（ライセンス確認は私がやるのでプレースホルダー）
- 音源名候補: `Cosmic Wave` / `Deep Space` / `Starlight`

#### PR7: LearningTimeline
- `components/home/LearningTimeline.tsx`
- `lib/learning/resolveLockState.ts`（現在進行中・ロック判定の純粋関数）
- 縦線接続 + ロックアイコン、タップで該当レッスンへ遷移

#### PR8: Panic Button 撤去 & SOS 統合
- 既存の赤いCTAを削除
- SOS機能を QuickActionGrid 内の1枠に統合
- SOS画面は全画面モーダルで、呼吸・気晴らし・CBT問いかけ・ブロック起動などのツールキットに
- **既存ユーザーの動線を壊すため、このPRは最後に。削除前にfeature flagで切り替え可能にする案も検討**

---

### 5. Plan Mode で提出してほしいもの

以下を含む Plan ドキュメントを出力してください。コードは書かないこと。

1. **既存コードの調査結果**
   - 現在の `app/(tabs)/index.tsx`（または相当するホーム画面ファイル）のツリー
   - 既存の色・共通コンポーネント・テーマ定義の所在
   - 影響範囲のファイル一覧
2. **各PRの詳細設計**
   - 作成/変更するファイル一覧
   - 各ファイルの責任（1行で説明できる形）
   - 想定行数（150行超えそうなら分割案）
3. **テスト戦略**
   - 各純粋関数のテストケース（特に境界値）
   - コンポーネントのスナップショット対象
   - 既存テストへの影響
4. **既存仕様との差分**
   - 現状のストリーク計算ロジックと新ロジックの違い
   - データモデル（リセット履歴など）の変更有無
5. **未確定事項の確認リスト**
   - 4円の4つ目は `学ぶ` か `SOS` か
   - 成長ステージの名称 `Spark → Dawn → Nebula → Galaxy → Cosmos` で良いか
   - 上部の 🌙 Day チップを入れるか
   - Panic Button 撤去の段階的ロールアウト方針

---

### 6. 禁止事項

- Plan 承認前のコード変更
- `any` 型の使用
- `.env` やシークレットのコミット
- テストなしの実装
- 1ファイル150行を超えるコンポーネント
- Panic Buttonの復活（私が明示的に指示しない限り）
- 外部への本番デプロイ・ストア提出・API キー発行

---

### 7. 最初のアクション

`CLAUDE.md` を再読したうえで、Plan Mode に入り、上記 §5 の内容を提出してください。
不明点があれば推測せず必ず私に質問すること（CLAUDE.md §8）。

---

（プロンプトここまで）
