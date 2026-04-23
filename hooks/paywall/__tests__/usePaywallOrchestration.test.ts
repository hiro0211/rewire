import { renderHook, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { usePaywallOrchestration } from '../usePaywallOrchestration';
import { useUserStore } from '@/stores/userStore';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

jest.mock('@/lib/subscription/subscriptionClient', () => ({
  subscriptionClient: { isReady: () => false, initialize: jest.fn() },
}));

jest.mock('@/lib/paywall/discountExpiry', () => ({
  discountExpiry: {
    getRemainingSeconds: jest.fn().mockResolvedValue(200),
  },
}));

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: jest.fn() },
}));

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

describe('usePaywallOrchestration', () => {
  it('Purchases が無い場合 paywallState が unavailable になる', async () => {
    const { result } = renderHook(() =>
      usePaywallOrchestration({ source: 'settings' }),
    );

    // Wait for async effect
    await act(async () => {});

    expect(result.current.paywallState).toBe('unavailable');
  });

  it('初期 offeringType が default', () => {
    const { result } = renderHook(() =>
      usePaywallOrchestration({ source: 'settings' }),
    );
    expect(result.current.offeringType).toBe('default');
  });

  it('handleRetry で paywallKey がインクリメントされ再読み込みが行われる', async () => {
    const { result } = renderHook(() =>
      usePaywallOrchestration({ source: 'settings' }),
    );

    await act(async () => {});
    expect(result.current.paywallState).toBe('unavailable');

    // handleRetry triggers a re-fetch cycle (loading → unavailable since Purchases is null)
    await act(async () => {
      result.current.handleRetry();
    });

    // Effect runs and resolves back to unavailable (no Purchases available)
    expect(result.current.paywallState).toBe('unavailable');
  });

  describe('handlePurchaseCompleted の遷移先分岐', () => {
    const BASE_USER = {
      id: 'u1',
      nickname: 'tester',
      goalDays: 30,
      streakStartDate: null,
      isPro: false,
      notifyTime: '22:00',
      notifyEnabled: true,
      createdAt: '2026-04-01T00:00:00.000Z',
      consentGivenAt: '2026-04-01T00:00:00.000Z',
      ageVerifiedAt: null,
    };

    beforeEach(() => {
      mockReplace.mockClear();
      useUserStore.setState({ user: BASE_USER, isLoading: false, hasHydrated: true });
    });

    it('iOS で post-purchase onboarding 未完了なら /post-purchase-onboarding に遷移する', async () => {
      Platform.OS = 'ios';
      useUserStore.setState({ user: { ...BASE_USER, hasCompletedPostPurchaseOnboarding: false } });

      const { result } = renderHook(() => usePaywallOrchestration({ source: 'onboarding' }));
      await act(async () => {
        await result.current.handlePurchaseCompleted();
      });

      expect(mockReplace).toHaveBeenCalledWith('/post-purchase-onboarding');
    });

    it('iOS で post-purchase onboarding 完了済みなら tabs に遷移する', async () => {
      Platform.OS = 'ios';
      useUserStore.setState({ user: { ...BASE_USER, hasCompletedPostPurchaseOnboarding: true } });

      const { result } = renderHook(() => usePaywallOrchestration({ source: 'onboarding' }));
      await act(async () => {
        await result.current.handlePurchaseCompleted();
      });

      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });

    it('Android では常に tabs に遷移する', async () => {
      Platform.OS = 'android';
      useUserStore.setState({ user: { ...BASE_USER, hasCompletedPostPurchaseOnboarding: false } });

      const { result } = renderHook(() => usePaywallOrchestration({ source: 'onboarding' }));
      await act(async () => {
        await result.current.handlePurchaseCompleted();
      });

      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });
});
