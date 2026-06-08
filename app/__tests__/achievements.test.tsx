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

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    canGoBack: () => true,
    replace: jest.fn(),
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { text: '#fff', textSecondary: '#999', background: '#000', primary: '#0af', surface: '#111' },
    isDark: true,
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    isJapanese: true,
  }),
}));

jest.mock('@/hooks/achievements/useAchievements', () => ({
  useAchievements: () => ({
    achievements: [],
    summary: { unlocked: 3, total: 18, percentage: 17 },
    streak: 10,
  }),
}));

jest.mock('@/components/achievements/StellarPathTimeline', () => {
  const { View } = require('react-native');
  return { StellarPathTimeline: () => <View testID="stellar-path-timeline" /> };
});

jest.mock('@/components/achievements/AchievementSummaryCircle', () => {
  const { View } = require('react-native');
  return { AchievementSummaryCircle: () => <View testID="summary-circle" /> };
});

jest.mock('@/components/achievements/AchievementsHeader', () => {
  const { View } = require('react-native');
  return { AchievementsHeader: () => <View testID="achievements-header" /> };
});

const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

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

  it('AchievementsHeaderが表示される', () => {
    const { getByTestId } = render(<AchievementsScreen />);
    expect(getByTestId('achievements-header')).toBeTruthy();
  });

  it('StellarPathTimelineが表示される', () => {
    const { getByTestId } = render(<AchievementsScreen />);
    expect(getByTestId('stellar-path-timeline')).toBeTruthy();
  });

  it('サマリーが表示される', () => {
    const { getByTestId } = render(<AchievementsScreen />);
    expect(getByTestId('summary-circle')).toBeTruthy();
  });

  it('表示時に achievements_opened を送信する', () => {
    mockTrackEvent.mockClear();
    render(<AchievementsScreen />);
    expect(mockTrackEvent).toHaveBeenCalledWith('achievements_opened');
  });
});
