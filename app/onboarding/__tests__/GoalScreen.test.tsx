import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({
    nickname: 'TestUser',
    consentGivenAt: '2026-02-25T00:00:00Z',
    notifyTime: '22:00',
  }),
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, testID, ...props }: any) => (
      <View testID={testID} {...props}>{children}</View>
    ),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    setUser: jest.fn(),
  }),
}));

jest.mock('@/lib/notifications/notificationClient', () => ({
  notificationClient: {
    requestPermissions: jest.fn().mockResolvedValue(true),
    scheduleDailyReminder: jest.fn(),
  },
}));

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid',
}));

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const Picker = ({ children }: any) => <View testID="picker">{children}</View>;
  Picker.Item = ({ label }: any) => <Text>{label}</Text>;
  return { Picker };
});

import GoalSettingScreen from '../goal';

describe('GoalSettingScreen', () => {
  it('testID="starry-background" が存在する', () => {
    const { getByTestId } = render(<GoalSettingScreen />);
    expect(getByTestId('starry-background')).toBeTruthy();
  });

  it('ゴール日数の選択肢が表示される', () => {
    const { getByTestId } = render(<GoalSettingScreen />);
    expect(getByTestId('picker')).toBeTruthy();
  });

  it('"開始する" ボタンが表示される', () => {
    const { getByText } = render(<GoalSettingScreen />);
    expect(getByText('開始する')).toBeTruthy();
  });
});
