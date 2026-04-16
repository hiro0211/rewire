import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/components/common/SafeAreaWrapper', () => {
  const { View } = require('react-native');
  return {
    SafeAreaWrapper: ({ children }: any) => (
      <View testID="safe-area-wrapper">{children}</View>
    ),
  };
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
    gradients: { background: ['#0A0A0F', '#1a1a3e', '#2d1b4e'] },
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
  it('SafeAreaWrapperでラップされている', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('safe-area-wrapper')).toBeTruthy();
  });

  it('AuroraBackground / StarryOverlay は使用されない', () => {
    const { queryByTestId } = render(<ProfileScreen />);
    expect(queryByTestId('aurora-background')).toBeNull();
    expect(queryByTestId('aurora-container')).toBeNull();
    expect(queryByTestId('starry-overlay')).toBeNull();
  });
});
