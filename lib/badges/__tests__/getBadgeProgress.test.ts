import { getBadgeProgress } from '../getBadgeProgress';

describe('getBadgeProgress', () => {
  it('day=0 → 0（Stardust開始時点）', () => {
    expect(getBadgeProgress(0)).toBe(0);
  });

  it('day=2 → 0.5（Nebula→Protostarの中間: (2-1)/(3-1)=0.5）', () => {
    expect(getBadgeProgress(2)).toBeCloseTo(0.5);
  });

  it('day=1 → 0（Nebula到達直後）', () => {
    expect(getBadgeProgress(1)).toBe(0);
  });

  it('day=1095 → 1（最終バッジ達成）', () => {
    expect(getBadgeProgress(1095)).toBe(1);
  });

  it('day=9999 → 1（最終バッジ超過）', () => {
    expect(getBadgeProgress(9999)).toBe(1);
  });

  it('day=5 → (5-3)/(7-3) = 0.5', () => {
    expect(getBadgeProgress(5)).toBeCloseTo(0.5);
  });
});
