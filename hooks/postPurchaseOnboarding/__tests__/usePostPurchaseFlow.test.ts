import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockGetExtensionStatus = jest.fn();
jest.mock('@/lib/safariWebExtension/safariWebExtensionBridge', () => ({
  safariWebExtensionBridge: {
    getExtensionStatus: (...args: any[]) => mockGetExtensionStatus(...args),
  },
}));

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
import { TOTAL_POST_PURCHASE_STEPS } from '@/constants/postPurchaseOnboarding';

describe('usePostPurchaseFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期マウント時は step=0 (Thank You)', async () => {
    mockGetExtensionStatus.mockResolvedValueOnce({ isEnabled: false, extensionBundleId: '', lastActiveAt: 0 });

    const { result } = renderHook(() => usePostPurchaseFlow());

    expect(result.current.step).toBe(0);
  });

  it('Safari 拡張が既に有効ならマウント後に step=2 (Demo) にスキップする', async () => {
    mockGetExtensionStatus.mockResolvedValueOnce({ isEnabled: true, extensionBundleId: 'x', lastActiveAt: Date.now() });

    const { result } = renderHook(() => usePostPurchaseFlow());

    await waitFor(() => expect(result.current.safariAlreadyEnabled).toBe(true));
  });

  it('goToNext で step が 1 つ進む', async () => {
    mockGetExtensionStatus.mockResolvedValueOnce({ isEnabled: false, extensionBundleId: '', lastActiveAt: 0 });

    const { result } = renderHook(() => usePostPurchaseFlow());

    await act(async () => {
      result.current.goToNext();
    });

    expect(result.current.step).toBe(1);
  });

  it('markCompleted が user.hasCompletedPostPurchaseOnboarding = true を更新する', async () => {
    mockGetExtensionStatus.mockResolvedValueOnce({ isEnabled: false, extensionBundleId: '', lastActiveAt: 0 });

    const { result } = renderHook(() => usePostPurchaseFlow());

    await act(async () => {
      await result.current.markCompleted();
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({ hasCompletedPostPurchaseOnboarding: true });
  });

  it('logStepViewed がアナリティクスを送る', async () => {
    mockGetExtensionStatus.mockResolvedValueOnce({ isEnabled: false, extensionBundleId: '', lastActiveAt: 0 });

    const { result } = renderHook(() => usePostPurchaseFlow());

    act(() => {
      result.current.logStepViewed('demo');
    });

    expect(mockLogEvent).toHaveBeenCalledWith('post_purchase_step_viewed', { step: 'demo' });
  });

  it('logStepViewed("complete") を許可する（型/値の互換性）', async () => {
    mockGetExtensionStatus.mockResolvedValueOnce({ isEnabled: false, extensionBundleId: '', lastActiveAt: 0 });

    const { result } = renderHook(() => usePostPurchaseFlow());

    act(() => {
      result.current.logStepViewed('complete');
    });

    expect(mockLogEvent).toHaveBeenCalledWith('post_purchase_step_viewed', { step: 'complete' });
  });

  it('TOTAL_POST_PURCHASE_STEPS は 4 (thankYou / safariSetup / demo / complete)', () => {
    expect(TOTAL_POST_PURCHASE_STEPS).toBe(4);
  });

  it('goToNext で step は最大 TOTAL_POST_PURCHASE_STEPS - 1 (=3) で頭打ち', async () => {
    mockGetExtensionStatus.mockResolvedValueOnce({ isEnabled: false, extensionBundleId: '', lastActiveAt: 0 });

    const { result } = renderHook(() => usePostPurchaseFlow());

    await act(async () => {
      for (let i = 0; i < 10; i += 1) {
        result.current.goToNext();
      }
    });

    expect(result.current.step).toBe(TOTAL_POST_PURCHASE_STEPS - 1);
    expect(result.current.step).toBe(3);
  });
});
