#!/bin/bash
# ============================================================
#  OpenClaw + OpenGoat セットアップスクリプト
#  対象: Mac mini M4 / Rewire プロジェクト
#
#  使い方: Mac miniのターミナルで実行
#  chmod +x scripts/setup-openclaw.sh && ./scripts/setup-openclaw.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  OpenClaw + OpenGoat セットアップ                ║"
echo "║  Rewire 階層型AIエージェント組織構築             ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── ステップ1: Node.js バージョン確認 ──
echo -e "${YELLOW}[1/5] Node.js バージョン確認...${NC}"
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_VERSION" ]; then
  echo -e "${RED}❌ Node.js が見つかりません。インストールしてください:${NC}"
  echo "   brew install node@22"
  exit 1
fi

if [ "$NODE_VERSION" -lt 22 ]; then
  echo -e "${RED}❌ Node.js v22以上が必要です（現在: v${NODE_VERSION}）${NC}"
  echo "   brew install node@22"
  exit 1
fi
echo -e "${GREEN}✅ Node.js v$(node -v) OK${NC}"

# ── ステップ2: Gemini APIキー確認 ──
echo ""
echo -e "${YELLOW}[2/5] Gemini APIキー確認...${NC}"
if [ -z "$GOOGLE_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  GOOGLE_API_KEY が環境変数に設定されていません${NC}"
  echo ""
  read -p "Gemini APIキーを入力してください: " GEMINI_KEY
  if [ -z "$GEMINI_KEY" ]; then
    echo -e "${RED}❌ APIキーが入力されませんでした${NC}"
    exit 1
  fi

  # .zshrc に追加
  echo "" >> ~/.zshrc
  echo "# OpenClaw - Gemini API Key" >> ~/.zshrc
  echo "export GOOGLE_API_KEY=\"${GEMINI_KEY}\"" >> ~/.zshrc
  export GOOGLE_API_KEY="$GEMINI_KEY"
  echo -e "${GREEN}✅ APIキーを ~/.zshrc に保存しました${NC}"
else
  echo -e "${GREEN}✅ GOOGLE_API_KEY が設定済み${NC}"
fi

# ── ステップ3: OpenClaw + OpenGoat インストール ──
echo ""
echo -e "${YELLOW}[3/5] OpenClaw + OpenGoat をインストール...${NC}"

if command -v openclaw &> /dev/null; then
  echo -e "${GREEN}✅ OpenClaw $(openclaw --version 2>/dev/null || echo '済') インストール済み${NC}"
else
  echo "   npm i -g openclaw ..."
  npm i -g openclaw
  echo -e "${GREEN}✅ OpenClaw インストール完了${NC}"
fi

if command -v opengoat &> /dev/null; then
  echo -e "${GREEN}✅ OpenGoat インストール済み${NC}"
else
  echo "   npm i -g opengoat ..."
  npm i -g opengoat
  echo -e "${GREEN}✅ OpenGoat インストール完了${NC}"
fi

# ── ステップ4: OpenClaw オンボーディング ──
echo ""
echo -e "${YELLOW}[4/5] OpenClaw オンボーディング...${NC}"
if [ -f "$HOME/.openclaw/openclaw.json" ]; then
  echo -e "${GREEN}✅ OpenClaw 設定ファイルが既に存在します${NC}"
  echo "   再セットアップする場合: openclaw onboard"
else
  echo "   対話式ウィザードを起動します..."
  echo "   → LLMプロバイダー: Google Gemini を選択"
  echo "   → APIキー: 自動で検出されるか、貼り付け"
  echo ""
  openclaw onboard
fi

# ── ステップ5: デーモン設定 ──
echo ""
echo -e "${YELLOW}[5/5] デーモン設定（Mac起動時に自動開始）...${NC}"
read -p "OpenClawをデーモンとして設定しますか？ (y/n): " INSTALL_DAEMON
if [ "$INSTALL_DAEMON" = "y" ] || [ "$INSTALL_DAEMON" = "Y" ]; then
  openclaw onboard --install-daemon
  echo -e "${GREEN}✅ デーモン設定完了（Mac再起動後も自動起動）${NC}"
else
  echo "   スキップ（手動起動: openclaw start）"
fi

# ── 完了 ──
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ セットアップ完了！                           ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "次のステップ:"
echo "  1. エージェント組織を構築:"
echo "     ./scripts/setup-agents.sh"
echo ""
echo "  2. OpenGoat ダッシュボードを開く:"
echo "     opengoat start"
echo "     → http://127.0.0.1:19123"
echo ""
