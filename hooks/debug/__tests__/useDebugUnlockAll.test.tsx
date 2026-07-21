import { renderHook } from '@testing-library/react-native';

// DEBUG_MENU_ENABLED を true にゲート開放した状態で、ランタイムトグルを反映することを検証する。
jest.mock('@/constants/debug', () => ({
  DEBUG_MENU_ENABLED: true,
  DEBUG_UNLOCK_DAYS: 100000,
}));

import { useDebugUnlockAll } from '@/hooks/debug/useDebugUnlockAll';
import { useDebugStore } from '@/stores/debugStore';

describe('useDebugUnlockAll（DEBUG_MENU_ENABLED=true）', () => {
  beforeEach(() => {
    useDebugStore.setState({ enabled: false, hasHydrated: true });
  });

  it('store.enabled=true のとき true を返す', () => {
    useDebugStore.setState({ enabled: true });
    const { result } = renderHook(() => useDebugUnlockAll());
    expect(result.current).toBe(true);
  });

  it('store.enabled=false のとき false を返す', () => {
    useDebugStore.setState({ enabled: false });
    const { result } = renderHook(() => useDebugUnlockAll());
    expect(result.current).toBe(false);
  });
});
