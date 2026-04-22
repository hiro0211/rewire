  │     │ 絵  │                │                         │                 │
  │  #  │ 文  │   新タイトル   │          説明           │   根拠コード    │
  │     │ 字  │                │                         │                 │
  ├─────┼─────┼────────────────┼─────────────────────────┼─────────────────┤
  │     │     │                │                         │ lib/screenTime/ │
  │ 1   │ 🛡️   │ 全ブラウザで、 │ Safari も Chrome も、見 │  +              │
  │     │     │ 自動ブロック   │ ないと決めた日から。    │ react-native-de │
  │     │     │                │                         │ vice-activity   │
  ├─────┼─────┼────────────────┼─────────────────────────┼─────────────────┤
  │ 2   │ ⏱️   │ ホームで、経過 │ アプリを開かなくても、  │ iOS widget +    │
  │     │     │ 時間を見守る   │ 続いた時間が目に入る。  │ widgetDataSync  │
  ├─────┼─────┼────────────────┼─────────────────────────┼─────────────────┤
  │ 3   │ 🌬️   │ 衝動がきたら、 │ タップひとつで、波を乗  │ app/panic/ +    │
  │     │     │ 3分だけ呼吸    │ り越える。              │ app/breathing/  │
  ├─────┼─────┼────────────────┼─────────────────────────┼─────────────────┤
  │ 4   │ 🌙  │ 毎日の振り返り │ 決めた時刻に通知、タッ  │ ReflectionSheet │
  │     │     │ 、1分で        │ プで完了。              │  + 通知         │
  ├─────┼─────┼────────────────┼─────────────────────────┼─────────────────┤
  │ 5   │ ⭐  │ 18のバッジ、宇 │ 月から惑星、恒星、そし  │ 18 badge system │
  │     │     │ 宙へ続く旅     │ て宇宙へ。              │                 │
  └─────┴─────┴────────────────┴─────────────────────────┴─────────────────┘

  キー命名案：
  features: {
    blocker:    { title: '全ブラウザで、自動ブロック', description: 'Safari も
   Chrome も、見ないと決めた日から。' },
    widget:     { title: 'ホームで、経過時間を見守る', description:
  'アプリを開かなくても、続いた時間が目に入る。' },
    sos:        { title: '衝動がきたら、3分だけ呼吸', description:
  'タップひとつで、波を乗り越える。' },
    reflection: { title: '毎日の振り返り、1分で',     description:
  '決めた時刻に通知、タップで完了。' },
    badges:     { title: '18のバッジ、宇宙へ続く旅', description:
  '月から惑星、恒星、そして宇宙へ。' },
  },

  旧キー（streakTracking, sosBreathing, dailyCheckin, badges,
  widget）は削除。参照箇所は PaywallDefault.tsx の FEATURE_KEYS のみ（grep
  確認済み）。

  3.4 音読チェック（一部抜粋）

  - subHeadline: '科学ベースの習慣で、回復を後押し。'
    - 13 文字: 14 字（許容範囲）
    - 体言止め「後押し」でリズム
    - 読点 1 つで呼吸
  - cancelAnytime: 'いつでも解約できる'
    - 9 字、過剰丁寧排除
  - features 各タイトル: 全て 13 字以内

  ---
  4. ReviewCarousel 設計

  4.1 スタイル指定（参考画像 IMG_4476〜4478 準拠）

  参考画像で確認したレイアウト：
  - 黒い角丸カード（surface 背景）
  - 上部：★×5（ゴールド／オレンジ黄色）
  - 中央：本文（白系、左寄せ、複数行）
  - 下部：author（小さく薄いグレー、左寄せ）
  - カード下：ドットインジケータ（現在位置ハイライト）
  - 横スワイプでページング

  4.2 新規ファイル

  constants/paywall/reviews.ts（作成済）

  export interface AppStoreReview {
    id: string;
    stars: number;
    body: string;
    author: string;
  }
  export const APP_STORE_REVIEWS: readonly AppStoreReview[] = [
    { id: 'suzumoto',  stars: 5, body:
  '自分を高めるための泥臭い努力に、彩りを加えてくれます。', author:
  'すずもと@禁欲' },
    { id: 'lagoonman', stars: 5, body: 'ホーム画面に時間が出せるのが良い。',
                    author: 'ラグーンマン' },
  ];

  ※ レビュー内容は IMG_4475 / IMG_4474
  から。タイトル・日付は参考スタイル画像に無いため省略。

  components/paywall/ReviewCard.tsx（新規）

  Props:
  interface ReviewCardProps {
    review: AppStoreReview;
    width: number;
  }
  描画:
  <View testID="review-card" style={[card, { width }]}>
    <Text testID="review-stars">★★★★★</Text>         // gold
    <Text>{review.body}</Text>                         // FONT_SIZE.sm
    <Text>{review.author}</Text>                       // FONT_SIZE.xs,
  tertiary
  </View>

  スタイル：
  - backgroundColor: colors.surface
  - borderRadius: RADIUS.lg
  - padding: SPACING.lg
  - 星色: #FFB800 等ゴールド（theme に追加 or ローカル定数）
  - marginRight: SPACING.md（カード間の隙間）

  components/paywall/ReviewCarousel.tsx（新規）

  function ReviewCarousel() {
    const { width } = useWindowDimensions();
    const cardWidth = width - SPACING.screenPadding * 2;
    const [activeIndex, setActiveIndex] = useState(0);

    return (
      <View testID="review-carousel">
        <Text>{t('paywall.reviews.sectionTitle')}</Text>
        <FlatList
          data={APP_STORE_REVIEWS}
          horizontal
          pagingEnabled
          snapToInterval={cardWidth + SPACING.md}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / (cardWidth
  + SPACING.md));
            if (idx !== activeIndex) setActiveIndex(idx);
          }}
          scrollEventThrottle={16}
          renderItem={({ item }) => <ReviewCard review={item} 
  width={cardWidth} />}
        />
        <DotIndicator count={APP_STORE_REVIEWS.length} 
  activeIndex={activeIndex} />
      </View>
    );
  }

  DotIndicator：count個の点を横並びで描画、activeIndex の点だけ幅・色変更。

  4.3 配置場所（PaywallDefault.tsx 差分）

  {/* Feature Cards */}
  <View style={styles.featuresWrap}>
    {FEATURE_KEYS.map((f) => (
      <FeatureCard key={f.titleKey} emoji={f.emoji} title={t(f.titleKey)} 
  description={t(f.descriptionKey)} />
    ))}
  </View>

  {/* ← ここに追加 */}
  <ReviewCarousel />

  ---
  5. 変更ファイル一覧

  新規（4 ファイル）

  ┌─────────────────────────────────────────────────┬─────────────────────┐
  │                      パス                       │        役割         │
  ├─────────────────────────────────────────────────┼─────────────────────┤
  │                                                 │ 2 件のレビューデー  │
  │ constants/paywall/reviews.ts                    │ タ（✅              │
  │                                                 │ 作成済、未削除）    │
  ├─────────────────────────────────────────────────┼─────────────────────┤
  │ components/paywall/ReviewCard.tsx               │ 単カードコンポーネ  │
  │                                                 │ ント                │
  ├─────────────────────────────────────────────────┼─────────────────────┤
  │ components/paywall/ReviewCarousel.tsx           │ 横スワイプ + ドット │
  ├─────────────────────────────────────────────────┼─────────────────────┤
  │ components/paywall/__tests__/ReviewCard.test.ts │ 6 ケース（✅        │
  │ x                                               │ 作成済、未削除）    │
  ├─────────────────────────────────────────────────┼─────────────────────┤
  │ components/paywall/__tests__/ReviewCarousel.tes │ 4〜5 ケース         │
  │ t.tsx                                           │                     │
  └─────────────────────────────────────────────────┴─────────────────────┘

  変更（3 ファイル）

  ┌─────────────────────────────────────┬─────────────────────────────────┐
  │                パス                 │              内容               │
  ├─────────────────────────────────────┼─────────────────────────────────┤
  │                                     │ paywall.*                       │
  │ locales/ja.ts                       │ 全キー刷新、features.*          │
  │                                     │ 差し替え、reviews.sectionTitle  │
  │                                     │ 追加                            │
  ├─────────────────────────────────────┼─────────────────────────────────┤
  │ locales/en.ts                       │ features.* の英訳更新、reviews. │
  │                                     │ sectionTitle 追加               │
  ├─────────────────────────────────────┼─────────────────────────────────┤
  │ components/paywall/PaywallDefault.t │ FEATURE_KEYS                    │
  │ sx                                  │ 差し替え、<ReviewCarousel />    │
  │                                     │ 挿入                            │
  └─────────────────────────────────────┴─────────────────────────────────┘

  ---
  6. TDD テストケース

  6.1 ReviewCard (6 ケース — ✅ 既にテストファイル作成済)

  1. クラッシュせずレンダー
  2. 本文表示
  3. author 表示
  4. stars=5 で ★★★★★ 描画
  5. stars=3 で ★★★ 描画
  6. width prop がカード style に反映

  6.2 ReviewCarousel (5 ケース — 未着手)

  1. クラッシュせずレンダー
  2. セクションタイトル表示
  3. レビュー 2 件それぞれの本文が描画される
  4. review-carousel testID が存在
  5. ドットインジケータが APP_STORE_REVIEWS.length 個描画される

  6.3 PaywallDefault 既存テスト互換

  - PaywallDefault.test.tsx / PaywallDefault.crash.test.tsx /
  app/__tests__/paywall.test.tsx が通ることを確認
  -
  機能キー変更に伴い、旧キーをハードコード参照しているテストがあれば更新（grep
   で事前確認必要）

  ---
  7. 実装フェーズ（承認後の順序）

  ┌─────┬────────────────────────────────────────┬────────────────────────┐
  │ Pha │                  内容                  │       影響テスト       │
  │ se  │                                        │                        │
  ├─────┼────────────────────────────────────────┼────────────────────────┤
  │ ①   │ constants/paywall/reviews.ts（既に配置 │ なし                   │
  │     │ 済、確認のみ）                         │                        │
  ├─────┼────────────────────────────────────────┼────────────────────────┤
  │ ②   │ ReviewCard: Red → Green → Refactor     │ 新規 6 ケース          │
  ├─────┼────────────────────────────────────────┼────────────────────────┤
  │ ③   │ ReviewCarousel: Red → Green → Refactor │ 新規 5 ケース          │
  ├─────┼────────────────────────────────────────┼────────────────────────┤
  │ ④   │ locales/ja.ts 刷新（自然日本語 +       │ 既存 paywall テストで  │
  │     │ 機能キー差替）                         │ 旧キー参照があれば修正 │
  ├─────┼────────────────────────────────────────┼────────────────────────┤
  │ ⑤   │ locales/en.ts 同期                     │ 同上                   │
  ├─────┼────────────────────────────────────────┼────────────────────────┤
  │ ⑥   │ PaywallDefault.tsx 差し替え +          │ 既存 PaywallDefault    │
  │     │ ReviewCarousel 組込                    │ テスト再確認           │
  ├─────┼────────────────────────────────────────┼────────────────────────┤
  │ ⑦   │ npm test 全体（263 → 265               │ リグレッション 0 確認  │
  │     │ 前後スイート） + npm run lint          │                        │
  └─────┴────────────────────────────────────────┴────────────────────────┘

  ---
  8. 決め打ちしている前提（確認ポイント）

  以下はユーザーの明示承認なしに決めているので、違和感があれば指摘してほしい：

  1. レビュー本文は画像どおりコピー（末尾句点は原文に合わせ軽く整形）：
    - 「自分を高めるための泥臭い努力に**、彩りを加えてくれます。**」
    - 「ホーム画面に時間が出せるのが良い**。**」
  2. タイトル・日付は省略（参考スタイル画像 IMG_4476〜4478 に無いため）
  3. 機能リストは 5 件維持（増減しない）
  4. 旧機能キー（streakTracking / sosBreathing / dailyCheckin）は削除、badges
  / widget はキー名を残すか刷新するか → 上記案では badges / widget
  キー名も変更（blocker / widget / sos / reflection / badges の 5
  つ）。旧キー参照を完全削除したい。
  5. 星の色は #FFB800 前後のゴールドでハードコード（他の theme
  トークンと競合しない）
  6. カルーセルセクションタイトル: 'ユーザーの声'（「App Store
  レビュー」と明示しない方が UX 的に馴染む判断）
  7. 自動再生は無し、ユーザー操作でのみ進む

  ---
  9. このまま実装に入る場合のコマンド

  # ②-③ コンポーネント実装
  npx jest components/paywall/__tests__/ReviewCard.test.tsx --no-coverage
  npx jest components/paywall/__tests__/ReviewCarousel.test.tsx --no-coverage

  # ⑦ 全体検証
  npm test -- --no-coverage
  npm run lint

  ---
  **この計画で進めて良いか、変更すべき点（特に §8
  の前提）があるかを教えてほしい。**承認後、①→⑦ の順に TDD で実装する。