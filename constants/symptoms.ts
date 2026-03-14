export interface SymptomItem {
  id: string;
  label: string;
}

export interface SymptomCategory {
  id: string;
  title: string;
  items: SymptomItem[];
}

export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: 'mental',
    title: '精神面',
    items: [
      { id: 'mental_motivation', label: 'やる気が出ない' },
      { id: 'mental_ambition', label: '目標を追う意欲がない' },
      { id: 'mental_focus', label: '集中力の低下' },
      { id: 'mental_brainfog', label: '記憶力の低下・頭がぼんやりする' },
      { id: 'mental_anxiety', label: '不安を感じやすい' },
    ],
  },
  {
    id: 'physical',
    title: '身体面',
    items: [
      { id: 'physical_fatigue', label: '疲れやすい・だるい' },
      { id: 'physical_libido', label: '性欲の低下' },
      { id: 'physical_ed', label: 'ポルノ以外での勃起が弱い' },
      { id: 'physical_sex', label: 'セックスを楽しめない' },
    ],
  },
  {
    id: 'emotional',
    title: '感情面',
    items: [
      { id: 'emotional_confidence', label: '自分に自信がない' },
      { id: 'emotional_attractiveness', label: '自分に魅力がないと感じる' },
      { id: 'emotional_worthless', label: '愛される価値がないと感じる' },
      { id: 'emotional_social', label: '人付き合いへの意欲がない' },
      { id: 'emotional_isolation', label: '孤立感' },
    ],
  },
];

export const ALL_SYMPTOM_IDS = SYMPTOM_CATEGORIES.flatMap((cat) =>
  cat.items.map((item) => item.id)
);
