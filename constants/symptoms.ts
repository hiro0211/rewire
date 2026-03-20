export interface SymptomItem {
  id: string;
  labelKey: string;
}

export interface SymptomCategory {
  id: string;
  titleKey: string;
  items: SymptomItem[];
}

export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: 'mental',
    titleKey: 'symptoms.mental.title',
    items: [
      { id: 'mental_motivation', labelKey: 'symptoms.mental.motivation' },
      { id: 'mental_ambition', labelKey: 'symptoms.mental.ambition' },
      { id: 'mental_focus', labelKey: 'symptoms.mental.focus' },
      { id: 'mental_brainfog', labelKey: 'symptoms.mental.brainfog' },
      { id: 'mental_anxiety', labelKey: 'symptoms.mental.anxiety' },
    ],
  },
  {
    id: 'physical',
    titleKey: 'symptoms.physical.title',
    items: [
      { id: 'physical_fatigue', labelKey: 'symptoms.physical.fatigue' },
      { id: 'physical_libido', labelKey: 'symptoms.physical.libido' },
      { id: 'physical_ed', labelKey: 'symptoms.physical.ed' },
      { id: 'physical_sex', labelKey: 'symptoms.physical.sex' },
    ],
  },
  {
    id: 'emotional',
    titleKey: 'symptoms.emotional.title',
    items: [
      { id: 'emotional_confidence', labelKey: 'symptoms.emotional.confidence' },
      { id: 'emotional_attractiveness', labelKey: 'symptoms.emotional.attractiveness' },
      { id: 'emotional_worthless', labelKey: 'symptoms.emotional.worthless' },
      { id: 'emotional_social', labelKey: 'symptoms.emotional.social' },
      { id: 'emotional_isolation', labelKey: 'symptoms.emotional.isolation' },
    ],
  },
];

export const ALL_SYMPTOM_IDS = SYMPTOM_CATEGORIES.flatMap((cat) =>
  cat.items.map((item) => item.id)
);
