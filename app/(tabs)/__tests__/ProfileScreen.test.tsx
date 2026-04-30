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

const mockUseWebExtensionStatus = jest.fn();
jest.mock('@/hooks/settings/useWebExtensionStatus', () => ({
  useWebExtensionStatus: () => mockUseWebExtensionStatus(),
}));

const mockOpenSafariSettings = jest.fn();
jest.mock('@/hooks/safariWebExtension/useSafariSettingsDeepLink', () => ({
  useSafariSettingsDeepLink: () => mockOpenSafariSettings,
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

jest.mock('@/components/profile/SafariExtensionAlertCard', () => {
  const { View } = require('react-native');
  return {
    SafariExtensionAlertCard: (props: any) => (
      <View testID="safari-extension-alert-card" {...props} />
    ),
  };
});

jest.mock('@/components/ui/GradientCard', () => {
  const { View } = require('react-native');
  return { GradientCard: ({ children }: any) => <View>{children}</View> };
});

import ProfileScreen from '../profile';

describe('ProfileScreen', () => {
  const mockRecheck = jest.fn();

  beforeEach(() => {
    mockUseWebExtensionStatus.mockReset();
    mockRecheck.mockReset();
    mockUseWebExtensionStatus.mockReturnValue({
      webExtensionStatus: 'active',
      recheck: mockRecheck,
    });
    Platform.OS = 'ios';
  });

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

  it('status=active のとき ToolCard が表示され、警告カードは表示されない', () => {
    mockUseWebExtensionStatus.mockReturnValue({
      webExtensionStatus: 'active',
      recheck: mockRecheck,
    });
    const { getByTestId, queryByTestId } = render(<ProfileScreen />);
    expect(getByTestId('tool-card')).toBeTruthy();
    expect(queryByTestId('safari-extension-alert-card')).toBeNull();
  });

  it('status=never のとき SafariExtensionAlertCard（警告）が表示される', () => {
    mockUseWebExtensionStatus.mockReturnValue({
      webExtensionStatus: 'never',
      recheck: mockRecheck,
    });
    const { getByTestId, queryByTestId } = render(<ProfileScreen />);
    expect(getByTestId('safari-extension-alert-card')).toBeTruthy();
    expect(queryByTestId('tool-card')).toBeNull();
  });

  it('status=needsAllUrls のときも SafariExtensionAlertCard が表示される', () => {
    mockUseWebExtensionStatus.mockReturnValue({
      webExtensionStatus: 'needsAllUrls',
      recheck: mockRecheck,
    });
    const { getByTestId, queryByTestId } = render(<ProfileScreen />);
    expect(getByTestId('safari-extension-alert-card')).toBeTruthy();
    expect(queryByTestId('tool-card')).toBeNull();
  });

  it('status=stale のときは警告ではなく info プロンプトを表示する', () => {
    mockUseWebExtensionStatus.mockReturnValue({
      webExtensionStatus: 'stale',
      recheck: mockRecheck,
    });
    const { getByTestId, queryByTestId } = render(<ProfileScreen />);
    const card = getByTestId('safari-extension-alert-card');
    expect(card.props.variant).toBe('info');
    expect(queryByTestId('tool-card')).toBeNull();
  });

  it('status=stale のとき再確認ボタンを押すと recheck() が呼ばれる', () => {
    mockUseWebExtensionStatus.mockReturnValue({
      webExtensionStatus: 'stale',
      recheck: mockRecheck,
    });
    const { getByTestId } = render(<ProfileScreen />);
    const card = getByTestId('safari-extension-alert-card');
    card.props.onPress();
    expect(mockRecheck).toHaveBeenCalledTimes(1);
  });

  it('status=checking のとき警告は出さない（フラッシュ防止）', () => {
    mockUseWebExtensionStatus.mockReturnValue({
      webExtensionStatus: 'checking',
      recheck: mockRecheck,
    });
    const { queryByTestId } = render(<ProfileScreen />);
    expect(queryByTestId('safari-extension-alert-card')).toBeNull();
  });

  it('Android では ToolCard も警告カードも表示されない', () => {
    Platform.OS = 'android';
    mockUseWebExtensionStatus.mockReturnValue({
      webExtensionStatus: 'never',
      recheck: mockRecheck,
    });
    const { queryByTestId } = render(<ProfileScreen />);
    expect(queryByTestId('tool-card')).toBeNull();
    expect(queryByTestId('safari-extension-alert-card')).toBeNull();
  });

  it('status=never のとき、警告カードは Achievements より後ろに表示される', () => {
    mockUseWebExtensionStatus.mockReturnValue({
      webExtensionStatus: 'never',
      recheck: mockRecheck,
    });
    const { toJSON } = render(<ProfileScreen />);
    const tree = JSON.stringify(toJSON());
    const achievementsIdx = tree.indexOf('"achievements-link-card"');
    const alertIdx = tree.indexOf('"safari-extension-alert-card"');
    expect(achievementsIdx).toBeGreaterThan(-1);
    expect(alertIdx).toBeGreaterThan(-1);
    expect(achievementsIdx).toBeLessThan(alertIdx);
  });
});
