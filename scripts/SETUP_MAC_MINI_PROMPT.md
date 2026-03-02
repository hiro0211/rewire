# Mac mini セットアップ — Claude Code に渡すプロンプト

> このファイルをMac miniのClaude Codeにコピペして実行してください。
> 環境変数の値（トークン、ID）の入力はhiroが手動で行います。

---

## プロンプト（ここから下をコピペ）

```
Mac mini に以下の開発インフラをセットアップしてください。
手順ごとに進捗を報告し、APIキーやトークンの入力が必要な箇所では必ず私に確認してください。

## 前提条件の確認

1. Node.js v22以上がインストールされているか確認
   - `node -v` で確認
   - v22未満なら `brew install node@22` でアップデート
2. Claude Code CLI がインストールされているか確認
   - `claude --version` で確認
   - 未インストールなら `npm i -g @anthropic-ai/claude-code` でインストール

## ステップ1: Discord Bot のセットアップ

### 1-1. 依存パッケージのインストール

```bash
cd /path/to/rewire  # ← Rewireプロジェクトのパスに置き換え
npm install discord.js
```

### 1-2. 環境変数ファイルの作成

```bash
mkdir -p ~/.config/rewire
```

以下の3つの値を私に聞いてください（私が手動で入力します）:
- DISCORD_BOT_TOKEN
- DISCORD_CHANNEL_ID
- PROJECTS（カンマ区切りのプロジェクトパス）

ファイル: `~/.config/rewire/.env.discord`

```
DISCORD_BOT_TOKEN=（私が入力）
DISCORD_CHANNEL_ID=（私が入力）
PROJECTS=/Users/arimurahiroaki/projects/rewire
```

### 1-3. 動作テスト

```bash
node scripts/discord-bot.mjs
```

Discordチャンネルに「🟢 開発Botが起動しました」が表示されれば成功。
`/status` と `/help` コマンドをDiscordから送信してテスト。

### 1-4. launchd で自動起動設定

以下のplistを作成して登録:

```bash
cat > ~/Library/LaunchAgents/com.rewire.discord-bot.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.rewire.discord-bot</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/path/to/rewire/scripts/discord-bot.mjs</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/discord-bot.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/discord-bot-error.log</string>
    <key>WorkingDirectory</key>
    <string>/path/to/rewire</string>
</dict>
</plist>
EOF
```

注意: `/path/to/rewire` と `/usr/local/bin/node` は実際のパスに置き換えること。
`which node` でnodeのパスを確認。

```bash
launchctl load ~/Library/LaunchAgents/com.rewire.discord-bot.plist
```

## ステップ2: OpenClaw + OpenGoat のセットアップ

### 2-1. インストール

```bash
npm i -g openclaw opengoat
```

### 2-2. OpenClaw の初回セットアップ

```bash
openclaw onboard
```

ウィザードで聞かれること:
1. **LLMプロバイダー** → 「Anthropic Claude」を選択
2. **APIキー** → 私に確認（私が手動入力）
3. **デフォルトモデル** → Claude Sonnet 4 を選択

**重要**: APIキーの入力は必ず私が行います。

デーモンとして常時起動:
```bash
openclaw onboard --install-daemon
```

### 2-3. OpenGoat エージェント組織の構築

```bash
# 組織構築スクリプトを実行
bash scripts/setup-agents.sh
```

これにより以下の階層が構築される:
```
Goat (CEO)
  └── CTO (マネージャー)
        ├── iOS-Engineer (コーディング)
        ├── Test-Engineer (テスト)
        └── Researcher (LTV・CVR改善リサーチ)
```

ダッシュボード: http://127.0.0.1:19123

## ステップ3: CLAUDE.md の確認

プロジェクトルートに `CLAUDE.md` が存在することを確認:

```bash
ls -la CLAUDE.md
```

このファイルはClaude Codeが自動読み込みする開発原則ファイル。
内容を `cat CLAUDE.md` で確認し、正しく配置されていることを報告してください。

## ステップ4: 全体の動作確認

1. Discord Botが起動しているか: Discordで `/status` を送信
2. Claude Code CLIが動作するか: `claude --version`
3. Discordから Claude Code を呼び出せるか: Discordで `/claude CLAUDE.mdの内容を要約して` を送信
4. OpenGoatダッシュボードが表示されるか: http://127.0.0.1:19123

全て完了したら結果を報告してください。
```
