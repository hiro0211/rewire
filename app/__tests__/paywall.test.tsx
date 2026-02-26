import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: (...args: any[]) => mockLogEvent(...args) },
}));

const mockReplace = jest.fn();
const mockDismiss = jest.fn();
const mockBack = jest.fn();
let mockSource: string | undefined = 'onboarding';
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, dismiss: mockDismiss, back: mockBack }),
  useLocalSearchParams: () => ({ source: mockSource }),
}));

const mockUpdateUser = jest.fn().mockResolvedValue(undefined);
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ updateUser: mockUpdateUser }),
}));

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

jest.mock('@/lib/subscription/subscriptionClient', () => ({
  subscriptionClient: {
    isReady: () => false,
    getOfferings: jest.fn().mockResolvedValue([]),
  },
}));

import PaywallScreen from '../paywall';

describe('PaywallScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSource = 'onboarding';
  });

  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<PaywallScreen />)).not.toThrow();
  });

  it('マウント時にpaywall_viewedイベントが送信される', async () => {
    render(<PaywallScreen />);
    await waitFor(() => {
      expect(mockLogEvent).toHaveBeenCalledWith('paywall_viewed', expect.objectContaining({
        source: 'onboarding',
      }));
    });
  });

  it('RevenueCat未接続時にフォールバックUIが表示される', async () => {
    const { findByText } = render(<PaywallScreen />);
    expect(await findByText('現在ご利用いただけません')).toBeTruthy();
  });

  it('オンボーディングからの場合、フォールバックに「戻る」ボタンがない', async () => {
    mockSource = 'onboarding';
    const { findByText, queryByText } = render(<PaywallScreen />);
    await findByText('現在ご利用いただけません');
    expect(queryByText('戻る')).toBeNull();
  });

  it('設定からの場合、フォールバックに「戻る」ボタンがある', async () => {
    mockSource = 'settings';
    const { findByText } = render(<PaywallScreen />);
    expect(await findByText('戻る')).toBeTruthy();
  });

  it('「戻る」ボタンでrouter.dismiss()が呼ばれる', async () => {
    mockSource = 'settings';
    const { findByText } = render(<PaywallScreen />);
    const backButton = await findByText('戻る');
    fireEvent.press(backButton);
    expect(mockDismiss).toHaveBeenCalled();
  });

  it('「再試行」ボタンがフォールバックに表示される', async () => {
    const { findByText } = render(<PaywallScreen />);
    expect(await findByText('再試行')).toBeTruthy();
  });

  it('source=undefinedでもクラッシュしない', () => {
    mockSource = undefined;
    expect(() => render(<PaywallScreen />)).not.toThrow();
  });

  it('オンボーディングからの場合「あとで試す」ボタンが表示される', async () => {
    mockSource = 'onboarding';
    const { findByText } = render(<PaywallScreen />);
    expect(await findByText('あとで試す')).toBeTruthy();
  });

  it('「あとで試す」ボタンで/(tabs)に遷移する', async () => {
    mockSource = 'onboarding';
    const { findByText } = render(<PaywallScreen />);
    const button = await findByText('あとで試す');
    fireEvent.press(button);
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('非オンボーディングでは「戻る」ボタンでdismissが呼ばれる', async () => {
    mockSource = 'settings';
    const { findByText } = render(<PaywallScreen />);
    const button = await findByText('戻る');
    fireEvent.press(button);
    expect(mockDismiss).toHaveBeenCalled();
  });

  it('「再試行」ボタンでリロードが発生する', async () => {
    const { findByText, findAllByText } = render(<PaywallScreen />);
    const retryButton = await findByText('再試行');
    fireEvent.press(retryButton);
    // After retry, should show loading then fallback again (since still unavailable)
    expect(await findByText('再試行')).toBeTruthy();
  });

  it('paywall_viewedイベントにofferingが含まれる', async () => {
    render(<PaywallScreen />);
    await waitFor(() => {
      expect(mockLogEvent).toHaveBeenCalledWith('paywall_viewed', {
        source: 'onboarding',
        offering: 'default',
      });
    });
  });
});
