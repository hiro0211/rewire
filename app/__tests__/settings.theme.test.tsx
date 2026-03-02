import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

const mockUpdateUser = jest.fn().mockResolvedValue(undefined);
const mockReset = jest.fn().mockResolvedValue(undefined);
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: {
      nickname: 'TestUser',
      goalDays: 30,
      isPro: false,
      notifyEnabled: false,
      notifyTime: '22:00',
      streakStartDate: '2025-01-01',
    },
    updateUser: mockUpdateUser,
    reset: mockReset,
  }),
}));

const mockSetThemePreference = jest.fn().mockResolvedValue(undefined);
jest.mock('@/stores/themeStore', () => ({
  useThemeStore: Object.assign(
    (selector: any) => selector({ themePreference: mockThemePreference }),
    {
      getState: () => ({
        themePreference: mockThemePreference,
        setThemePreference: mockSetThemePreference,
      }),
    }
  ),
}));

let mockThemePreference = 'dark';

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

jest.mock('@/lib/notifications/notificationClient', () => ({
  notificationClient: {
    requestPermissions: jest.fn().mockResolvedValue(true),
    scheduleDailyReminder: jest.fn(),
    cancelAllNotifications: jest.fn(),
  },
}));

jest.mock('@/lib/contentBlocker/contentBlockerBridge', () => ({
  contentBlockerBridge: {
    getBlockerStatus: jest.fn().mockResolvedValue({ isEnabled: true }),
  },
}));

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

jest.mock('@/lib/subscription/subscriptionClient', () => ({
  subscriptionClient: { isReady: () => false },
}));

jest.mock('@/components/settings/SettingItem', () => {
  const { TouchableOpacity, Text, Switch, View } = require('react-native');
  return {
    SettingItem: ({ label, value, onPress, type, toggleValue, onToggle }: any) => (
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

jest.mock('@/components/settings/ProfileEditModal', () => {
  const { View } = require('react-native');
  return { ProfileEditModal: () => <View /> };
});

jest.mock('@/components/settings/TimePickerModal', () => {
  const { View } = require('react-native');
  return { TimePickerModal: () => <View /> };
});

jest.mock('@/components/settings/ThemePickerModal', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    ThemePickerModal: ({ visible, onSelect, onClose }: any) => {
      if (!visible) return null;
      return (
        <View testID="theme-picker-modal">
          <TouchableOpacity onPress={() => onSelect('system')}>
            <Text>システム設定に合わせる</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSelect('light')}>
            <Text>ライトモード</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSelect('dark')}>
            <Text>ダークモード</Text>
          </TouchableOpacity>
        </View>
      );
    },
  };
});

import SettingsScreen from '../settings';

describe('Settings - テーマ選択', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockThemePreference = 'dark';
  });

  it('外観セクションが表示される', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('外観')).toBeTruthy();
  });

  it('テーマ項目にダークモードと表示される', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('ダークモード')).toBeTruthy();
  });

  it('テーマ項目タップでモーダルが表示される', () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText('テーマ'));
    expect(getByText('システム設定に合わせる')).toBeTruthy();
    expect(getByText('ライトモード')).toBeTruthy();
  });
});
