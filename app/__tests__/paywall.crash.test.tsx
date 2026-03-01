import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: (...args: any[]) => mockLogEvent(...args) },
}));

const mockReplace = jest.fn();
const mockDismiss = jest.fn();
let mockSource: string | undefined = 'onboarding';
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, dismiss: mockDismiss }),
  useLocalSearchParams: () => ({ source: mockSource }),
}));

const mockUpdateUser = jest.fn().mockResolvedValue(undefined);
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ updateUser: mockUpdateUser, user: { nickname: 'Test', goalDays: 30 } }),
}));

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

jest.mock('@/lib/paywall/discountExpiry', () => ({
  discountExpiry: {
    isDiscountExpired: jest.fn().mockResolvedValue(false),
    getRemainingSeconds: jest.fn().mockResolvedValue(86400),
    recordFirstExposure: jest.fn().mockResolvedValue(undefined),
    EXPIRY_HOURS: 24,
  },
}));

jest.mock('@/hooks/paywall/useDiscountExpiryTracker', () => ({
  useDiscountExpiryTracker: jest.fn(),
}));

jest.mock('@/lib/subscription/subscriptionClient', () => ({
  subscriptionClient: {
    isReady: () => false,
    initialize: jest.fn().mockResolvedValue(undefined),
    getOfferings: jest.fn().mockResolvedValue([]),
  },
}));

import PaywallScreen from '../paywall';

describe('PaywallScreen crash prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSource = 'onboarding';
  });

  it('Purchases=null → unavailable表示、クラッシュしない', async () => {
    // isExpoGo=trueなのでPurchases=null
    const { findByText } = render(<PaywallScreen />);
    expect(await findByText('現在ご利用いただけません')).toBeTruthy();
  });

  it('source=undefined → クラッシュしない', () => {
    mockSource = undefined;
    expect(() => render(<PaywallScreen />)).not.toThrow();
  });

  it('source=settings → クラッシュしない', () => {
    mockSource = 'settings';
    expect(() => render(<PaywallScreen />)).not.toThrow();
  });

  it('isFromOnboarding=true でunavailable時の「あとで試す」 → クラッシュしない', async () => {
    mockSource = 'onboarding';
    const { findByText } = render(<PaywallScreen />);
    const button = await findByText('あとで試す');
    fireEvent.press(button);
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('isFromOnboarding=false でunavailable時の「戻る」 → router.dismiss()呼び出し', async () => {
    mockSource = 'settings';
    const { findByText } = render(<PaywallScreen />);
    const button = await findByText('戻る');
    fireEvent.press(button);
    expect(mockDismiss).toHaveBeenCalled();
  });

  it('再試行ボタン → クラッシュしない', async () => {
    const { findByText } = render(<PaywallScreen />);
    const retryButton = await findByText('再試行');
    fireEvent.press(retryButton);
    // 再試行後もunavailableのまま（Purchases=null）
    expect(await findByText('現在ご利用いただけません')).toBeTruthy();
  });

  it('Purchases=null + source=onboarding → unavailableにfallback', async () => {
    mockSource = 'onboarding';
    const { findByText, queryByText } = render(<PaywallScreen />);
    await findByText('現在ご利用いただけません');
    // 「戻る」ではなく「あとで試す」が表示される
    expect(queryByText('戻る')).toBeNull();
    expect(await findByText('あとで試す')).toBeTruthy();
  });

  it('繰り返し再試行してもクラッシュしない', async () => {
    const { findByText } = render(<PaywallScreen />);
    for (let i = 0; i < 3; i++) {
      const retryButton = await findByText('再試行');
      fireEvent.press(retryButton);
      await findByText('現在ご利用いただけません');
    }
  });
});
