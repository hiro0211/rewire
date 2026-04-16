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
  id: 'Ignition',
  day: 7,
  chapter: 'ignition',
  nameJa: '点火',
  nameEn: 'Ignition',
  message: '核融合が始まった。あなたの中に恒星が誕生した。',
  visual: 'オレンジの炎が噴き出す',
  neural: '1週間 — 前頭前皮質の灰白質密度が増加傾向',
  colors: { core: '#FFB547', glow: '#FFE4A0', accent: '#FF7847' },
};

describe('BadgeOrbRow', () => {
  it('日本語ロケールでバッジ名 (nameJa) を表示する', () => {
    render(
      <BadgeOrbRow badge={MOCK_BADGE} isUnlocked alignment="left" />,
    );
    expect(screen.getByText('点火')).toBeTruthy();
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
