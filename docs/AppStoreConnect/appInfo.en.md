# Rewire — App Store Connect Metadata (English / v2.2 draft)

English transcreation of the Japanese v2.1 metadata, prepared for v2.2 submission with English as an additional locale (and eventually primary).

**Translation approach**: not a literal translation. Adapted to US App Store conventions — direct hooks instead of rhetorical questions, science-forward tone (matching successful NoFap apps like Brainbuddy / Fortify), bullet-first scannable structure, and inclusive (gender-neutral) framing to reduce review friction.

---

## App Information (App-wide)

| Field | Limit | Value |
|---|---|---|
| App Name | 30 | `Rewire` |
| Subtitle | 30 | `Quit porn. Rewire your brain.` (29) |
| Bundle ID | — | `rewire.app.com` |

> Note: "Rewire" is a brand name and stays untranslated. Subtitle uses the same verb as the brand name for cohesion.

---

## Version 2.2 Metadata

| Field | Limit | Value |
|---|---|---|
| Version | — | `2.2` |
| Copyright | — | `© 2026 Hiroaki` |
| Support URL | — | `https://hiro0211.github.io/rewire-support/` |
| Marketing URL | — | (optional, leave blank for now) |

### Promotional Text (170 chars / ~155 used)

```
Break free from porn with science-backed check-ins, urge-surfing breathwork,
streak tracking, and a built-in Safari blocker. Rewire your brain in 30 days.
```

### Keywords (100 chars / 99 used)

```
nofap,quit porn,porn blocker,recovery,streak,reboot,self control,dopamine,addiction,urge,mindfulness
```

> Keyword strategy:
> - High-volume niche terms first: `nofap`, `quit porn`, `porn blocker`
> - Outcome words: `recovery`, `reboot`, `self control`
> - Mechanism words: `streak`, `dopamine`, `mindfulness`
> - Symptom words: `urge`, `addiction`
> - **Do NOT repeat** words already in App Name / Subtitle (`rewire`, `brain`, `quit`, `porn`) — Apple indexes those separately.

### What's New in This Version (4000 chars)

```
• English language now supported worldwide.
• Onboarding redesigned to get you to your first check-in faster.
• In-app guidance for setting up the Safari content blocker extension.
• Various bug fixes and performance improvements.
```

---

## Description (4000 chars / ~2300 used)

```
Tired of waking up and hating yourself again?

You decided to focus on your side hustle. To level up at work. To become the
confident person you know you can be. And then, somehow, you ended up scrolling
the same sites for the hundredth night in a row.

Hours gone. Energy gone. Self-respect gone.

It's not a willpower problem. Porn hijacks the brain's reward system, and no
amount of grit can win a fair fight against your own dopamine loop. That's why
Rewire was built — to retrain the circuit, not shame the symptom.

Built for anyone who's tried to quit and slipped back. Anyone who's deleted
bookmarks at 2 AM and re-added them by morning. Anyone tired of trading their
future for five minutes.


WHAT REWIRE HELPS WITH

• Breaking the social-media → adult-site spiral
• Rebuilding self-trust after repeated relapse
• Recovering the focus and motivation porn quietly drains
• Sleeping at night without the shame spiral


FEATURES

— Daily Check-In
Log whether you viewed today, plus your urge level, stress, and mood. Optional
notes for context. Over time, your patterns become visible — when you're weak,
why you slip, and what actually helps.

— Streak Counter
A clean, no-nonsense streak. See today's count the moment you open the app.
Hit 7 days, then 14, then 30, then 90. Each milestone is fuel for the next.

— Urge-Surfing Breathwork
When a craving hits, tap the "I want to look" button on the home screen. A
guided breath animation with haptic pulses walks you through it — works with
your eyes closed. The urge passes. You stayed.

— Calendar & History
Clean days in green, slip days in red. Toggle between calendar and list view
to see your whole journey at a glance.

— Achievement Badges
Unlock milestone badges as your streak grows. A visual timeline of how far
you've actually come — useful on the days you forget.

— Recovery Support
Slipped? You're still in this. Reflect on what triggered it, log it, and turn
the slip into the start of your next streak — not the end of your progress.

— Built-In Porn Blocker
Auto-blocks adult sites in Safari. Step-by-step setup guide inside the app
gets you protected in minutes.

— Home Screen Widget
Your current streak, visible without even opening the app. A constant,
quiet nudge.


PRIVACY FIRST

All your data stays on your device. Nothing is sent to any server. No account,
no tracking, no judgment.


SUBSCRIPTION

• Payment is charged to your Apple ID account
• Auto-renews unless canceled at least 24 hours before the current period ends
• Manage or cancel anytime in iPhone Settings → Subscriptions

Terms of Use: https://hiro0211.github.io/rewire-support/#terms
Privacy Policy: https://hiro0211.github.io/rewire-support/#privacy
```

---

## Translation Notes & Decisions

Choices that diverge from a literal translation, with reasoning:

| Japanese原文 | 直訳 | 採用版 | 理由 |
|---|---|---|---|
| 自分を嫌いになる夜を、終わりにしませんか？ | "Won't you end the nights of self-hatred?" | "Tired of waking up and hating yourself again?" | 英語の修辞疑問は説教臭くなる。"Tired of..." は米系アプリで定番の直接フック |
| 副業で稼いで自由になりたい！ | "I want to earn from a side gig and be free!" | "You decided to focus on your side hustle." | 英語は「決意した→裏切られた」の物語アークの方が刺さる |
| 世の中の男性の9割 | "9 out of 10 men in the world" | （削除）| 統計の出典不明 + ジェンダー限定は米App Store審査で不利。インクルーシブに |
| 脳の報酬系がハック | "your brain's reward system is hacked" | "Porn hijacks the brain's reward system" | 主語を「ポルノ」にして悪役を明確化（Brainbuddy方式） |
| 気合いや根性で「本能」には勝てません | "willpower can't beat instinct" | "no amount of grit can win a fair fight against your own dopamine loop" | 「ドーパミン」キーワードを本文に自然に埋め込む（ASO効果） |
| 衝動が来たらホーム画面のポルノを見たくなったらボタンをワンタップ | （原文も冗長）| "When a craving hits, tap the 'I want to look' button" | 原文の冗長部分を整理しつつボタン名を残す |
| 達成日は緑、リセット日は赤 | "achievement days green, reset days red" | "Clean days in green, slip days in red" | "Clean day" / "slip" はNoFap英語圏の標準語彙 |
| もし見てしまっても、大丈夫 | "Even if you've watched, it's okay" | "Slipped? You're still in this." | 英語の方が短く力強く |

---

## Pre-Submission Checklist

英語ロケールを v2.2 で追加するために必要な作業:

- [ ] App Store Connect で v2.2 を作成
- [ ] English (U.S.) ローカリゼーション追加
- [ ] 上記メタデータ全項目を入力
- [ ] **スクリーンショット英語版を全サイズ用意**（6.9", 6.5", 5.5" iPhone等、日本語版と同じサイズ）
- [ ] App Preview ビデオ（任意・あれば）の英語版
- [ ] ビルドを添付（バンドル内のローカリゼーション対応は既に locales/en.ts で完了済み）
- [ ] App Review メモに「Adding English locale for international expansion」を記載
- [ ] 審査提出
- [ ] **承認後**: App Information → Primary Language プルダウンで English に変更 → Save

---

## Sources & Inspiration

- [Brainbuddy — Quit Porn with Science](https://www.brainbuddyapp.com/)
- [Fortify — Quit Porn for Good (App Store)](https://apps.apple.com/us/app/fortify-quit-porn-for-good/id1304648824)
- [How to Translate App Store Description — OneSky](https://www.oneskyapp.com/blog/app-store-localization/)
- [App Store Description Localization Best Practices — ibabbleon](https://www.ibabbleon.com/app-store-app-description-localization-metadata.html)
- [Best NoFap Apps 2026 — BlockP](https://blockp.io/best-nofap-apps-and-trackers/)
