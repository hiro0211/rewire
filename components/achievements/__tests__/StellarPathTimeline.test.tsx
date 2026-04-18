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

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => (
      <View testID="svg-root" {...props}>
        {children}
      </View>
    ),
    Svg: ({ children, ...props }: any) => (
      <View testID="svg-root" {...props}>
        {children}
      </View>
    ),
    Path: (props: any) => <View testID="svg-path" {...props} />,
    Ellipse: (props: any) => <View {...props} />,
    Defs: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    RadialGradient: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Stop: (props: any) => <View {...props} />,
    Rect: (props: any) => <View {...props} />,
    Circle: (props: any) => <View {...props} />,
  };
});

import { StellarPathTimeline } from '../StellarPathTimeline';
import { BADGE_DEFINITIONS } from '@/constants/badges/BADGE_DEFINITIONS';
import { computeAchievements } from '@/features/achievements/achievementCalculator';

describe('StellarPathTimeline', () => {
  it('18個のバッジ行がレンダーされる', () => {
    const achievements = computeAchievements(0);
    render(<StellarPathTimeline streak={0} achievements={achievements} />);
    const rows = screen.getAllByTestId(/^badge-orb-row-/);
    expect(rows).toHaveLength(18);
  });

  it('streak=10 のとき、Day ≤ 10 のバッジが unlocked 扱い', () => {
    const achievements = computeAchievements(10);
    render(<StellarPathTimeline streak={10} achievements={achievements} />);
    // Day <= 10 の4個: Stardust(0), Nebula(1), Protostar(3), Ignition(7)
    const unlockedBadges = BADGE_DEFINITIONS.filter((b) => b.day <= 10);
    expect(unlockedBadges).toHaveLength(4);
    for (const badge of unlockedBadges) {
      expect(screen.getByTestId(`badge-orb-row-${badge.id}`)).toBeTruthy();
    }
    // unlocked Orb と locked Orb の数も検証
    expect(screen.getAllByTestId('badge-orb-unlocked')).toHaveLength(4);
    expect(screen.getAllByTestId('badge-orb-locked')).toHaveLength(14);
  });

  it('GravityThread はバッジ数 - 1 個描画される（最後のバッジの後には無い）', () => {
    const achievements = computeAchievements(0);
    render(<StellarPathTimeline streak={0} achievements={achievements} />);
    // GravityThread は Svg + Path で描かれる → mock では svg-path が1つずつ
    const threads = screen.getAllByTestId('svg-path');
    expect(threads).toHaveLength(BADGE_DEFINITIONS.length - 1);
  });
});
