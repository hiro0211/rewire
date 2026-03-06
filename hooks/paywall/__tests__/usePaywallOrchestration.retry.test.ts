import { renderHook, act } from '@testing-library/react-native';

// Mock nativeGuard to allow Purchases
jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: false }));

const mockInitialize = jest.fn();
const mockIsReady = jest.fn();
jest.mock('@/lib/subscription/subscriptionClient', () => ({
  subscriptionClient: {
    isReady: (...args: any[]) => mockIsReady(...args),
    initialize: (...args: any[]) => mockInitialize(...args),
  },
}));

const mockGetOfferings = jest.fn();
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    getOfferings: (...args: any[]) => mockGetOfferings(...args),
  },
}));

jest.mock('@/lib/paywall/discountExpiry', () => ({
  discountExpiry: { getRemainingSeconds: jest.fn().mockResolvedValue(200) },
}));

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: jest.fn() },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), dismiss: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ user: null, updateUser: jest.fn() }),
}));

import { usePaywallOrchestration } from '../usePaywallOrchestration';

describe('usePaywallOrchestration 初期化リトライ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // console.warn を抑制
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('初期化が1回目に失敗しても2回目で成功すればreadyになる', async () => {
    // 1回目: 失敗 → 2回目: 成功
    mockInitialize
      .mockRejectedValueOnce(new Error('init failed'))
      .mockResolvedValueOnce(undefined);
    mockIsReady
      .mockReturnValueOnce(false) // 最初の isReady チェック
      .mockReturnValueOnce(true); // リトライ後の isReady チェック

    mockGetOfferings.mockResolvedValue({
      current: {
        annual: { product: { price: 5400 } },
        availablePackages: [{ identifier: '$rc_annual' }],
      },
    });

    const { result } = renderHook(() =>
      usePaywallOrchestration({ source: 'settings' }),
    );

    await act(async () => {});

    expect(mockInitialize).toHaveBeenCalledTimes(2);
    expect(result.current.paywallState).toBe('ready');
  });

  it('初期化が2回とも失敗したらunavailableになる', async () => {
    mockInitialize.mockRejectedValue(new Error('init failed'));
    mockIsReady.mockReturnValue(false);

    const { result } = renderHook(() =>
      usePaywallOrchestration({ source: 'settings' }),
    );

    await act(async () => {});

    expect(mockInitialize).toHaveBeenCalledTimes(2);
    expect(result.current.paywallState).toBe('unavailable');
  });
});
