export interface AssessmentOption {
  label: string;
  value: string;
  score: number;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'choice' | 'yesno' | 'picker';
  options?: AssessmentOption[];
  yesScore?: number;
  pickerRange?: { min: number; max: number; suffix: string };
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'startAge',
    question: 'ポルノを定期的に見始めたのは\n何歳ですか？',
    type: 'choice',
    options: [
      { label: '12歳以下', value: 'under12', score: 3 },
      { label: '13〜15歳', value: '13-15', score: 2 },
      { label: '16〜18歳', value: '16-18', score: 1 },
      { label: '19歳以上', value: '19+', score: 0 },
    ],
  },
  {
    id: 'currentAge',
    question: '現在の年齢は？',
    type: 'picker',
    pickerRange: { min: 11, max: 60, suffix: '歳' },
  },
  {
    id: 'frequency',
    question: 'どれくらいの頻度で\nポルノを観ますか？',
    type: 'choice',
    options: [
      { label: '1日1回以上', value: 'multiple_daily', score: 4 },
      { label: '1日1回', value: 'daily', score: 3 },
      { label: '週に数回', value: 'weekly', score: 2 },
      { label: 'ほとんど見ない', value: 'rarely', score: 0 },
    ],
  },
  {
    id: 'escalation',
    question: '観ていくうちに、より過激な\nポルノを見るようになりましたか？',
    type: 'yesno',
    yesScore: 4,
  },
  {
    id: 'increasing',
    question: 'ポルノを観る頻度や時間は、\n年々増えていますか？',
    type: 'yesno',
    yesScore: 3,
  },
  {
    id: 'stressCoping',
    question: 'ストレスを解消するために\nポルノを観ますか？',
    type: 'yesno',
    yesScore: 3,
  },
  {
    id: 'boredomCoping',
    question: '退屈を紛らわせるために\nポルノを観ますか？',
    type: 'yesno',
    yesScore: 2,
  },
  {
    id: 'failedControl',
    question: 'やめよう、減らそうとして\nうまくいかなかったことは\nありますか？',
    type: 'yesno',
    yesScore: 5,
  },
  {
    id: 'dailyImpact',
    question: 'ポルノが日常生活や\n人間関係に影響していると\n感じますか？',
    type: 'yesno',
    yesScore: 5,
  },
];

export interface ScoreThreshold {
  max: number;
  label: string;
  color: string;
  message: string;
}

export const SCORE_THRESHOLDS: ScoreThreshold[] = [
  { max: 7, label: '影響 小', color: '#3DD68C', message: '大きな問題はなさそうです。\n今のうちに対策しておくことで、\n確実にコントロールを維持できます。' },
  { max: 14, label: '影響 中', color: '#F0A030', message: '習慣が日常に影響し始めています。\n今が変えるベストタイミングです。' },
  { max: 21, label: '影響 大', color: '#EF8C30', message: '習慣があなたの時間と集中力を\n奪っています。\n構造的に変えていきましょう。' },
  { max: 29, label: '影響 深刻', color: '#EF4444', message: '正しいアプローチで、確実に変えられます。\n今日から始めましょう。' },
];

export const MAX_SCORE = 29;
