#!/usr/bin/env node
/**
 * LINE 作業報告スクリプト（複数プロジェクト対応）
 * 10分ごとにMac miniの全プロジェクトの開発状況をLINEに報告する
 *
 * 必要な環境変数 (~/.config/rewire/.env.line):
 *   LINE_CHANNEL_ACCESS_TOKEN - LINE Messaging APIのチャネルアクセストークン
 *   LINE_USER_ID              - 報告先のLINEユーザーID
 *   PROJECTS                  - 監視するプロジェクトのパス（カンマ区切り）
 *                               例: /Users/you/projects/rewire,/Users/you/projects/other-app
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve, basename } from 'path';
import { homedir } from 'os';

// ── ~/.config/rewire/.env.line から環境変数を読み込み ──
function loadEnv() {
  const envPath = resolve(homedir(), '.config', 'rewire', '.env.line');
  if (!existsSync(envPath)) {
    console.error(`❌ ${envPath} が見つかりません。\n以下を実行してください:\n  mkdir -p ~/.config/rewire\n  cp .env.line.example ~/.config/rewire/.env.line`);
    process.exit(1);
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
  }
}

loadEnv();

const { LINE_CHANNEL_ACCESS_TOKEN, LINE_USER_ID, PROJECTS } = process.env;

if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_USER_ID) {
  console.error('❌ LINE_CHANNEL_ACCESS_TOKEN と LINE_USER_ID を ~/.config/rewire/.env.line に設定してください');
  process.exit(1);
}

// プロジェクト一覧をパース
const projectDirs = (PROJECTS || '')
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean);

if (projectDirs.length === 0) {
  console.error('❌ PROJECTS が未設定です。監視するプロジェクトのパスをカンマ区切りで設定してください');
  process.exit(1);
}

// ── ユーティリティ ──
function run(cmd, cwd) {
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8', timeout: 10000 }).trim();
  } catch {
    return null;
  }
}

function truncate(str, max = 200) {
  if (!str) return '(なし)';
  return str.length > max ? str.slice(0, max) + '...' : str;
}

// ── 1プロジェクト分の情報収集 ──
function collectProjectInfo(dir) {
  const name = basename(dir);

  // Gitリポジトリか確認
  if (!existsSync(resolve(dir, '.git'))) {
    return { name, error: 'Gitリポジトリではありません' };
  }

  const branch = run('git branch --show-current', dir) || '不明';
  const lastCommit = run('git log -1 --format="%h %s (%ar)"', dir) || 'コミットなし';
  const recentCommits = run('git log --oneline -5 --since="1 hour ago"', dir);
  const commitCount1h = recentCommits ? recentCommits.split('\n').filter(Boolean).length : 0;
  const status = run('git status --short', dir);
  const changedFiles = status ? status.split('\n').filter(Boolean).length : 0;

  return { name, branch, lastCommit, commitCount1h, changedFiles };
}

// ── プロセス状況（マシン全体で1回） ──
function collectProcessInfo() {
  const claudeProc = run('pgrep -fl "claude" 2>/dev/null | head -3', '/tmp');
  const nodeProc = run('pgrep -fl "expo\\|next\\|node.*dev" 2>/dev/null | head -3', '/tmp');

  return {
    claudeRunning: !!claudeProc,
    devServerRunning: !!nodeProc,
  };
}

// ── メッセージ構築 ──
function buildReport() {
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const proc = collectProcessInfo();

  let msg = `📊 開発レポート\n⏰ ${now}\n`;
  msg += `🤖 Claude: ${proc.claudeRunning ? '✅' : '⏸️'} | 🖥️ Dev: ${proc.devServerRunning ? '✅' : '⏸️'}\n`;
  msg += `━━━━━━━━━━━━━━━\n`;

  for (const dir of projectDirs) {
    const info = collectProjectInfo(dir);

    if (info.error) {
      msg += `\n📁 ${info.name}: ⚠️ ${info.error}\n`;
      continue;
    }

    msg += `\n📁 ${info.name} (${info.branch})\n`;
    msg += `  📝 ${info.lastCommit}\n`;

    // 変化がある場合のみ詳細表示
    if (info.commitCount1h > 0 || info.changedFiles > 0) {
      msg += `  ⚡ 1h: ${info.commitCount1h}コミット`;
      if (info.changedFiles > 0) msg += ` | 📁 未保存: ${info.changedFiles}件`;
      msg += '\n';
    } else {
      msg += `  💤 直近1時間の変更なし\n`;
    }
  }

  return msg;
}

// ── LINE送信 ──
async function sendToLine(message) {
  const url = 'https://api.line.me/v2/bot/message/push';
  const body = JSON.stringify({
    to: LINE_USER_ID,
    messages: [{ type: 'text', text: message }],
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ LINE送信失敗 (${res.status}): ${err}`);
    return false;
  }
  console.log('✅ LINE送信成功');
  return true;
}

// ── メイン ──
async function main() {
  const report = buildReport();
  console.log(report);
  await sendToLine(report);
}

main().catch(console.error);
