import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: (...args: any[]) => mockLogEvent(...args),
  },
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: { id: 'test-user' },
  }),
}));

jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: () => ({
    todayCheckin: { id: 'checkin-1' },
  }),
}));

jest.mock('@/features/recovery/recoveryService', () => ({
  recoveryService: {
    saveRecovery: jest.fn(),
  },
}));

jest.mock('@/components/recovery/TriggerSelector', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return {
    TriggerSelector: ({ onSelect }: any) => (
      <TouchableOpacity onPress={() => onSelect('boredom')} testID="trigger-btn">
        <Text>Select Trigger</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/components/recovery/NextActionList', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { NextActionList: () => <View /> };
});

jest.mock('@/components/common/SafeAreaWrapper', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaWrapper: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock('@/components/ads/BannerAdView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { BannerAdView: () => <View /> };
});

jest.mock('@/lib/ads/adConfig', () => ({
  AD_UNIT_IDS: { BANNER_RECOVERY: 'test-ad-id' },
}));

import RecoveryScreen from '../index';

describe('RecoveryScreen analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('トリガー選択時に recovery_trigger_selected イベントが送信される', async () => {
    const { getByTestId } = render(<RecoveryScreen />);
    fireEvent.press(getByTestId('trigger-btn'));

    await waitFor(() => {
      expect(mockLogEvent).toHaveBeenCalledWith('recovery_trigger_selected', {
        trigger: 'boredom',
      });
    });
  });
});
