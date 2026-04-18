import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    colors: { text: '#fff', textSecondary: '#999' },
    glow: { cyan: 'rgba(0, 212, 255, 0.2)' },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    isJapanese: true,
  }),
}));

import { BadgeOrbRow } from '../BadgeOrbRow';
import type { NeuralBadgeDefinition } from '@/constants/badges/BADGE_DEFINITIONS';

const MOCK_BADGE: NeuralBadgeDefinition = {
  id: 'moon',
  day: 7,
  chapter: 'innerPlanets',
  nameJa: '月',
  nameEn: 'Moon',
  message: '静かな光が闇を照らす。最初の1週間を越えた。',
  visual: '銀白色のクレーター付き球体',
  neural: '1週間 — 前頭前皮質の灰白質密度が増加傾向',
  colors: { core: '#D4D4D8', mid: '#E8E8EC', outer: '#9CA3AF', glow: '#F4F4F5' },
};

describe('BadgeOrbRow', () => {
  it('日本語ロケールでバッジ名 (nameJa) を表示する', () => {
    render(
      <BadgeOrbRow badge={MOCK_BADGE} isUnlocked alignment="left" />,
    );
    expect(screen.getByText('月')).toBeTruthy();
  });

  it('"Day {n}" ラベルを表示する', () => {
    render(
      <BadgeOrbRow badge={MOCK_BADGE} isUnlocked alignment="right" />,
    );
    expect(screen.getByText('Day 7')).toBeTruthy();
  });

  it('badge.message を表示する', () => {
    render(
      <BadgeOrbRow badge={MOCK_BADGE} isUnlocked alignment="center" />,
    );
    expect(screen.getByText(MOCK_BADGE.message)).toBeTruthy();
  });
});
