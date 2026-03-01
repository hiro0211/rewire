#!/usr/bin/env node
/**
 * Discord Bot - 開発報告 & 遠隔指示システム
 *
 * 機能:
 *   - 10分ごとに全プロジェクトの開発状況を #dev-report に自動投稿
 *   - スマホからコマンドを送って遠隔操作
 *
 * 必要な環境変数 (~/.config/rewire/.env.discord):
 *   DISCORD_BOT_TOKEN      - Bot Token
 *   DISCORD_CHANNEL_ID     - 報告先チャンネルID
 *   PROJECTS               - 監視するプロジェクトパス（カンマ区切り）
 *
 * コマンド一覧（Discordチャンネルで送信）:
 *   /status        - 現在の開発状況を即座に返信
 *   /log           - 直近のgitログを表示
 *   /branch        - 現在のブランチ情報
 *   /test          - テストを実行
 *   /build         - ビルドを実行
 *   /task [内容]   - タスクとして記録
 *   /stop          - 定期報告を停止
 *   /start         - 定期報告を開始
 *   /help          - コマンド一覧
 *   その他         - メモとして保存
 */

import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { execSync, exec } from 'child_process';
import { readFileSync, appendFileSync, existsSync } from 'fs';
import { resolve, basename } from 'path';
import { homedir } from 'os';

// ── 環境変数の読み込み ──
function loadEnv() {
  const envPath = resolve(homedir(), '.config', 'rewire', '.env.discord');
  if (!existsSync(envPath)) {
    console.error(`❌ ${envPath} が見つかりません。\n  mkdir -p ~/.config/rewire && cp .env.discord.example ~/.config/rewire/.env.discord`);
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

const { DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, PROJECTS } = process.env;

if (!DISCORD_BOT_TOKEN || !DISCORD_CHANNEL_ID) {
  console.error('❌ DISCORD_BOT_TOKEN と DISCORD_CHANNEL_ID を設定してください');
  process.exit(1);
}

const projectDirs = (PROJECTS || '').split(',').map((p) => p.trim()).filter(Boolean);
if (projectDirs.length === 0) {
  console.error('❌ PROJECTS が未設定です');
  process.exit(1);
}

const defaultProjectDir = projectDirs[0];

// ── Discord Client ──
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ── 定期報告 ──
let reportInterval = null;
const REPORT_INTERVAL_MS = 10 * 60 * 1000;

function startPeriodicReport() {
  if (reportInterval) return;
  reportInterval = setInterval(() => sendReport(), REPORT_INTERVAL_MS);
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
function run(cmd, cwd = defaultProjectDir) {
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8', timeout: 15000 }).trim();
  } catch {
    return null;
  }
}

function runAsync(cmd, cwd = defaultProjectDir) {
  return new Promise((res) => {
    exec(cmd, { cwd, encoding: 'utf-8', timeout: 120000 }, (err, stdout, stderr) => {
      if (err) res(`エラー: ${(stderr || err.message).slice(0, 800)}`);
      else res(stdout.trim().slice(0, 1500));
    });
  });
}

// ── プロジェクト情報収集 ──
function collectProjectInfo(dir) {
  const name = basename(dir);
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

function collectProcessInfo() {
  const claudeProc = run('pgrep -fl "claude" 2>/dev/null | head -3', '/tmp');
  const nodeProc = run('pgrep -fl "expo\\|next\\|node.*dev" 2>/dev/null | head -3', '/tmp');
  return { claudeRunning: !!claudeProc, devServerRunning: !!nodeProc };
}

// ── Embed形式のレポート ──
function buildReportEmbed() {
  const proc = collectProcessInfo();

  const embed = new EmbedBuilder()
    .setTitle('📊 開発レポート')
    .setColor(0x5865F2)
    .setTimestamp()
    .setFooter({ text: '10分間隔で自動報告' })
    .setDescription(
      `🤖 Claude: ${proc.claudeRunning ? '✅ 稼働中' : '⏸️ 停止'} | 🖥️ Dev: ${proc.devServerRunning ? '✅ 稼働中' : '⏸️ 停止'}`
    );

  for (const dir of projectDirs) {
    const info = collectProjectInfo(dir);
    if (info.error) {
      embed.addFields({ name: `📁 ${info.name}`, value: `⚠️ ${info.error}`, inline: false });
      continue;
    }
    let value = `🔀 \`${info.branch}\`\n📝 ${info.lastCommit}\n`;
    if (info.commitCount1h > 0 || info.changedFiles > 0) {
      value += `⚡ 1h: ${info.commitCount1h}コミット`;
      if (info.changedFiles > 0) value += ` | 📁 未保存: ${info.changedFiles}件`;
    } else {
      value += `💤 直近1時間の変更なし`;
    }
    embed.addFields({ name: `📁 ${info.name}`, value, inline: false });
  }

  return embed;
}

async function sendReport() {
  try {
    const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
    if (!channel) return console.error('❌ チャンネルが見つかりません');
    await channel.send({ embeds: [buildReportEmbed()] });
    console.log(`✅ レポート送信 (${new Date().toLocaleTimeString('ja-JP')})`);
  } catch (e) {
    console.error('❌ レポート送信失敗:', e.message);
  }
}

// ── コマンドハンドラー ──
async function handleCommand(message) {
  const text = message.content.trim();
  const cmd = text.toLowerCase();
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  if (cmd === '/status') {
    const embed = buildReportEmbed();
    embed.setTitle('📊 現在のステータス');
    embed.setFooter({ text: `🤖 報告: ${reportInterval ? 'ON' : 'OFF'}` });
    return message.reply({ embeds: [embed] });
  }

  if (cmd === '/log') {
    const log = run('git log --oneline -15') || 'ログなし';
    return message.reply(`\`\`\`\n📜 直近15コミット:\n${log}\n\`\`\``);
  }

  if (cmd === '/branch') {
    const current = run('git branch --show-current') || '不明';
    const branches = run('git branch -a --sort=-committerdate | head -10') || '';
    return message.reply(`\`\`\`\n🔀 現在: ${current}\n\n${branches}\n\`\`\``);
  }

  if (cmd === '/test') {
    await message.reply('🧪 テスト実行中... 完了したら報告します');
    const result = await runAsync('npx jest --passWithNoTests --silent 2>&1 | tail -30');
    const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
    return channel.send(`\`\`\`\n🧪 テスト結果:\n${result.slice(0, 1900)}\n\`\`\``);
  }

  if (cmd === '/build') {
    await message.reply('🔨 ビルド実行中... 完了したら報告します');
    const result = await runAsync('npx expo export 2>&1 | tail -30');
    const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
    return channel.send(`\`\`\`\n🔨 ビルド結果:\n${result.slice(0, 1900)}\n\`\`\``);
  }

  if (cmd.startsWith('/task ')) {
    const taskContent = text.slice(6).trim();
    const taskFile = resolve(defaultProjectDir, 'TASKS.md');
    if (!existsSync(taskFile)) appendFileSync(taskFile, '# タスク\n\n');
    appendFileSync(taskFile, `- [ ] ${taskContent} (${now})\n`);
    return message.reply(`📋 タスク追加: **${taskContent}**`);
  }

  if (cmd === '/stop') {
    stopPeriodicReport();
    return message.reply('⏸️ 定期報告を停止しました。`/start` で再開できます');
  }

  if (cmd === '/start') {
    startPeriodicReport();
    return message.reply('▶️ 定期報告を開始しました (10分間隔)');
  }

  if (cmd === '/help') {
    const embed = new EmbedBuilder()
      .setTitle('📖 コマンド一覧')
      .setColor(0x57F287)
      .addFields(
        { name: '`/status`', value: '開発状況を確認', inline: true },
        { name: '`/log`', value: '直近のgitログ', inline: true },
        { name: '`/branch`', value: 'ブランチ一覧', inline: true },
        { name: '`/test`', value: 'テスト実行', inline: true },
        { name: '`/build`', value: 'ビルド実行', inline: true },
        { name: '`/task [内容]`', value: 'タスク追加', inline: true },
        { name: '`/start`', value: '定期報告開始', inline: true },
        { name: '`/stop`', value: '定期報告停止', inline: true },
      )
      .setFooter({ text: 'コマンド以外のメッセージはメモとして保存されます' });
    return message.reply({ embeds: [embed] });
  }

  // コマンド以外 → メモ
  if (!text.startsWith('/')) {
    const memoFile = resolve(defaultProjectDir, 'MEMOS.md');
    if (!existsSync(memoFile)) appendFileSync(memoFile, '# メモ\n\n');
    appendFileSync(memoFile, `### ${now}\n${text}\n\n`);
    return message.reply(`📝 メモ保存: "${text.slice(0, 80)}"`);
  }
}

// ── Bot起動 ──
client.once('ready', async () => {
  console.log(`\n🚀 Discord Bot 起動: ${client.user.tag}`);
  console.log(`   チャンネル: ${DISCORD_CHANNEL_ID}`);
  console.log(`   プロジェクト: ${projectDirs.join(', ')}\n`);

  try {
    const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
    const embed = new EmbedBuilder()
      .setTitle('🟢 開発Botが起動しました')
      .setDescription('`/help` でコマンド一覧を確認できます')
      .setColor(0x57F287)
      .setTimestamp();
    await channel.send({ embeds: [embed] });
  } catch (e) {
    console.error('起動通知失敗:', e.message);
  }

  startPeriodicReport();
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channelId !== DISCORD_CHANNEL_ID) return;
  try {
    await handleCommand(message);
  } catch (e) {
    console.error('コマンド処理エラー:', e);
    message.reply(`❌ エラー: ${e.message?.slice(0, 200)}`).catch(() => {});
  }
});

process.on('SIGINT', () => {
  console.log('\n👋 シャットダウン中...');
  stopPeriodicReport();
  client.destroy();
  process.exit(0);
});

client.login(DISCORD_BOT_TOKEN);
