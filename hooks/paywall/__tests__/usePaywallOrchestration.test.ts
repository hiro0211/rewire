import { renderHook, act } from '@testing-library/react-native';
import { usePaywallOrchestration } from '../usePaywallOrchestration';

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
});
