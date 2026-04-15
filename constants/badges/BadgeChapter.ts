export const CHAPTER_IDS = [
  'chaos',
  'ignition',
  'formation',
  'life',
  'expansion',
  'transcendence',
] as const;

export type ChapterId = (typeof CHAPTER_IDS)[number];

export interface ChapterDefinition {
  readonly id: ChapterId;
  readonly nameJa: string;
  readonly nameEn: string;
}

export const CHAPTERS: readonly ChapterDefinition[] = [
  { id: 'chaos', nameJa: '混沌', nameEn: 'Chaos' },
  { id: 'ignition', nameJa: '点火', nameEn: 'Ignition' },
  { id: 'formation', nameJa: '形成', nameEn: 'Formation' },
  { id: 'life', nameJa: '生命', nameEn: 'Life' },
  { id: 'expansion', nameJa: '拡張', nameEn: 'Expansion' },
  { id: 'transcendence', nameJa: '超越', nameEn: 'Transcendence' },
];
