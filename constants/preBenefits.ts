// ── 型定義 ──

export interface BenefitItem {
  emoji: string;
  bold: string;
  text: string;
}

export interface BenefitSection {
  id: string;
  title: string;
  emoji: string;
  benefits: BenefitItem[];
}

export interface BenefitTagData {
  label: string;
  color: string;
  emoji: string;
}

export interface Testimonial {
  quote: string;
  rating: number;
  author: string;
}

export interface FeatureItem {
  emoji: string;
  title: string;
  description: string;
}

// ── ベネフィットタグ ──

export const BENEFIT_TAGS: BenefitTagData[] = [
  { label: '集中力回復', color: '#3DD68C', emoji: '🎯' },
  { label: 'ED予防', color: '#F0A030', emoji: '🛡️' },
  { label: '自己効力感', color: '#8B5CF6', emoji: '💪' },
  { label: '脳のリセット', color: '#00D4FF', emoji: '🧠' },
  { label: '時間の確保', color: '#EF4444', emoji: '⏰' },
  { label: '自己成長', color: '#C8A84E', emoji: '📈' },
  { label: '人間関係改善', color: '#4A90D9', emoji: '🤝' },
];

// ── ベネフィットセクション ──

export const BENEFIT_SECTIONS: BenefitSection[] = [
  {
    id: 'rewire_brain',
    title: '脳をリセットする',
    emoji: '🧠',
    benefits: [
      { emoji: '🔄', bold: 'ドーパミンの基準値', text: 'をリセット' },
      { emoji: '🎯', bold: '集中力と意欲', text: 'を取り戻す' },
      { emoji: '✨', bold: '日常の小さな幸せ', text: 'を感じる力を回復' },
    ],
  },
  {
    id: 'self_control',
    title: '自分をコントロールする',
    emoji: '🔥',
    benefits: [
      { emoji: '💪', bold: '衝動に勝てる', text: '自分になる' },
      { emoji: '🤝', bold: '自分との約束', text: 'を守れる人間になる' },
      { emoji: '📈', bold: '自己効力感', text: 'を取り戻す' },
    ],
  },
  {
    id: 'move_forward',
    title: '人生を変える',
    emoji: '🚀',
    benefits: [
      { emoji: '🌙', bold: '夜の2〜3時間', text: 'を副業・学習に再投資' },
      { emoji: '📚', bold: 'ビジネス書を1冊通して読める', text: '集中力' },
      { emoji: '🏆', bold: '「続けられた」という実感', text: 'が力になる' },
    ],
  },
  {
    id: 'real_relationships',
    title: '本物の人間関係を築く',
    emoji: '❤️',
    benefits: [
      { emoji: '💡', bold: '自分の感情', text: 'と向き合える' },
      { emoji: '🔗', bold: '信頼できる', text: '人間になる' },
      { emoji: '❤️', bold: '大切な人', text: 'と深い関係を築ける' },
    ],
  },
];

// ── ユーザー証言 ──

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'ポルノのせいで集中力がボロボロだったけど、Rewireを始めて2週間で本が読めるようになった。自分でも驚いている。',
    rating: 5,
    author: 'Anonymous',
  },
  {
    quote: '何度も挫折してきたけど、毎日のチェックインで自分の行動パターンに気づけた。衝動が来ても呼吸法で乗り越えられるようになった。',
    rating: 5,
    author: 'Anonymous',
  },
];

// ── 機能紹介 ──

export const FEATURE_ITEMS: FeatureItem[] = [
  {
    emoji: '🔥',
    title: 'ストリーク記録',
    description: '継続日数を可視化してモチベーションを維持',
  },
  {
    emoji: '🔒',
    title: 'コンテンツブロッカー',
    description: 'Safariのアダルトコンテンツを自動ブロック',
  },
  {
    emoji: '🌬️',
    title: 'SOS呼吸法',
    description: '衝動が来たら深呼吸でピークをやり過ごす',
  },
  {
    emoji: '📊',
    title: 'デイリーチェックイン',
    description: '毎日の振り返りで行動パターンを自覚する',
  },
  {
    emoji: '⏱️',
    title: 'ウィジェット対応',
    description: 'アプリを開かずホーム画面で経過時間をチェック',
  },
];
