import { ORB_TAP } from '../orbAnimation';

describe('ORB_TAP', () => {
  it('pressInScale は 0〜1 の範囲内', () => {
    expect(ORB_TAP.pressInScale).toBeGreaterThan(0);
    expect(ORB_TAP.pressInScale).toBeLessThan(1);
  });

  it('spring config に必要なプロパティが揃っている', () => {
    expect(ORB_TAP.spring).toHaveProperty('damping');
    expect(ORB_TAP.spring).toHaveProperty('stiffness');
    expect(ORB_TAP.spring).toHaveProperty('mass');
  });

  it('rippleScale は 1 より大きい', () => {
    expect(ORB_TAP.rippleScale).toBeGreaterThan(1);
  });
});
