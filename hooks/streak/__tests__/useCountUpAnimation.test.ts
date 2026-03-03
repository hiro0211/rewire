import { getCountUpDuration } from '@/constants/streakCelebration';

describe('getCountUpDuration', () => {
  it('streak=0 のとき baseDuration(800ms) を返す', () => {
    expect(getCountUpDuration(0)).toBe(800);
  });

  it('streak=10 のとき 800 + 10*15 = 950ms を返す', () => {
    expect(getCountUpDuration(10)).toBe(950);
  });

  it('streak=30 のとき 800 + 30*15 = 1250ms を返す', () => {
    expect(getCountUpDuration(30)).toBe(1250);
  });

  it('streak=50 のとき maxDuration(1500ms) にクランプされる', () => {
    // 800 + 50*15 = 1550 > 1500
    expect(getCountUpDuration(50)).toBe(1500);
  });

  it('streak=100 のとき maxDuration(1500ms) にクランプされる', () => {
    expect(getCountUpDuration(100)).toBe(1500);
  });

  it('streak=46 のとき境界値 800 + 46*15 = 1490 < 1500', () => {
    expect(getCountUpDuration(46)).toBe(1490);
  });

  it('streak=47 のとき境界値 800 + 47*15 = 1505 → 1500 にクランプ', () => {
    expect(getCountUpDuration(47)).toBe(1500);
  });
});
