import { renderHook, act } from '@testing-library/react-native';
import { usePaywallDismiss } from '../usePaywallDismiss';

const mockReplace = jest.fn();
const mockDismiss = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, dismiss: mockDismiss }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ user: { nickname: 'テスト', goalDays: 30 } }),
}));

jest.mock('@/lib/paywall/discountExpiry', () => ({
  discountExpiry: {
    getRemainingSeconds: jest.fn().mockResolvedValue(0),
  },
}));

jest.mock('@/lib/routing/routes', () => ({
  ROUTES: { tabs: '/(tabs)', onboardingBenefits: '/onboarding/benefits' },
  routeWithParams: (path: string, params: Record<string, string>) => ({
    pathname: path,
    params,
  }),
}));

const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

describe('usePaywallDismiss', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('エクスポートされる', () => {
    expect(usePaywallDismiss).toBeDefined();
  });

  it('オンボーディング時の dismiss でベネフィット画面へ遷移する', async () => {
    const setOfferingType = jest.fn();
    const setShowTrialSheet = jest.fn();
    const onOfferingChange = jest.fn();

    const { result } = renderHook(() =>
      usePaywallDismiss({
        source: 'onboarding',
        offeringType: 'default',
        setOfferingType,
        setDiscountRemainingSeconds: jest.fn(),
        setShowTrialSheet,
        onOfferingChange,
      }),
    );

    await act(async () => {
      await result.current.handleDismiss();
    });

    // ベネフィット画面へ戻る。source を持たせないと戻り先で導線が unknown に落ち、
    // 「ペイウォールを閉じて戻ってきた人」を後から数えられなくなる
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/onboarding/benefits',
      params: { source: 'onboarding' },
    });
    // cascade しない
    expect(setOfferingType).not.toHaveBeenCalled();
    expect(setShowTrialSheet).not.toHaveBeenCalled();
    expect(onOfferingChange).not.toHaveBeenCalled();
  });

  it('非オンボーディング時の dismiss で /(tabs) へ遷移する', async () => {
    const { result } = renderHook(() =>
      usePaywallDismiss({
        source: 'returning',
        offeringType: 'default',
        setOfferingType: jest.fn(),
        setDiscountRemainingSeconds: jest.fn(),
        setShowTrialSheet: jest.fn(),
        onOfferingChange: jest.fn(),
      }),
    );

    await act(async () => {
      await result.current.handleDismiss();
    });

    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    expect(mockDismiss).not.toHaveBeenCalled();
  });

  it('オンボーディング時の dismiss で paywall_dismissed source=onboarding を送信する', async () => {
    const { result } = renderHook(() =>
      usePaywallDismiss({
        source: 'onboarding',
        offeringType: 'default',
        setOfferingType: jest.fn(),
        setDiscountRemainingSeconds: jest.fn(),
        setShowTrialSheet: jest.fn(),
        onOfferingChange: jest.fn(),
      }),
    );

    await act(async () => {
      await result.current.handleDismiss();
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('paywall_dismissed', { source: 'onboarding' });
  });

  it('起動時ペイウォールの dismiss で paywall_dismissed source=returning を送信する', async () => {
    // paywall_viewed 側は 'returning' を送っているので、dismissed も同じ語彙に揃える
    // （以前は 'direct' で、同じ導線が2つの名前に割れていた）
    const { result } = renderHook(() =>
      usePaywallDismiss({
        source: 'returning',
        offeringType: 'default',
        setOfferingType: jest.fn(),
        setDiscountRemainingSeconds: jest.fn(),
        setShowTrialSheet: jest.fn(),
        onOfferingChange: jest.fn(),
      }),
    );

    await act(async () => {
      await result.current.handleDismiss();
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('paywall_dismissed', { source: 'returning' });
  });
});
