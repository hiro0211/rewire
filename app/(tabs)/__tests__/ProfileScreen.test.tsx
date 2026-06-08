import React from 'react';
import { Platform } from 'react-native';
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
    shadows: {
      small: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 2 },
      medium: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 4 },
      glowCard: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
      sheet: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 16 },
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

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34 }),
}));

jest.mock('@/components/profile/ProfileHeader', () => {
  const { View } = require('react-native');
  return { ProfileHeader: () => <View testID="profile-header" /> };
});

jest.mock('@/components/profile/AchievementsLinkCard', () => {
  const { View } = require('react-native');
  return {
    AchievementsLinkCard: (props: any) => (
      <View testID="achievements-link-card" {...props} />
    ),
  };
});

jest.mock('@/components/screen-time/ContentBlockerPanel', () => {
  const { View } = require('react-native');
  return { ContentBlockerPanel: () => <View testID="content-blocker-panel" /> };
});

jest.mock('@/components/screen-time/UninstallLockCard', () => {
  const { View } = require('react-native');
  return { UninstallLockCard: () => <View testID="uninstall-lock-card" /> };
});

import ProfileScreen from '../profile';

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  it('SafeAreaWrapper でラップされている', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('safe-area-wrapper')).toBeTruthy();
  });

  it('ProfileHeader が描画される', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('profile-header')).toBeTruthy();
  });

  it('AchievementsLinkCard が描画される', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('achievements-link-card')).toBeTruthy();
  });

  it('iOS では ContentBlockerPanel と UninstallLockCard が描画される', () => {
    Platform.OS = 'ios';
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('content-blocker-panel')).toBeTruthy();
    expect(getByTestId('uninstall-lock-card')).toBeTruthy();
  });

  it('Android では ContentBlockerPanel と UninstallLockCard は非表示', () => {
    Platform.OS = 'android';
    const { queryByTestId } = render(<ProfileScreen />);
    expect(queryByTestId('content-blocker-panel')).toBeNull();
    expect(queryByTestId('uninstall-lock-card')).toBeNull();
  });

  it('Safari 関連 UI は描画されない（削除済み）', () => {
    const { queryByTestId } = render(<ProfileScreen />);
    expect(queryByTestId('safari-extension-alert-card')).toBeNull();
    expect(queryByTestId('tool-card')).toBeNull();
  });
});
