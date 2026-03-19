const mockGetPromptState = jest.fn();
const mockGetUser = jest.fn();
const mockGetAllCheckins = jest.fn();

jest.mock('@/lib/storage/reviewPromptStorage', () => ({
  reviewPromptStorage: {
    getState: (...args: any[]) => mockGetPromptState(...args),
  },
}));

jest.mock('@/lib/storage/userStorage', () => ({
  userStorage: {
    get: (...args: any[]) => mockGetUser(...args),
  },
}));

jest.mock('@/lib/storage/checkinStorage', () => ({
  checkinStorage: {
    getAll: (...args: any[]) => mockGetAllCheckins(...args),
  },
}));

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Platform.OS = 'ios';
  return rn;
});

import { renderHook, waitFor } from '@testing-library/react-native';
import { useReviewEligibility } from '../useReviewEligibility';

describe('useReviewEligibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultPromptState = { lastPromptedAt: null, dismissCount: 0, hasLeftPositiveReview: false };
  const oldUser = { id: 'user-1', createdAt: '2026-01-01T00:00:00Z' };
  const fiveCheckins = Array.from({ length: 5 }, (_, i) => ({ id: String(i), date: `2026-03-${10 + i}` }));

  it('全条件満たす → true', async () => {
    mockGetPromptState.mockResolvedValue(defaultPromptState);
    mockGetUser.mockResolvedValue(oldUser);
    mockGetAllCheckins.mockResolvedValue(fiveCheckins);

    const { result } = renderHook(() => useReviewEligibility());

    await waitFor(() => {
      expect(result.current.shouldShowReview).toBe(true);
    });
  });

  it('レビュー済み → false', async () => {
    mockGetPromptState.mockResolvedValue({ ...defaultPromptState, hasLeftPositiveReview: true });
    mockGetUser.mockResolvedValue(oldUser);
    mockGetAllCheckins.mockResolvedValue(fiveCheckins);

    const { result } = renderHook(() => useReviewEligibility());

    await waitFor(() => {
      expect(result.current.shouldShowReview).toBe(false);
    });
  });

  it('利用開始から7日未満 → false', async () => {
    mockGetPromptState.mockResolvedValue(defaultPromptState);
    mockGetUser.mockResolvedValue({ id: 'user-1', createdAt: new Date().toISOString() });
    mockGetAllCheckins.mockResolvedValue(fiveCheckins);

    const { result } = renderHook(() => useReviewEligibility());

    await waitFor(() => {
      expect(result.current.shouldShowReview).toBe(false);
    });
  });

  it('チェックイン不足 → false', async () => {
    mockGetPromptState.mockResolvedValue(defaultPromptState);
    mockGetUser.mockResolvedValue(oldUser);
    mockGetAllCheckins.mockResolvedValue([{ id: '1', date: '2026-03-10' }]);

    const { result } = renderHook(() => useReviewEligibility());

    await waitFor(() => {
      expect(result.current.shouldShowReview).toBe(false);
    });
  });

  it('ユーザーが存在しない → false', async () => {
    mockGetPromptState.mockResolvedValue(defaultPromptState);
    mockGetUser.mockResolvedValue(null);
    mockGetAllCheckins.mockResolvedValue(fiveCheckins);

    const { result } = renderHook(() => useReviewEligibility());

    await waitFor(() => {
      expect(result.current.shouldShowReview).toBe(false);
    });
  });

  it('dismiss 3回 → false', async () => {
    mockGetPromptState.mockResolvedValue({
      lastPromptedAt: '2026-01-01T00:00:00Z',
      dismissCount: 3,
      hasLeftPositiveReview: false,
    });
    mockGetUser.mockResolvedValue(oldUser);
    mockGetAllCheckins.mockResolvedValue(fiveCheckins);

    const { result } = renderHook(() => useReviewEligibility());

    await waitFor(() => {
      expect(result.current.shouldShowReview).toBe(false);
    });
  });
});
