#!/bin/bash
# ============================================================
#  プロジェクト用 エージェント組織構築スクリプト（全プロジェクト共通）
#
#  前提: setup-openclaw.sh を先に実行済み
#  使い方: ./scripts/setup-agents.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Rewire エージェント組織構築                     ║"
echo "║                                                  ║"
echo "║  Goat (CEO)                                      ║"
echo "║   └── CTO                                        ║"
echo "║        ├── iOS-Engineer (コーディング)            ║"
echo "║        ├── Test-Engineer (テスト)                 ║"
echo "║        └── Researcher (調査)                      ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── エージェント作成 ──
echo -e "${YELLOW}[1/3] エージェントを作成...${NC}"

echo -e "${CYAN}  → CTO (マネージャー)${NC}"
opengoat agent create "CTO" \
  --manager \
  --reports-to goat

echo -e "${CYAN}  → iOS-Engineer (実装担当)${NC}"
opengoat agent create "iOS-Engineer" \
  --individual \
  --reports-to cto \
  --skill coding

echo -e "${CYAN}  → Test-Engineer (テスト担当)${NC}"
opengoat agent create "Test-Engineer" \
  --individual \
  --reports-to cto \
  --skill coding

echo -e "${CYAN}  → Researcher (LTV・CVR改善リサーチ担当)${NC}"
opengoat agent create "Researcher" \
  --individual \
  --reports-to cto \
  --description "LTV・コンバージョン率改善のためのリサーチ専門エージェント。競合分析、ペイウォール最適化、チャーン対策、価格戦略、A/Bテスト設計を担当。提案は必ずデータ・根拠付きで行う。ダークパターンは禁止。SOUL.mdセクション7を厳守。"

echo -e "${GREEN}✅ エージェント作成完了${NC}"

# ── ワークディレクトリ設定 ──
echo ""
echo -e "${YELLOW}[2/3] Rewire プロジェクトパスを設定...${NC}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "   プロジェクトパス: $PROJECT_DIR"
opengoat config set workdir "$PROJECT_DIR"

echo -e "${GREEN}✅ ワークディレクトリ設定完了${NC}"

# ── サンプルタスク作成 ──
echo ""
echo -e "${YELLOW}[3/3] サンプルタスクを作成...${NC}"

echo -e "${CYAN}  → タスク: Pre-Paywall画面のビジュアル調整${NC}"
opengoat task create \
  --title "Pre-Paywall Benefits画面のビジュアル調整" \
  --owner cto \
  --assign ios-engineer

echo -e "${CYAN}  → タスク: テスト追加${NC}"
opengoat task create \
  --title "PrePaywallBenefitsのスナップショットテスト追加" \
  --owner cto \
  --assign test-engineer

echo -e "${CYAN}  → タスク: LTV・CVR改善リサーチ${NC}"
opengoat task create \
  --title "競合アプリのペイウォール設計・価格戦略・CVR改善手法を調査し、改善提案を作成" \
  --description "同ジャンルの成功アプリ（QUITTR, Reboot, Brainbuddy等）のペイウォール設計、価格アンカリング、社会的証明、オンボーディングフローを調査。LTV・CVR改善の具体的な施策を、根拠データ付きで提案すること。A/Bテスト設計案も含めること。" \
  --owner cto \
  --assign researcher

echo -e "${GREEN}✅ サンプルタスク作成完了${NC}"

# ── OpenGoat 起動 ──
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ 組織構築完了！                               ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "ダッシュボードを開きます..."
echo "  → http://127.0.0.1:19123"
echo ""

opengoat start
