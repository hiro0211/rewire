import { renderHook } from '@testing-library/react-native';
import { useStreak } from '../useStreak';

jest.mock('@/stores/userStore', () => ({
  useUserStore: jest.fn(),
}));

jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: jest.fn(() => ({ checkins: [] })),
}));

jest.mock('@/features/checkin/streakCalculator', () => ({
  calculateStreak: jest.fn(() => 7),
}));

import { useUserStore } from '@/stores/userStore';

const mockUseUserStore = useUserStore as jest.MockedFunction<typeof useUserStore>;

describe('useStreak', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('user.streakStartDate が設定されている場合、streakStartDate を返す', () => {
    mockUseUserStore.mockReturnValue({
      user: {
        id: '1',
        nickname: 'test',
        goalDays: 30,
        streakStartDate: '2026-02-17',
        isPro: false,
        notifyTime: '22:00',
        notifyEnabled: true,
        createdAt: '2026-02-17',
        consentGivenAt: null,
        ageVerifiedAt: null,
      },
      isLoading: false,
      hasHydrated: true,
      setUser: jest.fn(),
      updateUser: jest.fn(),
      loadUser: jest.fn(),
      reset: jest.fn(),
    } as any);

    const { result } = renderHook(() => useStreak());
    expect(result.current.streakStartDate).toBe('2026-02-17');
  });

  it('user が null の場合、streakStartDate は null を返す', () => {
    mockUseUserStore.mockReturnValue({
      user: null,
      isLoading: false,
      hasHydrated: true,
      setUser: jest.fn(),
      updateUser: jest.fn(),
      loadUser: jest.fn(),
      reset: jest.fn(),
    } as any);

    const { result } = renderHook(() => useStreak());
    expect(result.current.streakStartDate).toBeNull();
  });
});
