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
        isFromOnboarding: true,
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

    // ベネフィット画面へ戻る
    expect(mockReplace).toHaveBeenCalledWith('/onboarding/benefits');
    // cascade しない
    expect(setOfferingType).not.toHaveBeenCalled();
    expect(setShowTrialSheet).not.toHaveBeenCalled();
    expect(onOfferingChange).not.toHaveBeenCalled();
  });

  it('非オンボーディング時の dismiss で /(tabs) へ遷移する', async () => {
    const { result } = renderHook(() =>
      usePaywallDismiss({
        isFromOnboarding: false,
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
});
