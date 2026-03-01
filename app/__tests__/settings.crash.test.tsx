import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Platform, Linking, Alert } from 'react-native';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

jest.mock('@/lib/contentBlocker/contentBlockerBridge', () => ({
  contentBlockerBridge: {
    getBlockerStatus: jest.fn().mockResolvedValue({ isEnabled: false }),
  },
}));

jest.mock('@/lib/notifications/notificationClient', () => ({
  notificationClient: {
    requestPermissions: jest.fn().mockResolvedValue(false),
    scheduleDailyReminder: jest.fn(),
    cancelAllNotifications: jest.fn(),
  },
}));

jest.mock('@/components/settings/ProfileEditModal', () => {
  const { View } = require('react-native');
  return { ProfileEditModal: (props: any) => <View testID="profile-modal" /> };
});

jest.mock('@/components/settings/TimePickerModal', () => {
  const { View } = require('react-native');
  return { TimePickerModal: (props: any) => <View testID="time-modal" /> };
});

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

jest.mock('@/components/Themed', () => {
  const { Text } = require('react-native');
  return { Text };
});

let mockUser: any = null;
const mockUpdateUser = jest.fn().mockResolvedValue(undefined);
const mockReset = jest.fn().mockResolvedValue(undefined);
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ user: mockUser, updateUser: mockUpdateUser, reset: mockReset }),
}));

import SettingsScreen from '../settings';

describe('SettingsScreen crash prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('user=null → 何もレンダリングしない（クラッシュしない）', () => {
    mockUser = null;
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });

  it('user=最小限のフィールド → クラッシュしない', () => {
    mockUser = { nickname: 'Test', goalDays: 30 };
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });

  it('user.notifyEnabled=true, notifyTime=undefined → クラッシュしない', () => {
    mockUser = { nickname: 'Test', goalDays: 30, notifyEnabled: true, notifyTime: undefined };
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });

  it('user.notifyEnabled=false → 通知時間セクション非表示', () => {
    mockUser = { nickname: 'Test', goalDays: 30, notifyEnabled: false };
    const { queryByText } = render(<SettingsScreen />);
    expect(queryByText('通知時間')).toBeNull();
  });

  it('user.notifyEnabled=true, notifyTime=有効 → 通知時間セクション表示', () => {
    mockUser = { nickname: 'Test', goalDays: 30, notifyEnabled: true, notifyTime: '22:00' };
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('通知時間')).toBeTruthy();
  });

  it('全フィールド揃ったuser → 正常レンダリング', () => {
    mockUser = {
      id: 'user-1',
      nickname: 'TestUser',
      goalDays: 90,
      notifyEnabled: true,
      notifyTime: '21:00',
      isPro: true,
      createdAt: '2026-01-01T00:00:00Z',
      streakStartDate: '2026-02-01T00:00:00Z',
    };
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('ニックネーム')).toBeTruthy();
    expect(getByText('目標日数')).toBeTruthy();
  });

  it('goalDays=0 → クラッシュしない', () => {
    mockUser = { nickname: 'Test', goalDays: 0 };
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });
});

describe('SettingsScreen iPad / subscription management crash prevention', () => {
  const originalIsPad = Platform.isPad;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { nickname: 'Test', goalDays: 30, isPro: false };
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'isPad', { value: originalIsPad, writable: true });
  });

  it('iPad環境でサブスクリプション管理ボタンタップ → クラッシュしない', async () => {
    Object.defineProperty(Platform, 'isPad', { value: true, writable: true });
    const linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);

    const { getByTestId } = render(<SettingsScreen />);
    await fireEvent.press(getByTestId('setting-サブスクリプション管理'));

    expect(linkingSpy).toHaveBeenCalledWith('https://apps.apple.com/account/subscriptions');
    linkingSpy.mockRestore();
  });

  it('iPadでPlatform.isPad=true → Apple URLが開かれる（presentCustomerCenter不使用）', async () => {
    Object.defineProperty(Platform, 'isPad', { value: true, writable: true });
    const linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);

    const { getByTestId } = render(<SettingsScreen />);
    await fireEvent.press(getByTestId('setting-サブスクリプション管理'));

    expect(linkingSpy).toHaveBeenCalledTimes(1);
    expect(linkingSpy).toHaveBeenCalledWith('https://apps.apple.com/account/subscriptions');
    linkingSpy.mockRestore();
  });

  it('RevenueCatUI=null（isExpoGo）の場合 → フォールバック動作', async () => {
    Object.defineProperty(Platform, 'isPad', { value: false, writable: true });
    const linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);

    const { getByTestId } = render(<SettingsScreen />);
    await fireEvent.press(getByTestId('setting-サブスクリプション管理'));

    // isExpoGoのためRevenueCatUI=null → フォールバック
    expect(linkingSpy).toHaveBeenCalledWith('https://apps.apple.com/account/subscriptions');
    linkingSpy.mockRestore();
  });

  it('subscriptionClient未初期化 → フォールバック', async () => {
    Object.defineProperty(Platform, 'isPad', { value: false, writable: true });
    const linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);

    const { getByTestId } = render(<SettingsScreen />);
    await fireEvent.press(getByTestId('setting-サブスクリプション管理'));

    // subscriptionClient.isReady()=false → フォールバック
    expect(linkingSpy).toHaveBeenCalledWith('https://apps.apple.com/account/subscriptions');
    linkingSpy.mockRestore();
  });

  it('iPad + user=null → クラッシュしない', () => {
    Object.defineProperty(Platform, 'isPad', { value: true, writable: true });
    mockUser = null;
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });
});
