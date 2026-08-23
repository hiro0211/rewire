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

// セレクタ対応にしておかないと `useUserStore((s) => s.hasHydrated)` が
// state オブジェクトそのものを返し、A/B バリアントの確定判定が狂う
jest.mock('@/stores/userStore', () => {
  const state = {
    user: { id: 'u1', isPro: false },
    hasHydrated: true,
    updateUser: jest.fn(),
  };
  const useUserStore = (selector?: (s: any) => any) => (selector ? selector(state) : state);
  useUserStore.getState = () => state;
  return { useUserStore };
});

jest.mock('@/lib/nativeGuard', () => ({
  isExpoGo: true,
}));

jest.mock('@/lib/paywall/discountExpiry', () => ({
  discountExpiry: {
    isDiscountExpired: jest.fn().mockResolvedValue(false),
    recordFirstExposure: jest.fn().mockResolvedValue(undefined),
    EXPIRY_HOURS: 48,
  },
}));

jest.mock('@/hooks/paywall/useDiscountExpiryTracker', () => ({
  useDiscountExpiryTracker: jest.fn(),
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
        // resolvePaywallVariant('u1') を実際に呼んで確かめた値
        paywall_variant: 'cosmicJourney',
      });
    });
  });
});
