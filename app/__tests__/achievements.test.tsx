import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/components/ui/AuroraBackground', () => {
  const { View } = require('react-native');
  return {
    AuroraBackground: ({ children }: { children: React.ReactNode }) => (
      <View testID="aurora-background">{children}</View>
    ),
  };
});

jest.mock('@/components/ui/StarryOverlay', () => {
  const { View } = require('react-native');
  return { StarryOverlay: () => <View testID="starry-overlay" /> };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { text: '#fff', textSecondary: '#999', background: '#000', primary: '#0af', surface: '#111' },
    isDark: true,
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/hooks/achievements/useAchievements', () => ({
  useAchievements: () => ({
    achievements: [],
    summary: { unlocked: 3, total: 18, percentage: 17 },
    streak: 10,
  }),
}));

jest.mock('@/components/profile/CosmosProgressTimeline', () => {
  const { View } = require('react-native');
  return { CosmosProgressTimeline: () => <View testID="cosmos-timeline" /> };
});

jest.mock('@/components/achievements/AchievementSummaryCircle', () => {
  const { View } = require('react-native');
  return { AchievementSummaryCircle: () => <View testID="summary-circle" /> };
});

import AchievementsScreen from '../achievements';

describe('AchievementsScreen', () => {
  it('AuroraBackgroundでラップされている', () => {
    const { getByTestId } = render(<AchievementsScreen />);
    expect(getByTestId('aurora-background')).toBeTruthy();
  });

  it('StarryOverlayが表示される', () => {
    const { getByTestId } = render(<AchievementsScreen />);
    expect(getByTestId('starry-overlay')).toBeTruthy();
  });

  it('CosmosProgressTimelineが表示される', () => {
    const { getByTestId } = render(<AchievementsScreen />);
    expect(getByTestId('cosmos-timeline')).toBeTruthy();
  });

  it('サマリーが表示される', () => {
    const { getByTestId } = render(<AchievementsScreen />);
    expect(getByTestId('summary-circle')).toBeTruthy();
  });
});
