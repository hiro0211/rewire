import type { SurveyQuestion } from '@/types/survey';

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'age_range',
    question: 'あなたの年齢を教えてください',
    type: 'choice',
    options: [
      { label: '18〜24歳', value: '18-24' },
      { label: '25〜34歳', value: '25-34' },
      { label: '35〜44歳', value: '35-44' },
      { label: '45歳以上', value: '45+' },
    ],
    required: true,
  },
  {
    id: 'discovery_channel',
    question: 'このアプリをどこで知りましたか？',
    type: 'choice',
    options: [
      { label: 'App Store検索', value: 'app_store' },
      { label: 'SNS(TikTok・Instagram等)', value: 'sns' },
      { label: '友人・知人の紹介', value: 'referral' },
      { label: 'ウェブ検索', value: 'web_search' },
      { label: 'その他', value: 'other' },
    ],
    required: true,
  },
  {
    id: 'motivation',
    question: 'アプリを使い始めたきっかけは何ですか？',
    type: 'choice',
    options: [
      { label: '自己コントロール力をつけたい', value: 'self_control' },
      { label: '集中力・生産性を上げたい', value: 'productivity' },
      { label: 'パートナーとの関係をよくしたい', value: 'relationship' },
      { label: '自己嫌悪から抜け出したい', value: 'self_esteem' },
    ],
    required: true,
  },
  {
    id: 'perceived_change',
    question: 'アプリを使い始めてどんな変化を感じますか？',
    type: 'choice',
    options: [
      { label: 'かなり変化を感じる', value: 'significant' },
      { label: '少し変化を感じる', value: 'slight' },
      { label: 'まだわからない', value: 'unsure' },
      { label: '特に変化はない', value: 'none' },
    ],
    required: true,
  },
  {
    id: 'free_text',
    question: 'アプリへのご意見・ご要望があればお聞かせください',
    type: 'text_input',
    required: false,
  },
];

export const TOTAL_SURVEY_QUESTIONS = SURVEY_QUESTIONS.length;

export const REQUIRED_SURVEY_QUESTIONS = SURVEY_QUESTIONS.filter((q) => q.required);
