import { calculateRewiringProgress } from '../rewiringProgress';

describe('calculateRewiringProgress', () => {
  it('0/30 のとき 0 を返す', () => {
    expect(calculateRewiringProgress(0, 30)).toBe(0);
  });

  it('15/30 のとき 0.5 を返す', () => {
    expect(calculateRewiringProgress(15, 30)).toBe(0.5);
  });

  it('30/30 のとき 1.0 を返す', () => {
    expect(calculateRewiringProgress(30, 30)).toBe(1);
  });

  it('60/30 のとき 1.0 にクランプされる', () => {
    expect(calculateRewiringProgress(60, 30)).toBe(1);
  });

  it('0/0 のとき 0 を返す', () => {
    expect(calculateRewiringProgress(0, 0)).toBe(0);
  });

  it('10/0 のとき 0 を返す（ゼロ除算防止）', () => {
    expect(calculateRewiringProgress(10, 0)).toBe(0);
  });

  it('負の値のとき 0 にクランプされる', () => {
    expect(calculateRewiringProgress(-5, 30)).toBe(0);
  });
});
