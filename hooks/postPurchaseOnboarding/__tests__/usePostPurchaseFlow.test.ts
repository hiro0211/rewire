import { renderHook, act } from '@testing-library/react-native';

const mockUpdateUser = jest.fn().mockResolvedValue(undefined);
jest.mock('@/stores/userStore', () => ({
  useUserStore: Object.assign(
    (selector: any) => selector?.({ updateUser: mockUpdateUser }) ?? { updateUser: mockUpdateUser },
    {
      getState: () => ({ updateUser: mockUpdateUser }),
    },
  ),
}));

const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: (...args: any[]) => mockLogEvent(...args) },
}));

import { usePostPurchaseFlow } from '../usePostPurchaseFlow';
import {
  TOTAL_POST_PURCHASE_STEPS,
  POST_PURCHASE_STEPS,
} from '@/constants/postPurchaseOnboarding';

describe('usePostPurchaseFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期マウント時は step=0 (Thank You)', () => {
    const { result } = renderHook(() => usePostPurchaseFlow());

    expect(result.current.step).toBe(0);
  });

  it('goToNext で step が 1 つ進む', async () => {
    const { result } = renderHook(() => usePostPurchaseFlow());

    await act(async () => {
      result.current.goToNext();
    });

    expect(result.current.step).toBe(1);
  });

  it('markCompleted が user.hasCompletedPostPurchaseOnboarding = true を更新する', async () => {
    const { result } = renderHook(() => usePostPurchaseFlow());

    await act(async () => {
      await result.current.markCompleted();
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({ hasCompletedPostPurchaseOnboarding: true });
  });

  it('logStepViewed がアナリティクスを送る', () => {
    const { result } = renderHook(() => usePostPurchaseFlow());

    act(() => {
      result.current.logStepViewed('thankYou');
    });

    expect(mockLogEvent).toHaveBeenCalledWith('post_purchase_step_viewed', { step: 'thankYou' });
  });

  it('logStepViewed("complete") を許可する（型/値の互換性）', () => {
    const { result } = renderHook(() => usePostPurchaseFlow());

    act(() => {
      result.current.logStepViewed('complete');
    });

    expect(mockLogEvent).toHaveBeenCalledWith('post_purchase_step_viewed', { step: 'complete' });
  });

  it('TOTAL_POST_PURCHASE_STEPS は 6', () => {
    expect(TOTAL_POST_PURCHASE_STEPS).toBe(6);
  });

  it('POST_PURCHASE_STEPS の順序: thankYou→screenTimeIntro→dataProtection→screenTime→blockerActivation→complete', () => {
    expect(POST_PURCHASE_STEPS).toEqual([
      'thankYou',
      'screenTimeIntro',
      'dataProtection',
      'screenTime',
      'blockerActivation',
      'complete',
    ]);
  });

  it('goToNext で step は最大 TOTAL_POST_PURCHASE_STEPS - 1 (=5) で頭打ち', async () => {
    const { result } = renderHook(() => usePostPurchaseFlow());

    await act(async () => {
      for (let i = 0; i < 10; i += 1) {
        result.current.goToNext();
      }
    });

    expect(result.current.step).toBe(TOTAL_POST_PURCHASE_STEPS - 1);
    expect(result.current.step).toBe(5);
  });

  it('safariAlreadyEnabled の auto-skip フィールドは廃止された（戻り値に含まれない）', () => {
    const { result } = renderHook(() => usePostPurchaseFlow());

    expect((result.current as Record<string, unknown>).safariAlreadyEnabled).toBeUndefined();
  });
});
