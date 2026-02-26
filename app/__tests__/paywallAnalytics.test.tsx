import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: (...args: any[]) => mockLogEvent(...args),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ source: 'onboarding' }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    updateUser: jest.fn(),
  }),
}));

jest.mock('@/lib/nativeGuard', () => ({
  isExpoGo: true,
}));

jest.mock('@/lib/subscription/subscriptionClient', () => ({
  subscriptionClient: {
    isReady: () => false,
    getOfferings: jest.fn(),
  },
}));

import PaywallScreen from '../paywall';

describe('PaywallScreen analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ペイウォール表示時に paywall_viewed イベントが送信される', async () => {
    render(<PaywallScreen />);

    await waitFor(() => {
      expect(mockLogEvent).toHaveBeenCalledWith('paywall_viewed', {
        source: 'onboarding',
        offering: 'default',
      });
    });
  });
});
