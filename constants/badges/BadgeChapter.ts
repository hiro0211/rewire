export const CHAPTER_IDS = [
  'birth',
  'innerPlanets',
  'terrestrial',
  'outerPlanets',
  'stellar',
  'cosmic',
] as const;

export type ChapterId = (typeof CHAPTER_IDS)[number];

export interface ChapterDefinition {
  readonly id: ChapterId;
  readonly nameJa: string;
  readonly nameEn: string;
}

export const CHAPTERS: readonly ChapterDefinition[] = [
  { id: 'birth', nameJa: '誕生', nameEn: 'Birth' },
  { id: 'innerPlanets', nameJa: '内惑星', nameEn: 'Inner Planets' },
  { id: 'terrestrial', nameJa: '地球型惑星', nameEn: 'Terrestrial' },
  { id: 'outerPlanets', nameJa: '外惑星', nameEn: 'Outer Planets' },
  { id: 'stellar', nameJa: '恒星', nameEn: 'Stellar' },
  { id: 'cosmic', nameJa: '宇宙', nameEn: 'Cosmic' },
];
