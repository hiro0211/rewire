import { shouldCelebrate, computeFromStreak } from '../celebrationPolicy';

describe('shouldCelebrate', () => {
  it('hydration 完了前はセレブレーションしない', () => {
    expect(
      shouldCelebrate({ currentStreak: 10, lastCelebrated: 9, hydrated: false }),
    ).toBe(false);
  });

  it('lastCelebrated が null（未マイグレーション）はセレブレーションしない', () => {
    expect(
      shouldCelebrate({ currentStreak: 10, lastCelebrated: null, hydrated: true }),
    ).toBe(false);
  });

  it('currentStreak が 0 のときはセレブレーションしない（relapse 直後）', () => {
    expect(
      shouldCelebrate({ currentStreak: 0, lastCelebrated: 30, hydrated: true }),
    ).toBe(false);
  });

  it('currentStreak が lastCelebrated と同じならセレブレーションしない', () => {
    expect(
      shouldCelebrate({ currentStreak: 10, lastCelebrated: 10, hydrated: true }),
    ).toBe(false);
  });

  it('currentStreak が lastCelebrated より少ないならセレブレーションしない', () => {
    expect(
      shouldCelebrate({ currentStreak: 5, lastCelebrated: 10, hydrated: true }),
    ).toBe(false);
  });

  it('currentStreak が lastCelebrated より大きいならセレブレーションする', () => {
    expect(
      shouldCelebrate({ currentStreak: 10, lastCelebrated: 9, hydrated: true }),
    ).toBe(true);
  });

  it('relapse 後の再ストリーク 1 日目（lastCelebrated=0 にクランプ後）はセレブレーションする', () => {
    expect(
      shouldCelebrate({ currentStreak: 1, lastCelebrated: 0, hydrated: true }),
    ).toBe(true);
  });
});

describe('computeFromStreak', () => {
  it('lastCelebrated が currentStreak - 1 なら fromStreak = lastCelebrated', () => {
    expect(computeFromStreak(10, 9)).toBe(9);
  });

  it('lastCelebrated と currentStreak の差が大きくても currentStreak - 1 で +1 にクランプ', () => {
    expect(computeFromStreak(10, 0)).toBe(9);
  });

  it('lastCelebrated が null（未マイグレーション）でも currentStreak - 1 を返す', () => {
    expect(computeFromStreak(10, null)).toBe(9);
  });

  it('relapse 後の 1 日目は fromStreak = 0', () => {
    expect(computeFromStreak(1, 30)).toBe(0);
  });

  it('currentStreak が 1 なら fromStreak = 0', () => {
    expect(computeFromStreak(1, 0)).toBe(0);
  });

  it('currentStreak が 0 でも下限 0 を保つ', () => {
    expect(computeFromStreak(0, 0)).toBe(0);
  });
});
