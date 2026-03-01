#!/usr/bin/env node
/**
 * LINE Webhook サーバー
 * スマホからLINEで指示を送ると、Mac miniで処理を実行する
 *
 * 必要な環境変数 (.env.line):
 *   LINE_CHANNEL_ACCESS_TOKEN  - LINE Messaging APIのチャネルアクセストークン
 *   LINE_CHANNEL_SECRET        - LINE Messaging APIのチャネルシークレット
 *   LINE_USER_ID               - 許可するLINEユーザーID
 *   PROJECT_DIR                - Rewireプロジェクトのパス
 *   WEBHOOK_PORT               - Webhookサーバーのポート (デフォルト: 3100)
 *
 * コマンド一覧 (LINEから送信):
 *   /status        - 現在の開発状況を即座に返信
 *   /git log       - 直近のgitログを表示
 *   /git branch    - 現在のブランチ情報
 *   /test          - テストを実行
 *   /build         - ビルドを実行
 *   /task [内容]   - TODO/タスクとして記録（将来的にLinearへ）
 *   /stop report   - 定期報告を停止
 *   /start report  - 定期報告を開始
 *   その他         - メモとしてファイルに保存
 */

import { createServer } from 'http';
import { createHmac } from 'crypto';
import { execSync, exec } from 'child_process';
import { readFileSync, appendFileSync, existsSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── ~/.config/rewire/.env.line から環境変数を読み込み ──
function loadEnv() {
  const envPath = resolve(homedir(), '.config', 'rewire', '.env.line');
  if (!existsSync(envPath)) {
    console.error(`❌ ${envPath} が見つかりません`);
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

const {
  LINE_CHANNEL_ACCESS_TOKEN,
  LINE_CHANNEL_SECRET,
  LINE_USER_ID,
  PROJECTS,
  WEBHOOK_PORT = '3100',
} = process.env;

// 複数プロジェクト対応：最初のプロジェクトをデフォルトの作業ディレクトリとする
const projectDirs = (PROJECTS || '').split(',').map((p) => p.trim()).filter(Boolean);
const projectDir = projectDirs[0] || resolve(__dirname, '..');
const port = parseInt(WEBHOOK_PORT, 10);

// ── 定期報告の制御 ──
let reportInterval = null;

function startPeriodicReport() {
  if (reportInterval) return;
  reportInterval = setInterval(async () => {
    try {
      execSync(`node ${resolve(__dirname, 'line-reporter.mjs')}`, { cwd: projectDir });
    } catch (e) {
      console.error('定期報告エラー:', e.message);
    }
  }, 10 * 60 * 1000); // 10分
  console.log('📊 定期報告: 開始 (10分間隔)');
}

function stopPeriodicReport() {
  if (reportInterval) {
    clearInterval(reportInterval);
    reportInterval = null;
    console.log('📊 定期報告: 停止');
  }
}

// ── ユーティリティ ──
function run(cmd) {
  try {
    return execSync(cmd, { cwd: projectDir, encoding: 'utf-8', timeout: 30000 }).trim();
  } catch (e) {
    return `エラー: ${e.message?.slice(0, 200)}`;
  }
}

function runAsync(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { cwd: projectDir, encoding: 'utf-8', timeout: 120000 }, (err, stdout, stderr) => {
      if (err) resolve(`エラー: ${(stderr || err.message).slice(0, 500)}`);
      else resolve(stdout.trim().slice(0, 1000));
    });
  });
}

// ── コマンドハンドラー ──
async function handleCommand(text) {
  const cmd = text.trim().toLowerCase();
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  // /status - 即座にステータス返信
  if (cmd === '/status') {
    const branch = run('git branch --show-current');
    const lastCommit = run('git log -1 --format="%h %s (%ar)"');
    const status = run('git status --short | head -10');
    const changedCount = status ? status.split('\n').filter(Boolean).length : 0;
    return `📊 現在のステータス (${now})\n\n🔀 ${branch}\n📝 ${lastCommit}\n📁 変更: ${changedCount}ファイル\n🤖 報告: ${reportInterval ? 'ON' : 'OFF'}`;
  }

  // /git log
  if (cmd === '/git log' || cmd === '/log') {
    const log = run('git log --oneline -10');
    return `📜 直近10コミット:\n\n${log}`;
  }

  // /git branch
  if (cmd === '/git branch' || cmd === '/branch') {
    const branches = run('git branch -a --sort=-committerdate | head -10');
    const current = run('git branch --show-current');
    return `🔀 ブランチ一覧:\n現在: ${current}\n\n${branches}`;
  }

  // /test
  if (cmd === '/test') {
    const reply = '🧪 テスト実行中... 完了したら報告します';
    // 非同期でテスト実行
    runAsync('npx jest --passWithNoTests --silent 2>&1 | tail -20').then(async (result) => {
      await sendReply(`🧪 テスト結果:\n\n${result.slice(0, 1500)}`);
    });
    return reply;
  }

  // /build
  if (cmd === '/build') {
    const reply = '🔨 ビルド実行中... 完了したら報告します';
    runAsync('npx expo export 2>&1 | tail -20').then(async (result) => {
      await sendReply(`🔨 ビルド結果:\n\n${result.slice(0, 1500)}`);
    });
    return reply;
  }

  // /task [内容] - タスク記録
  if (cmd.startsWith('/task ')) {
    const taskContent = text.slice(6).trim();
    const taskLine = `- [ ] ${taskContent} (${now})\n`;
    const taskFile = resolve(projectDir, 'TASKS.md');

    if (!existsSync(taskFile)) {
      appendFileSync(taskFile, '# LINEからのタスク\n\n');
    }
    appendFileSync(taskFile, taskLine);
    return `📋 タスク追加:\n「${taskContent}」\n\n※ 将来的にLinearに自動連携予定`;
  }

  // /stop report
  if (cmd === '/stop report' || cmd === '/report off') {
    stopPeriodicReport();
    return '⏸️ 定期報告を停止しました。\n/start report で再開できます';
  }

  // /start report
  if (cmd === '/start report' || cmd === '/report on') {
    startPeriodicReport();
    return '▶️ 定期報告を開始しました (10分間隔)';
  }

  // /help
  if (cmd === '/help') {
    return `📖 コマンド一覧:\n
/status - 開発状況を確認
/log - 直近のgitログ
/branch - ブランチ一覧
/test - テスト実行
/build - ビルド実行
/task [内容] - タスク追加
/start report - 定期報告開始
/stop report - 定期報告停止
/help - このヘルプ

📝 コマンド以外のメッセージはメモとして保存されます`;
  }

  // コマンド以外 → メモとして保存
  const memoFile = resolve(projectDir, 'MEMOS.md');
  if (!existsSync(memoFile)) {
    appendFileSync(memoFile, '# LINEからのメモ\n\n');
  }
  appendFileSync(memoFile, `### ${now}\n${text}\n\n`);
  return `📝 メモとして保存しました:\n「${text.slice(0, 100)}」`;
}

// ── LINE API ──
async function sendReply(message, replyToken = null) {
  if (replyToken) {
    // Reply API
    const res = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: 'text', text: message.slice(0, 5000) }],
      }),
    });
    if (!res.ok) console.error('Reply失敗:', await res.text());
  } else {
    // Push API (非同期結果返信用)
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: LINE_USER_ID,
        messages: [{ type: 'text', text: message.slice(0, 5000) }],
      }),
    });
    if (!res.ok) console.error('Push失敗:', await res.text());
  }
}

// ── 署名検証 ──
function verifySignature(body, signature) {
  if (!LINE_CHANNEL_SECRET) return true; // シークレット未設定時はスキップ
  const hash = createHmac('SHA256', LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64');
  return hash === signature;
}

// ── HTTPサーバー ──
const server = createServer(async (req, res) => {
  // ヘルスチェック
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', report: reportInterval ? 'on' : 'off' }));
    return;
  }

  // LINE Webhook
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      // 署名検証
      const signature = req.headers['x-line-signature'];
      if (!verifySignature(body, signature)) {
        console.warn('⚠️ 署名検証失敗');
        res.writeHead(403);
        res.end();
        return;
      }

      // 200を即座に返す（LINE要件）
      res.writeHead(200);
      res.end();

      try {
        const data = JSON.parse(body);
        for (const event of data.events || []) {
          // テキストメッセージのみ処理
          if (event.type !== 'message' || event.message.type !== 'text') continue;

          // ユーザーID制限（セキュリティ）
          if (LINE_USER_ID && event.source.userId !== LINE_USER_ID) {
            console.warn(`⚠️ 未許可ユーザー: ${event.source.userId}`);
            continue;
          }

          const text = event.message.text;
          console.log(`📨 受信: ${text}`);

          const response = await handleCommand(text);
          await sendReply(response, event.replyToken);
        }
      } catch (e) {
        console.error('Webhook処理エラー:', e);
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(port, () => {
  console.log(`\n🚀 LINE Webhook サーバー起動`);
  console.log(`   ポート: ${port}`);
  console.log(`   Webhook URL: http://localhost:${port}/webhook`);
  console.log(`   ヘルスチェック: http://localhost:${port}/health`);
  console.log(`\n💡 Tailscaleアドレスを LINE Developers Console の`);
  console.log(`   Webhook URL に設定してください:`);
  console.log(`   例: https://your-mac-mini.tail1234.ts.net:${port}/webhook\n`);

  // 起動時に定期報告も開始
  startPeriodicReport();

  // 起動通知
  sendReply('🟢 Rewire開発ボット起動しました！\n/help でコマンド一覧を確認できます');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 シャットダウン中...');
  stopPeriodicReport();
  server.close();
  process.exit(0);
});
