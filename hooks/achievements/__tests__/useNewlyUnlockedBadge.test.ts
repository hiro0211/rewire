import { renderHook, act } from '@testing-library/react-native';
import { useNewlyUnlockedBadge } from '../useNewlyUnlockedBadge';

// AsyncStorage mock
const mockStore: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockStore[key] ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    mockStore[key] = value;
    return Promise.resolve();
  }),
}));

// useStreak mock
const mockUseStreak = jest.fn(() => ({ streak: 0 }));
jest.mock('@/hooks/dashboard/useStreak', () => ({
  useStreak: () => mockUseStreak(),
}));

beforeEach(() => {
  // Clear storage between tests
  Object.keys(mockStore).forEach((k) => delete mockStore[k]);
  jest.clearAllMocks();
});

describe('useNewlyUnlockedBadge', () => {
  it('streak が badge.day を初めて超えたとき新バッジを返す', async () => {
    // Day 1 → Nebula バッジ (day: 1)
    mockUseStreak.mockReturnValue({ streak: 1 });

    const { result } = renderHook(() => useNewlyUnlockedBadge());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.newBadge).not.toBeNull();
    expect(result.current.newBadge?.id).toBe('Nebula');
  });

  it('一度表示済みのバッジは再トリガーされない', async () => {
    mockUseStreak.mockReturnValue({ streak: 1 });

    const { result } = renderHook(() => useNewlyUnlockedBadge());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // dismiss して既読化
    await act(async () => {
      result.current.dismiss();
      await new Promise((r) => setTimeout(r, 50));
    });

    // 再レンダリングしても null になる
    const { result: result2 } = renderHook(() => useNewlyUnlockedBadge());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result2.current.newBadge).toBeNull();
  });

  it('streak が badge.day に未達のとき null を返す', async () => {
    // Day 0 → Stardust (day: 0) は初期なので streak=0 でも day=0 でアンロック
    // streak=-1 は RangeError なので、streak=0 のケースでは Stardust が取れるはず
    // 未達テスト: day=0 で Stardust は必ずアンロック済みにして、streak は十分小さい
    // ここでは seen に Stardust と Nebula を両方入れておき、streak=0 で null になることを確認
    mockStore['seen_badge_ids'] = JSON.stringify(['Stardust']);
    mockUseStreak.mockReturnValue({ streak: 0 });

    const { result } = renderHook(() => useNewlyUnlockedBadge());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.newBadge).toBeNull();
  });

  it('dismiss を呼ぶと newBadge が null になる', async () => {
    mockUseStreak.mockReturnValue({ streak: 7 });

    const { result } = renderHook(() => useNewlyUnlockedBadge());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.newBadge).not.toBeNull();

    await act(async () => {
      result.current.dismiss();
    });

    expect(result.current.newBadge).toBeNull();
  });
});
