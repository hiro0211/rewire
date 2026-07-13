import { renderHook, act } from '@testing-library/react-native';

const mockActivate = jest.fn();
let mockIsBusy = false;
jest.mock('@/hooks/screenTime/useShieldActivation', () => ({
  useShieldActivation: () => ({ isBusy: mockIsBusy, activate: mockActivate }),
}));

let mockEnabled = false;
jest.mock('@/stores/screenTimeStore', () => ({
  useScreenTimeStore: (selector: (s: unknown) => unknown) =>
    selector({ enabled: mockEnabled }),
}));

const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: (...args: unknown[]) => mockLogEvent(...args) },
}));

import { useBlockerActivationStep } from '../useBlockerActivationStep';
import { BLOCKER_ACTIVATION_ADVANCE_DELAY_MS } from '@/constants/postPurchaseOnboarding';

describe('useBlockerActivationStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockIsBusy = false;
    mockEnabled = false;
    mockActivate.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('handlePress 成功: トースト表示→アナリティクス送信→遅延後に onComplete', async () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useBlockerActivationStep(onComplete));

    await act(async () => {
      await result.current.handlePress();
    });

    expect(mockActivate).toHaveBeenCalledTimes(1);
    expect(result.current.toastVisible).toBe(true);
    expect(mockLogEvent).toHaveBeenCalledWith('post_purchase_blocker_activated');
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(BLOCKER_ACTIVATION_ADVANCE_DELAY_MS);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('handlePress 失敗（activate=false）: トーストも遷移もしない', async () => {
    mockActivate.mockResolvedValue(false);
    const onComplete = jest.fn();
    const { result } = renderHook(() => useBlockerActivationStep(onComplete));

    await act(async () => {
      await result.current.handlePress();
    });

    expect(result.current.toastVisible).toBe(false);
    expect(mockLogEvent).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(BLOCKER_ACTIVATION_ADVANCE_DELAY_MS);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('成功後の再押下は無視される（activate は 1 回のみ）', async () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useBlockerActivationStep(onComplete));

    await act(async () => {
      await result.current.handlePress();
    });
    await act(async () => {
      await result.current.handlePress();
    });

    expect(mockActivate).toHaveBeenCalledTimes(1);
  });

  it('unmount 時に自動遷移タイマーがクリーンアップされる', async () => {
    const onComplete = jest.fn();
    const { result, unmount } = renderHook(() =>
      useBlockerActivationStep(onComplete),
    );

    await act(async () => {
      await result.current.handlePress();
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(BLOCKER_ACTIVATION_ADVANCE_DELAY_MS);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('enabled をストアから公開する', () => {
    mockEnabled = true;
    const { result } = renderHook(() => useBlockerActivationStep(jest.fn()));
    expect(result.current.enabled).toBe(true);
  });
});
