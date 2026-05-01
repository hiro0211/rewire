import { renderHook, act } from '@testing-library/react-native';

const mockGetExtensionStatus = jest.fn();
jest.mock('@/lib/safariWebExtension/safariWebExtensionBridge', () => ({
  safariWebExtensionBridge: {
    getExtensionStatus: (...args: unknown[]) => mockGetExtensionStatus(...args),
  },
}));

import { panicNotificationTracker } from '@/lib/safariWebExtension/panicNotificationTracker';
import { useDemoBlockDetection } from '../useDemoBlockDetection';

const STATUS_BASELINE = {
  isEnabled: true,
  hasAllUrls: true,
  extensionBundleId: 'rewire.app.com.SafariWebExtension',
  lastActiveAt: 0,
  lastBlockedAt: 0,
};

describe('useDemoBlockDetection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    panicNotificationTracker.reset();
    mockGetExtensionStatus.mockResolvedValue({ ...STATUS_BASELINE });
  });

  it('初期状態は blockFired=null', () => {
    const { result } = renderHook(() => useDemoBlockDetection());
    expect(result.current.blockFired).toBeNull();
  });

  it('registerTestStart 前に evaluate しても何も起きない', async () => {
    const { result } = renderHook(() => useDemoBlockDetection());

    await act(async () => {
      await result.current.evaluate();
    });

    expect(result.current.blockFired).toBeNull();
    expect(mockGetExtensionStatus).not.toHaveBeenCalled();
  });

  it('registerTestStart 後、lastBlockedAt が起点より新しければ evaluate で blockFired=true', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-30T00:00:00Z'));
    const startMs = Date.now();
    mockGetExtensionStatus.mockResolvedValue({
      ...STATUS_BASELINE,
      lastBlockedAt: startMs / 1000 + 5,
    });

    const { result } = renderHook(() => useDemoBlockDetection());

    act(() => result.current.registerTestStart());
    await act(async () => {
      await result.current.evaluate();
    });

    expect(result.current.blockFired).toBe(true);
    jest.useRealTimers();
  });

  it('registerTestStart 後、lastPanicNotifiedAt が起点より新しければ blockFired=true', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-30T00:00:00Z'));
    const startMs = Date.now();
    panicNotificationTracker.recordPanicNotification(startMs + 3000);

    const { result } = renderHook(() => useDemoBlockDetection());

    act(() => result.current.registerTestStart());
    await act(async () => {
      await result.current.evaluate();
    });

    expect(result.current.blockFired).toBe(true);
    jest.useRealTimers();
  });

  it('grace period(60s)内で lastBlockedAt が無いと blockFired=null のまま', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-30T00:00:00Z'));

    const { result } = renderHook(() => useDemoBlockDetection({ graceMs: 60_000 }));

    act(() => result.current.registerTestStart());
    act(() => {
      jest.advanceTimersByTime(30_000);
    });
    await act(async () => {
      await result.current.evaluate();
    });

    expect(result.current.blockFired).toBeNull();
    jest.useRealTimers();
  });

  it('grace period 経過後、lastBlockedAt が無ければ blockFired=false', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-30T00:00:00Z'));

    const { result } = renderHook(() => useDemoBlockDetection({ graceMs: 60_000 }));

    act(() => result.current.registerTestStart());
    act(() => {
      jest.advanceTimersByTime(61_000);
    });
    await act(async () => {
      await result.current.evaluate();
    });

    expect(result.current.blockFired).toBe(false);
    jest.useRealTimers();
  });

  it('blockFired=true になった後、再 evaluate しても false に戻らない (sticky)', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-30T00:00:00Z'));
    const startMs = Date.now();

    mockGetExtensionStatus.mockResolvedValue({
      ...STATUS_BASELINE,
      lastBlockedAt: startMs / 1000 + 5,
    });

    const { result } = renderHook(() => useDemoBlockDetection({ graceMs: 60_000 }));

    act(() => result.current.registerTestStart());
    await act(async () => {
      await result.current.evaluate();
    });
    expect(result.current.blockFired).toBe(true);

    mockGetExtensionStatus.mockResolvedValue({ ...STATUS_BASELINE, lastBlockedAt: 0 });
    act(() => {
      jest.advanceTimersByTime(120_000);
    });
    await act(async () => {
      await result.current.evaluate();
    });

    expect(result.current.blockFired).toBe(true);
    jest.useRealTimers();
  });

  it('reset で blockFired と起点が初期化される', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-30T00:00:00Z'));
    const startMs = Date.now();
    mockGetExtensionStatus.mockResolvedValue({
      ...STATUS_BASELINE,
      lastBlockedAt: startMs / 1000 + 5,
    });

    const { result } = renderHook(() => useDemoBlockDetection());

    act(() => result.current.registerTestStart());
    await act(async () => {
      await result.current.evaluate();
    });
    expect(result.current.blockFired).toBe(true);

    act(() => result.current.reset());
    expect(result.current.blockFired).toBeNull();
    jest.useRealTimers();
  });

  it('bridge が throw しても crash せず blockFired=null のまま (grace 内)', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-30T00:00:00Z'));
    mockGetExtensionStatus.mockRejectedValue(new Error('bridge failed'));

    const { result } = renderHook(() => useDemoBlockDetection({ graceMs: 60_000 }));

    act(() => result.current.registerTestStart());
    await act(async () => {
      await result.current.evaluate();
    });

    expect(result.current.blockFired).toBeNull();
    jest.useRealTimers();
  });
});
