# 記事自動生成セットアップ — Claude Code に渡すプロンプト

> Mac miniのClaude Codeにコピペして実行してください。

---

## プロンプト（ここから下をコピペ）

```
記事自動生成システムのセットアップを行ってください。

## ステップ1: ~/content/ ディレクトリの作成

記事関連のファイルはRewireプロジェクトの外、ホームディレクトリ直下で管理します。

mkdir -p ~/content/samples ~/content/topics ~/content/generated

## ステップ2: トピックプールの作成

~/content/topics/topic-pool.md を作成してください。
Rewireプロジェクト内の scripts/generate-article.mjs のコメントにトピック形式の説明があります。
以下の4カテゴリで、各カテゴリ10個程度のトピックをリスト形式（- トピック名）で書いてください:

1. ポルノの危険性（科学的エビデンス）
2. 回復・リブート体験
3. 実践的なアドバイス
4. 社会的な視点

## ステップ3: サンプル文章フォルダの確認

~/content/samples/ にhiroの過去のSNS投稿を保存します（後から手動追加）。
README.md を作成して、以下を記載:
- ファイル形式: .md または .txt
- ファイル名規則: YYYYMMDD-プラットフォーム-タイトル.md
- 最低5〜10本推奨

## ステップ4: Claude Code CLI の確認

claude --version

動作することを確認。

## ステップ5: テスト生成

Rewireプロジェクトのディレクトリに移動してから実行:

cd /path/to/rewire
node scripts/generate-article.mjs --note --topic "ポルノをやめて最初の1週間で起こること"

~/content/generated/ に記事ファイルが作成されることを確認。
ファイルの中身を表示して、日本語の記事が正しく生成されていることを確認。

## ステップ6: launchd の設定

plistファイルをコピーして登録:

cp scripts/com.rewire.article-generator.plist ~/Library/LaunchAgents/

注意: plist内のパスが正しいか確認:
- node のパス: which node の結果と一致させる
- WorkingDirectory: Rewireプロジェクトのフルパスと一致させる

パスが異なる場合は修正してからコピー。

登録:
launchctl load ~/Library/LaunchAgents/com.rewire.article-generator.plist

## ステップ7: 動作確認

# 次の実行予定を確認
launchctl list | grep article

# ログを確認
cat /tmp/article-generator.log

# 生成先を確認
ls ~/content/generated/

## ステップ8: Discord Botとの連携確認

Discord Botが起動している状態で、Discordから以下を送信してテスト:
- /article → 今日の記事確認（~/content/generated/ を参照）
- /article generate → 手動で今すぐ生成
- /article list → 生成済み記事一覧

全て完了したら結果を報告してください。
```
