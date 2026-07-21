import { renderHook } from '@testing-library/react-native';

let mockStreak = 5;
jest.mock('@/hooks/dashboard/useStreak', () => ({
  useStreak: () => ({ streak: mockStreak }),
}));

const mockUseDebugUnlockAll = jest.fn<boolean, []>(() => false);
jest.mock('@/hooks/debug/useDebugUnlockAll', () => ({
  useDebugUnlockAll: () => mockUseDebugUnlockAll(),
}));

import { useAchievements } from '@/hooks/achievements/useAchievements';
import { BADGE_DEFINITIONS } from '@/constants/badges/BADGE_DEFINITIONS';

describe('useAchievements — デバッグ全解放', () => {
  beforeEach(() => {
    mockStreak = 5;
    mockUseDebugUnlockAll.mockReturnValue(false);
  });

  it('デバッグ無効時は実際のストリークで解放数を計算する', () => {
    const { result } = renderHook(() => useAchievements());
    // streak=5 で解放されるのは day<=5（stardust:0 / nebula:1 / protostar:3）の 3 個
    expect(result.current.summary.unlocked).toBe(3);
    expect(result.current.streak).toBe(5);
  });

  it('デバッグ有効時は全 18 バッジを解放済みにする', () => {
    mockUseDebugUnlockAll.mockReturnValue(true);
    const { result } = renderHook(() => useAchievements());
    expect(result.current.summary.unlocked).toBe(BADGE_DEFINITIONS.length);
    expect(result.current.summary.percentage).toBe(100);
    expect(
      result.current.achievements.every((a) => a.isUnlocked),
    ).toBe(true);
  });
});
