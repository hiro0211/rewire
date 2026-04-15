import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/components/ui/AuroraBackground', () => {
  const { View } = require('react-native');
  return {
    AuroraBackground: ({ children }: any) => (
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
    colors: {
      text: '#fff',
      textSecondary: '#999',
      background: '#000',
      primary: '#0af',
      danger: '#f00',
      surface: '#111',
    },
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
    summary: { unlocked: 0, total: 18 },
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34 }),
}));

jest.mock('@/components/profile/ProfileHeader', () => {
  const { View } = require('react-native');
  return { ProfileHeader: () => <View testID="profile-header" /> };
});

jest.mock('@/components/profile/ToolCard', () => {
  const { View } = require('react-native');
  return { ToolCard: () => <View testID="tool-card" /> };
});

jest.mock('@/components/ui/GradientCard', () => {
  const { View } = require('react-native');
  return { GradientCard: ({ children }: any) => <View>{children}</View> };
});

import ProfileScreen from '../profile';

describe('ProfileScreen', () => {
  it('AuroraBackgroundでラップされている', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('aurora-background')).toBeTruthy();
  });

  it('StarryOverlayが表示される', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('starry-overlay')).toBeTruthy();
  });

});
