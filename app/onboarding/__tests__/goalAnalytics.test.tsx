import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: (...args: any[]) => mockLogEvent(...args),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useLocalSearchParams: () => ({
    nickname: 'TestUser',
    consentGivenAt: '2025-01-01',
    notifyTime: '22:00',
  }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    setUser: jest.fn(),
  }),
}));

jest.mock('@/lib/notifications/notificationClient', () => ({
  notificationClient: {
    requestPermissions: jest.fn().mockResolvedValue(false),
    scheduleDailyReminder: jest.fn(),
  },
}));

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid',
}));

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Picker: Object.assign(
      ({ children, ...props }: any) => <View {...props}>{children}</View>,
      { Item: ({ label, value }: any) => null }
    ),
  };
});

jest.mock('@/components/onboarding/StarryBackground', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    StarryBackground: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock('@/components/common/SafeAreaWrapper', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaWrapper: ({ children }: any) => <View>{children}</View>,
  };
});

import GoalSettingScreen from '../goal';

describe('GoalSettingScreen analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('目標設定完了時に onboarding_complete イベントが送信される', async () => {
    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockLogEvent).toHaveBeenCalledWith('onboarding_complete', {
        goal_days: 30,
      });
    });
  });
});
