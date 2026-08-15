import { renderHook } from '@testing-library/react-native';

const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

let mockLastShieldedAt: number | null = null;
jest.mock('@/stores/screenTimeStore', () => ({
  useScreenTimeStore: (selector: (s: unknown) => unknown) =>
    selector({ lastShieldedAt: mockLastShieldedAt }),
}));

import { useBlockerAnalytics } from '../useBlockerAnalytics';

/**
 * ブロック解除フローの計測。
 *
 * 「ONにしてから何時間で解除しようとしたか」と「呼吸ゲートで思いとどまったか」
 * の2つが取れることを固定する。どちらもポルノ禁の挫折率を出すのに要る。
 */
describe('useBlockerAnalytics', () => {
  const HOUR = 60 * 60 * 1000;
  const NOW = new Date('2026-08-09T12:00:00Z').getTime();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLastShieldedAt = null;
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('有効化を導線つきで送る', () => {
    const { result } = renderHook(() => useBlockerAnalytics());
    result.current.trackEnabled('settings');
    expect(mockTrackEvent).toHaveBeenCalledWith('blocker_enabled', {
      source: 'settings',
    });
  });

  it('解除ボタンを押した時点で経過時間つきのイベントを送る', () => {
    mockLastShieldedAt = NOW - 30 * HOUR;
    const { result } = renderHook(() => useBlockerAnalytics());
    result.current.trackDisableRequested();
    expect(mockTrackEvent).toHaveBeenCalledWith('blocker_disable_requested', {
      hours_enabled: 30,
    });
  });

  it('ゲートを越えて解除したら confirmed を送る', () => {
    mockLastShieldedAt = NOW - 2 * HOUR;
    const { result } = renderHook(() => useBlockerAnalytics());
    result.current.trackDisableConfirmed();
    expect(mockTrackEvent).toHaveBeenCalledWith('blocker_disable_confirmed', {
      hours_enabled: 2,
    });
  });

  it('ゲートで思いとどまったら cancelled を送る', () => {
    // requested と cancelled の差がゲートの引き止め率になる。
    // cancelled を送らないと「押したが解除しなかった人」が消える。
    mockLastShieldedAt = NOW - 2 * HOUR;
    const { result } = renderHook(() => useBlockerAnalytics());
    result.current.trackDisableCancelled();
    expect(mockTrackEvent).toHaveBeenCalledWith('blocker_disable_cancelled', {
      hours_enabled: 2,
    });
  });

  it('有効化の記録が無いときは経過時間を送らない', () => {
    // 0 を送ると「即解除した」と混ざる。パラメータごと落とす。
    mockLastShieldedAt = null;
    const { result } = renderHook(() => useBlockerAnalytics());
    result.current.trackDisableRequested();
    expect(mockTrackEvent).toHaveBeenCalledWith('blocker_disable_requested', {});
  });
});
