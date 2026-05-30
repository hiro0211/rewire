# Rewire 日次レポート Agent

ASC + RevenueCat + Firebase Analytics のデータを集約し、Claude が要約した
日次レポートを arimura.hiroaki40@gmail.com にメール送信する Python パイプライン。

## 現在のステータス

**Option B: メーラー単体先行** を実装中。
既存の `docs/analytics/daily-metrics-*-corrected.json`（手動集計済の正しいデータ）
を読み込み、Claude で要約して Resend 経由で毎朝メール送信する。

RevenueCat / Firebase Analytics クライアントと analyze_funnel バグ修正は
Phase 2 以降で追加予定（plan: `~/.claude/plans/revenuecat-flickering-fog.md`）。

## 既存資産（変更しない）
- `jwt_auth.py` — App Store Connect JWT (ES256) 認証
- `asc_client.py` — ASC Analytics Reports API クライアント
- `asc_fetch.py` — 日次 TSV ダウンロード
- `main.py` — TSV fetch CLI（既に launchd で動作中）
- `~/.config/asc/` — 既存の ASC 認証情報

## 初回セットアップ（hiro 一度だけ）

```bash
# 1. 依存インストール
cd /Users/arimurahiroaki/rewire
/usr/bin/python3 -m pip install --user -r scripts/analytics/requirements.txt

# 2. 環境変数ファイルを準備
mkdir -p ~/.config/rewire
cp scripts/analytics/.env.analytics.example ~/.config/rewire/.env.analytics
chmod 600 ~/.config/rewire/.env.analytics

# 3. ~/.config/rewire/.env.analytics を開いて RESEND_API_KEY だけペースト
#    (https://resend.com/ で発行、30秒)
open ~/.config/rewire/.env.analytics

# 4. 疎通確認
/usr/bin/python3 -m pytest scripts/analytics/tests/ -q
/usr/bin/python3 -m scripts.analytics.send_daily --dry-run

# 5. 実送信
/usr/bin/python3 -m scripts.analytics.send_daily
```

到着確認できたら launchd plist で日次スケジュール（Phase 4）。

## 日次運用
何もしない。launchd が毎朝 8:00 JST に `send_daily.py` を起動 → メール到着。

## テスト
```bash
/usr/bin/python3 -m pytest scripts/analytics/tests/ -v
```
