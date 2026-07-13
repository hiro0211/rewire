import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Platform, Linking } from 'react-native';
import * as StoreReview from 'expo-store-review';

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

const mockUpdateUser = jest.fn().mockResolvedValue(undefined);
const mockReset = jest.fn().mockResolvedValue(undefined);
let mockUser: any = {
  nickname: 'TestUser',
  goalDays: 30,
  isPro: true,
  notifyEnabled: true,
  notifyTime: '22:00',
  streakStartDate: '2025-01-01',
};

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: mockUser,
    updateUser: mockUpdateUser,
    reset: mockReset,
  }),
}));

const mockRequestPermissions = jest.fn().mockResolvedValue(true);
const mockScheduleDailyReminder = jest.fn().mockResolvedValue(undefined);
const mockCancelAllNotifications = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/notifications/notificationClient', () => ({
  notificationClient: {
    requestPermissions: () => mockRequestPermissions(),
    scheduleDailyReminder: (t: string) => mockScheduleDailyReminder(t),
    cancelAllNotifications: () => mockCancelAllNotifications(),
  },
}));

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

jest.mock('@/components/settings/SettingItem', () => {
  const { TouchableOpacity, Text, Switch, View } = require('react-native');
  return {
    SettingItem: ({ label, value, onPress, destructive, type, toggleValue, onToggle }: any) => (
      <View>
        {type === 'toggle' ? (
          <View>
            <Text>{label}</Text>
            <Switch testID={`toggle-${label}`} value={toggleValue} onValueChange={onToggle} />
          </View>
        ) : (
          <TouchableOpacity testID={`setting-${label}`} onPress={onPress}>
            <Text>{label}</Text>
            {value && <Text>{value}</Text>}
          </TouchableOpacity>
        )}
      </View>
    ),
  };
});

jest.mock('@/components/settings/SettingSection', () => {
  const { View, Text } = require('react-native');
  return {
    SettingSection: ({ title, children }: any) => (
      <View><Text>{title}</Text>{children}</View>
    ),
  };
});

let mockDebugEnabled = true;
jest.mock('@/constants/debug', () => ({
  get DEBUG_MENU_ENABLED() {
    return mockDebugEnabled;
  },
}));

jest.mock('@/components/settings/ProfileEditModal', () => {
  const { View } = require('react-native');
  return { ProfileEditModal: () => <View /> };
});

jest.mock('@/components/settings/TimePickerModal', () => {
  const { View } = require('react-native');
  return { TimePickerModal: () => <View /> };
});

jest.mock('@/stores/themeStore', () => ({
  useThemeStore: Object.assign(
    (selector: any) => selector({ themePreference: 'dark' }),
    { getState: () => ({ themePreference: 'dark', setThemePreference: jest.fn() }) }
  ),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: require('@/constants/colorPalettes').DARK_COLORS,
    gradients: require('@/constants/colorPalettes').DARK_GRADIENTS,
    glow: require('@/constants/colorPalettes').DARK_GLOW,
    shadows: require('@/constants/colorPalettes').DARK_SHADOWS,
    mode: 'dark',
    isDark: true,
  }),
}));

jest.mock('@/components/settings/ThemePickerModal', () => {
  const { View } = require('react-native');
  return { ThemePickerModal: () => <View /> };
});

jest.mock('@/lib/subscription/subscriptionClient', () => ({
  subscriptionClient: { isReady: () => false },
}));

import SettingsScreen from '../settings';

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDebugEnabled = true;
    mockUser = {
      nickname: 'TestUser',
      goalDays: 30,
      isPro: true,
      notifyEnabled: true,
      notifyTime: '22:00',
      streakStartDate: '2025-01-01',
    };
  });

  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });

  it('ユーザーがnullの場合はnullを返す', () => {
    mockUser = null;
    const { toJSON } = render(<SettingsScreen />);
    expect(toJSON()).toBeNull();
  });

  it('ユーザーのニックネームが表示される', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('TestUser')).toBeTruthy();
  });

  it('目標日数が表示される', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('30日')).toBeTruthy();
  });

  it('バージョン情報が表示される', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText(/^Version /)).toBeTruthy();
  });

  it('データリセットボタンが存在する', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('データをリセット')).toBeTruthy();
  });

  it('リセットボタンタップでAlertが表示される', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByTestId } = render(<SettingsScreen />);
    fireEvent.press(getByTestId('setting-データをリセット'));
    expect(alertSpy).toHaveBeenCalledWith(
      'データをリセット',
      expect.any(String),
      expect.any(Array),
    );
  });

  it('リセット確認後にreset()とrouter.replace(/onboarding)が呼ばれる', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByTestId } = render(<SettingsScreen />);
    fireEvent.press(getByTestId('setting-データをリセット'));

    // Get the destructive button callback
    const buttons = alertSpy.mock.calls[0][2] as any[];
    const destructiveButton = buttons.find((b: any) => b.style === 'destructive');
    await destructiveButton.onPress();

    expect(mockReset).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('サブスクリプション管理が存在する', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('サブスクリプション管理')).toBeTruthy();
  });

  it('RevenueCatUI未接続時にサブスク管理タップでApp Storeに遷移する', async () => {
    const linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    const { getByTestId } = render(<SettingsScreen />);
    await fireEvent.press(getByTestId('setting-サブスクリプション管理'));
    expect(linkingSpy).toHaveBeenCalledWith('https://apps.apple.com/account/subscriptions');
    linkingSpy.mockRestore();
  });

  it('通知セクションが表示される', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('通知')).toBeTruthy();
  });

  it('サポートセクションのリンクが表示される', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('お問い合わせ')).toBeTruthy();
    expect(getByText('利用規約')).toBeTruthy();
    expect(getByText('プライバシーポリシー')).toBeTruthy();
  });

  describe('About セクション', () => {
    it('About セクション見出しが表示される', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('アプリについて')).toBeTruthy();
    });

    it('クレジット項目が表示される', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('クレジット')).toBeTruthy();
    });

    it('クレジット項目タップで router.push("/credits") が呼ばれる', () => {
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('setting-クレジット'));
      expect(mockPush).toHaveBeenCalledWith('/credits');
    });
  });

  describe('デバッグセクション', () => {
    it('DEBUG_MENU_ENABLED が true のとき「オンボーディングをもう一度見る」が表示される', () => {
      mockDebugEnabled = true;
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('オンボーディングをもう一度見る')).toBeTruthy();
    });

    it('項目タップで router.push("/onboarding") が呼ばれる', () => {
      mockDebugEnabled = true;
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('setting-オンボーディングをもう一度見る'));
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });

    it('「購入後オンボーディングをもう一度見る」が表示される', () => {
      mockDebugEnabled = true;
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('購入後オンボーディングをもう一度見る')).toBeTruthy();
    });

    it('購入後オンボーディング項目タップで router.push("/post-purchase-onboarding") が呼ばれる', () => {
      mockDebugEnabled = true;
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(
        getByTestId('setting-購入後オンボーディングをもう一度見る'),
      );
      expect(mockPush).toHaveBeenCalledWith('/post-purchase-onboarding');
    });

    it('DEBUG_MENU_ENABLED が false のときは表示されない', () => {
      mockDebugEnabled = false;
      const { queryByText } = render(<SettingsScreen />);
      expect(queryByText('オンボーディングをもう一度見る')).toBeNull();
      expect(queryByText('購入後オンボーディングをもう一度見る')).toBeNull();
    });
  });

  describe('アプリを評価する', () => {
    it('iOSで「アプリを評価する」項目が表示される', () => {
      Platform.OS = 'ios';
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('アプリを評価する')).toBeTruthy();
    });

    it('タップ時にrequestReviewが呼ばれる', async () => {
      Platform.OS = 'ios';
      const requestReviewSpy = jest.spyOn(StoreReview, 'requestReview').mockResolvedValue(undefined);
      const { getByTestId } = render(<SettingsScreen />);
      await fireEvent.press(getByTestId('setting-アプリを評価する'));
      expect(requestReviewSpy).toHaveBeenCalled();
      requestReviewSpy.mockRestore();
    });
  });
});
