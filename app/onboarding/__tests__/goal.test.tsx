import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  useLocalSearchParams: () => ({
    nickname: 'TestUser',
    consentGivenAt: '2025-01-01T00:00:00.000Z',
    notifyTime: '22:00',
  }),
}));

const mockSetUser = jest.fn().mockResolvedValue(undefined);
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    setUser: mockSetUser,
  }),
}));

jest.mock('@/lib/notifications/notificationClient', () => ({
  notificationClient: {
    requestPermissions: jest.fn().mockResolvedValue(true),
    scheduleDailyReminder: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: jest.fn(),
  },
}));

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid-123',
}));

jest.mock('@/components/common/SafeAreaWrapper', () => {
  const { View } = require('react-native');
  return { SafeAreaWrapper: ({ children }: any) => <View>{children}</View> };
});

jest.mock('@/components/onboarding/StarryBackground', () => {
  const { View } = require('react-native');
  return { StarryBackground: ({ children }: any) => <View>{children}</View> };
});

jest.mock('@react-native-picker/picker', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  const Picker = ({ selectedValue, onValueChange, children }: any) => (
    <View testID="picker">{children}</View>
  );
  Picker.Item = ({ label, value }: any) => <Text>{label}</Text>;
  return { Picker };
});

import GoalSettingScreen from '../goal';

describe('GoalSettingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<GoalSettingScreen />)).not.toThrow();
  });

  it('タイトルが表示される', () => {
    const { getByText } = render(<GoalSettingScreen />);
    expect(getByText('目標を設定')).toBeTruthy();
  });

  it('説明文が表示される', () => {
    const { getByText } = render(<GoalSettingScreen />);
    expect(getByText(/何日間.*過ごすことを目指しますか/)).toBeTruthy();
  });

  it('「開始する」ボタンが存在する', () => {
    const { getByText } = render(<GoalSettingScreen />);
    expect(getByText('開始する')).toBeTruthy();
  });

  it('「開始する」ボタンでsetUserが呼ばれる', async () => {
    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid-123',
          nickname: 'TestUser',
          goalDays: 30,
          isPro: false,
          notifyTime: '22:00',
          notifyEnabled: true,
        }),
      );
    });
  });

  it('setUser後にpaywallに遷移する', async () => {
    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/onboarding/benefits',
        params: expect.objectContaining({ source: 'onboarding' }),
      });
    });
  });

  it('setUserが失敗してもクラッシュしない', async () => {
    mockSetUser.mockRejectedValueOnce(new Error('Storage failed'));

    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalled();
    });
    // Should not crash — error is caught
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('Pickerに目標オプションが表示される', () => {
    const { getByTestId } = render(<GoalSettingScreen />);
    expect(getByTestId('picker')).toBeTruthy();
  });
});
