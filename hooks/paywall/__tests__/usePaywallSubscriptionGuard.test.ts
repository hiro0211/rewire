import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePaywallSubscriptionGuard } from '../usePaywallSubscriptionGuard';
import { useUserStore } from '@/stores/userStore';

const mockGetSubscriptionStatus = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock('@/lib/subscription/subscriptionClient', () => ({
  subscriptionClient: {
    getSubscriptionStatus: (...args: unknown[]) => mockGetSubscriptionStatus(...args),
  },
}));

const mockLoggerError = jest.fn();
jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

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

describe('usePaywallSubscriptionGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserStore.setState({ user: { ...BASE_USER }, isLoading: false, hasHydrated: true });
    // updateUser を spy に差し替え
    useUserStore.setState({ updateUser: mockUpdateUser } as never);
  });

  it('マウント時に getSubscriptionStatus が isActive=true を返すと onActive と updateUser が呼ばれる', async () => {
    mockGetSubscriptionStatus.mockResolvedValue({
      isActive: true,
      plan: 'pro_annual',
      expiresAt: '2027-04-01T00:00:00.000Z',
      willRenew: true,
    });
    const onActive = jest.fn();

    renderHook(() => usePaywallSubscriptionGuard({ onActive }));

    await waitFor(() => {
      expect(onActive).toHaveBeenCalledTimes(1);
    });
    expect(mockUpdateUser).toHaveBeenCalledWith({ isPro: true });
  });

  it('isActive=false の場合は onActive を呼ばない', async () => {
    mockGetSubscriptionStatus.mockResolvedValue({
      isActive: false,
      plan: 'free',
      expiresAt: null,
      willRenew: false,
    });
    const onActive = jest.fn();

    renderHook(() => usePaywallSubscriptionGuard({ onActive }));

    await act(async () => {});

    expect(onActive).not.toHaveBeenCalled();
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('user.isPro が後から true に変わったら onActive が発火する', async () => {
    mockGetSubscriptionStatus.mockResolvedValue({
      isActive: false,
      plan: 'free',
      expiresAt: null,
      willRenew: false,
    });
    const onActive = jest.fn();

    renderHook(() => usePaywallSubscriptionGuard({ onActive }));
    await act(async () => {});
    expect(onActive).not.toHaveBeenCalled();

    // store 側から isPro を true にする（listener 経由の想定）
    await act(async () => {
      useUserStore.setState({
        user: { ...BASE_USER, isPro: true },
      });
    });

    await waitFor(() => {
      expect(onActive).toHaveBeenCalledTimes(1);
    });
  });

  it('マウント時にすでに user.isPro=true の場合は onActive が即発火する', async () => {
    mockGetSubscriptionStatus.mockResolvedValue({
      isActive: true,
      plan: 'pro_annual',
      expiresAt: null,
      willRenew: true,
    });
    useUserStore.setState({ user: { ...BASE_USER, isPro: true } });
    const onActive = jest.fn();

    renderHook(() => usePaywallSubscriptionGuard({ onActive }));

    await waitFor(() => {
      expect(onActive).toHaveBeenCalled();
    });
  });

  it('onActive は複数の経路で active を検知しても最大1回しか呼ばれない', async () => {
    mockGetSubscriptionStatus.mockResolvedValue({
      isActive: true,
      plan: 'pro_annual',
      expiresAt: null,
      willRenew: true,
    });
    const onActive = jest.fn();

    renderHook(() => usePaywallSubscriptionGuard({ onActive }));
    await waitFor(() => expect(onActive).toHaveBeenCalled());

    // さらに store 側で user を更新しても再発火しない
    await act(async () => {
      useUserStore.setState({ user: { ...BASE_USER, isPro: true } });
    });
    await act(async () => {});

    expect(onActive).toHaveBeenCalledTimes(1);
  });

  it('getSubscriptionStatus が例外を投げても onActive は呼ばれずログが記録される', async () => {
    mockGetSubscriptionStatus.mockRejectedValue(new Error('network error'));
    const onActive = jest.fn();

    renderHook(() => usePaywallSubscriptionGuard({ onActive }));

    await act(async () => {});

    expect(onActive).not.toHaveBeenCalled();
    expect(mockLoggerError).toHaveBeenCalled();
  });
});
