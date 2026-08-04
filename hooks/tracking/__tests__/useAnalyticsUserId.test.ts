import { renderHook } from '@testing-library/react-native';

const mockSetUserId = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { setUserId: (...args: any[]) => mockSetUserId(...args) },
}));

import { useAnalyticsUserId } from '../useAnalyticsUserId';

describe('useAnalyticsUserId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ユーザーIDがあるとき Analytics に設定する', () => {
    renderHook(() => useAnalyticsUserId('user-abc'));
    expect(mockSetUserId).toHaveBeenCalledWith('user-abc');
  });

  it('ユーザーIDが無いとき null を設定する', () => {
    // リセット後に前のユーザーのIDが残り続けないようにする
    renderHook(() => useAnalyticsUserId(null));
    expect(mockSetUserId).toHaveBeenCalledWith(null);
  });

  it('同じIDで再レンダーしても再送しない', () => {
    const { rerender } = renderHook(({ id }) => useAnalyticsUserId(id), {
      initialProps: { id: 'user-abc' as string | null },
    });
    rerender({ id: 'user-abc' });
    expect(mockSetUserId).toHaveBeenCalledTimes(1);
  });

  it('IDが変わったら再送する', () => {
    const { rerender } = renderHook(({ id }) => useAnalyticsUserId(id), {
      initialProps: { id: null as string | null },
    });
    rerender({ id: 'user-xyz' });
    expect(mockSetUserId).toHaveBeenLastCalledWith('user-xyz');
  });
});
