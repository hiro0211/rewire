import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: (...args: any[]) => mockLogEvent(...args),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), replace: jest.fn() }),
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

jest.mock('@/hooks/breathing/useBreathingEngine', () => ({
  useBreathingEngine: () => ({
    phase: 'inhale',
    cycleCount: 1,
    startSession: jest.fn(),
    stopSession: jest.fn(),
  }),
}));

jest.mock('@/components/breathing/BreathingCircle', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { BreathingCircle: () => <View /> };
});

jest.mock('@/components/breathing/BreathingText', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { BreathingText: () => <View /> };
});

jest.mock('@/components/breathing/CycleIndicator', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { CycleIndicator: () => <View /> };
});

jest.mock('@/stores/breathStore', () => ({
  useBreathStore: () => ({
    addSession: jest.fn(),
  }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: { id: 'test-user' },
  }),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid',
}));

jest.mock('@/components/common/SafeAreaWrapper', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaWrapper: ({ children }: any) => <View>{children}</View>,
  };
});

import BreathingScreen from '../index';
import BreathingAskScreen from '../ask';

describe('BreathingScreen analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('呼吸エクササイズ開始時に breathing_started イベントが送信される', () => {
    render(<BreathingScreen />);
    expect(mockLogEvent).toHaveBeenCalledWith('breathing_started');
  });
});

describe('BreathingAskScreen analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('「はい」押下時に breathing_completed イベントが送信される', async () => {
    const { getByText } = render(<BreathingAskScreen />);
    fireEvent.press(getByText('はい'));

    await waitFor(() => {
      expect(mockLogEvent).toHaveBeenCalledWith('breathing_completed', {
        urge_resolved: true,
      });
    });
  });

  it('「いいえ」押下時に breathing_completed イベントが送信される', async () => {
    const { getByText } = render(<BreathingAskScreen />);
    fireEvent.press(getByText('いいえ（もう一度）'));

    await waitFor(() => {
      expect(mockLogEvent).toHaveBeenCalledWith('breathing_completed', {
        urge_resolved: false,
      });
    });
  });
});
