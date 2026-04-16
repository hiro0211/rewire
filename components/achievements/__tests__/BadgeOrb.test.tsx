import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    colors: { text: '#fff', textSecondary: '#999' },
    glow: { cyan: 'rgba(0, 212, 255, 0.2)' },
  }),
}));

import { BadgeOrb } from '../BadgeOrb';
import type { BadgeColorTriad } from '@/constants/badges/BadgeColorTriad';

const MOCK_COLORS: BadgeColorTriad = {
  core: '#FFB547',
  glow: '#FFE4A0',
  accent: '#FF7847',
};

describe('BadgeOrb', () => {
  it('unlocked のとき testID="badge-orb-unlocked" を持つコンテナを描画する', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked chapterId="ignition" />,
    );
    expect(screen.getByTestId('badge-orb-unlocked')).toBeTruthy();
  });

  it('locked のとき testID="badge-orb-locked" を持つコンテナを描画する', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked={false} chapterId="ignition" />,
    );
    expect(screen.getByTestId('badge-orb-locked')).toBeTruthy();
  });

  it('locked のとき opacity 0.3 が適用される', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked={false} chapterId="ignition" />,
    );
    const container = screen.getByTestId('badge-orb-locked');
    // Flatten style array into single object for inspection
    const flat = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style.filter(Boolean))
      : container.props.style;
    expect(flat.opacity).toBe(0.3);
  });

  it('locked のとき LinearGradient に colors が渡される', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked={false} chapterId="ignition" />,
    );
    const gradient = screen.getByTestId('badge-orb-locked-gradient');
    expect(gradient.props.colors).toEqual([
      MOCK_COLORS.core,
      MOCK_COLORS.glow,
      MOCK_COLORS.accent,
    ]);
  });
});
