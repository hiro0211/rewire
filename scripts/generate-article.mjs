#!/usr/bin/env node
/**
 * 記事自動生成スクリプト
 *
 * Claude Code CLI を使って、hiroの文体でSNS記事を生成する。
 * - ~/content/samples/ の文章を参照してトーンと文体を学習
 * - ~/content/topics/topic-pool.md からトピックを選択
 * - ~/content/generated/ に日付付きで出力
 *
 * 使い方:
 *   node scripts/generate-article.mjs              # Note + X 両方
 *   node scripts/generate-article.mjs --note       # Note記事のみ
 *   node scripts/generate-article.mjs --x          # X投稿のみ
 *   node scripts/generate-article.mjs --topic "30日リブート"  # トピック指定
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { resolve, basename } from 'path';
import { homedir } from 'os';

// ── 設定 ──
const CONTENT_ROOT = resolve(homedir(), 'content');
const SAMPLES_DIR = resolve(CONTENT_ROOT, 'samples');
const TOPICS_FILE = resolve(CONTENT_ROOT, 'topics', 'topic-pool.md');
const GENERATED_DIR = resolve(CONTENT_ROOT, 'generated');
const HISTORY_FILE = resolve(GENERATED_DIR, '.used-topics.json');

// ── 引数パース ──
const args = process.argv.slice(2);
const noteOnly = args.includes('--note');
const xOnly = args.includes('--x');
const topicFlag = args.indexOf('--topic');
const specifiedTopic = topicFlag >= 0 ? args[topicFlag + 1] : null;
const generateNote = !xOnly;
const generateX = !noteOnly;

// ── ユーティリティ ──
function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function loadSamples() {
  if (!existsSync(SAMPLES_DIR)) return [];
  const files = readdirSync(SAMPLES_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.txt'));
  return files
    .map((f) => {
      const content = readFileSync(resolve(SAMPLES_DIR, f), 'utf-8');
      return { filename: f, content: content.slice(0, 3000) }; // 長すぎる場合は切り詰め
    })
    .filter((s) => s.content.length > 50); // 短すぎるファイルは除外
}

function loadTopics() {
  if (!existsSync(TOPICS_FILE)) return [];
  const content = readFileSync(TOPICS_FILE, 'utf-8');
  const topics = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') && !trimmed.startsWith('- [')) {
      topics.push(trimmed.slice(2));
    }
  }
  return topics;
}

function loadUsedTopics() {
  if (!existsSync(HISTORY_FILE)) return [];
  try {
    return JSON.parse(readFileSync(HISTORY_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveUsedTopic(topic) {
  const used = loadUsedTopics();
  used.push({ topic, date: new Date().toISOString().slice(0, 10) });
  // 直近60件だけ保持（プールが一巡したらリセットされる）
  writeFileSync(HISTORY_FILE, JSON.stringify(used.slice(-60), null, 2));
}

function selectTopic(topics) {
  if (specifiedTopic) return specifiedTopic;
  const used = loadUsedTopics().map((u) => u.topic);
  const unused = topics.filter((t) => !used.includes(t));
  const pool = unused.length > 0 ? unused : topics; // 全部使い切ったらリセット
  return pool[Math.floor(Math.random() * pool.length)];
}

function runClaudeCode(prompt, cwd = resolve(new URL('.', import.meta.url).pathname, '..')) {
  return new Promise((res, rej) => {
    let output = '';
    const proc = spawn('claude', ['--print', '--dangerously-skip-permissions', prompt], {
      cwd,
      env: { ...process.env, FORCE_COLOR: '0' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    proc.stdout.on('data', (d) => { output += d.toString(); });
    proc.stderr.on('data', (d) => { output += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) res(output.trim());
      else rej(new Error(`Claude Code exited with code ${code}\n${output.slice(-500)}`));
    });
    proc.on('error', rej);
  });
}

// ── メインプロンプト構築 ──
function buildPrompt(topic, samples, platform) {
  const sampleTexts = samples.length > 0
    ? samples.slice(0, 5).map((s) => `--- ${s.filename} ---\n${s.content}`).join('\n\n')
    : '（サンプルなし — 一般的な啓発系ブログのトーンで書いてください）';

  const platformGuide = platform === 'note'
    ? `
## Note記事ルール
- 文字数: 1500〜3000字
- 構成: タイトル → 導入（体験/問題提起）→ 本論（エビデンス）→ 実践アドバイス → まとめ
- 見出し（##）を2〜3個使う
- 最後に「Rewireアプリ」への自然な導線を含める（押し付けがましくなく）
- ハッシュタグを3〜5個付ける（例: #ポルノ依存 #リブート #自己改善）`
    : `
## X投稿ルール
- メインツイート: 140字以内（日本語）
- スレッド: 3〜5ツイート（各140字以内）
- 1ツイート目でフック（問いかけ or 衝撃的な事実）
- 最後のツイートでRewireアプリへの自然な導線
- ハッシュタグは1〜2個`;

  return `あなたはhiro（個人開発者）の文体でSNS記事を書くライターです。

## hiroの文体の特徴（以下のサンプルから学習してください）
${sampleTexts}

## 今日のトピック
「${topic}」

${platformGuide}

## 重要なルール
- hiroの一人称で書く（「僕」or「私」— サンプルに合わせる）
- 体験談と科学的エビデンスをミックスする
- 上から目線にならない。同じ立場の仲間として語る
- ダークパターン的な煽りは絶対にしない（CLAUDE.mdの原則を守る）
- 具体的な数字やデータを含める
- 読者が「自分もやめてみよう」と自然に思える記事にする
- Rewireアプリの宣伝は押し付けがましくなく、自然な文脈で

## 出力フォーマット
マークダウン形式で記事本文のみを出力してください。メタ解説は不要です。`;
}

// ── メイン処理 ──
async function main() {
  console.log('📝 記事生成を開始します...\n');

  const samples = loadSamples();
  const topics = loadTopics();

  if (topics.length === 0) {
    console.error('❌ トピックが見つかりません。content/topics/topic-pool.md を確認してください。');
    process.exit(1);
  }

  if (samples.length === 0) {
    console.warn('⚠️ サンプル文章がありません。content/samples/ にhiroの過去の記事を追加すると精度が上がります。\n');
  } else {
    console.log(`📚 サンプル文章: ${samples.length}本読み込み`);
  }

  const topic = selectTopic(topics);
  console.log(`🎯 今日のトピック: ${topic}\n`);

  ensureDir(GENERATED_DIR);
  const today = new Date().toISOString().slice(0, 10);

  // Note記事の生成
  if (generateNote) {
    console.log('📄 Note記事を生成中...');
    try {
      const prompt = buildPrompt(topic, samples, 'note');
      const article = await runClaudeCode(prompt);
      const filename = `${today}-note-${topic.slice(0, 30).replace(/[/\\:*?"<>|]/g, '')}.md`;
      const filepath = resolve(GENERATED_DIR, filename);
      writeFileSync(filepath, article);
      console.log(`✅ Note記事を保存: ${filename}`);
    } catch (e) {
      console.error(`❌ Note記事の生成失敗: ${e.message}`);
    }
  }

  // X投稿の生成
  if (generateX) {
    console.log('🐦 X投稿を生成中...');
    try {
      const prompt = buildPrompt(topic, samples, 'x');
      const thread = await runClaudeCode(prompt);
      const filename = `${today}-x-${topic.slice(0, 30).replace(/[/\\:*?"<>|]/g, '')}.md`;
      const filepath = resolve(GENERATED_DIR, filename);
      writeFileSync(filepath, thread);
      console.log(`✅ X投稿を保存: ${filename}`);
    } catch (e) {
      console.error(`❌ X投稿の生成失敗: ${e.message}`);
    }
  }

  // 使用済みトピックを記録
  saveUsedTopic(topic);

  console.log(`\n🎉 完了！ 生成された記事は content/generated/ を確認してください。`);
}

main().catch((e) => {
  console.error('致命的エラー:', e);
  process.exit(1);
});
