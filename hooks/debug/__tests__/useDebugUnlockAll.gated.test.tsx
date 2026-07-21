import { renderHook } from '@testing-library/react-native';

// DEBUG_MENU_ENABLED=false（= リリースビルド相当）では、
// ランタイムトグルが true でも一切有効化されないことを検証する（本番安全性）。
jest.mock('@/constants/debug', () => ({
  DEBUG_MENU_ENABLED: false,
  DEBUG_UNLOCK_DAYS: 100000,
}));

import { useDebugUnlockAll } from '@/hooks/debug/useDebugUnlockAll';
import { useDebugStore } from '@/stores/debugStore';

describe('useDebugUnlockAll（DEBUG_MENU_ENABLED=false のゲート）', () => {
  beforeEach(() => {
    useDebugStore.setState({ enabled: false, hasHydrated: true });
  });

  it('store.enabled=true でも false を返す（永続フラグが本番に漏れない）', () => {
    useDebugStore.setState({ enabled: true });
    const { result } = renderHook(() => useDebugUnlockAll());
    expect(result.current).toBe(false);
  });
});
