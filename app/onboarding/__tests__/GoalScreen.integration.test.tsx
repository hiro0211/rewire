import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => ({
    nickname: 'TestUser',
    consentGivenAt: '2026-02-26T00:00:00Z',
    notifyTime: '21:00',
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

const mockSetUser = jest.fn().mockResolvedValue(undefined);
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ setUser: mockSetUser }),
}));

const mockRequestPermissions = jest.fn().mockResolvedValue(true);
const mockScheduleReminder = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/notifications/notificationClient', () => ({
  notificationClient: {
    requestPermissions: (...args: any[]) => mockRequestPermissions(...args),
    scheduleDailyReminder: (...args: any[]) => mockScheduleReminder(...args),
  },
}));

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid-123',
}));

const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: (...args: any[]) => mockLogEvent(...args) },
}));

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const Picker = ({ children }: any) => <View testID="picker">{children}</View>;
  Picker.Item = ({ label }: any) => <Text>{label}</Text>;
  return { Picker };
});

import GoalSettingScreen from '../goal';

describe('GoalScreen integration - handleFinish', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('「開始する」ボタン押下でsetUserに正しいuserオブジェクトを渡す', async () => {
    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid-123',
          nickname: 'TestUser',
          goalDays: 30,
          isPro: false,
          notifyTime: '21:00',
          notifyEnabled: true,
          consentGivenAt: '2026-02-26T00:00:00Z',
          ageVerifiedAt: null,
        }),
      );
    });
  });

  it('setUser完了後に通知権限を要求する', async () => {
    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockRequestPermissions).toHaveBeenCalled();
    });
  });

  it('通知許可時にリマインダーをスケジュールする', async () => {
    mockRequestPermissions.mockResolvedValue(true);
    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockScheduleReminder).toHaveBeenCalledWith('21:00');
    });
  });

  it('通知拒否時はリマインダーをスケジュールしない', async () => {
    mockRequestPermissions.mockResolvedValue(false);
    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockRequestPermissions).toHaveBeenCalled();
    });
    expect(mockScheduleReminder).not.toHaveBeenCalled();
  });

  it('/paywall?source=onboardingに遷移する', async () => {
    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/paywall',
        params: { source: 'onboarding' },
      });
    });
  });

  it('onboarding_completeイベントをログする', async () => {
    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockLogEvent).toHaveBeenCalledWith('onboarding_complete', { goal_days: 30 });
    });
  });

  it('setUserエラー時もクラッシュしない', async () => {
    mockSetUser.mockRejectedValueOnce(new Error('Storage full'));
    const { getByText } = render(<GoalSettingScreen />);

    expect(() => fireEvent.press(getByText('開始する'))).not.toThrow();

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalled();
    });
    // navigation should not happen on error
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
