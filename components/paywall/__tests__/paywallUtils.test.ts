import { calcMonthlyPrice, calcRelativeDiscount } from '../paywallUtils';

describe('paywallUtils', () => {
  describe('calcMonthlyPrice', () => {
    it('年額を12で割り丸める', () => {
      expect(calcMonthlyPrice(5400)).toBe(450);
    });

    it('¥2,500/年 → ¥208/月（四捨五入）', () => {
      expect(calcMonthlyPrice(2500)).toBe(208);
    });

    it('0の場合は0を返す', () => {
      expect(calcMonthlyPrice(0)).toBe(0);
    });
  });

  describe('calcRelativeDiscount', () => {
    it('¥680月額 vs ¥5400年額 → 34%割引', () => {
      expect(calcRelativeDiscount(680, 5400)).toBe(34);
    });

    it('¥680月額 vs ¥2500年額 → 69%割引', () => {
      expect(calcRelativeDiscount(680, 2500)).toBe(69);
    });

    it('月額が0の場合は0を返す', () => {
      expect(calcRelativeDiscount(0, 5400)).toBe(0);
    });

    it('月額が負の場合は0を返す', () => {
      expect(calcRelativeDiscount(-100, 5400)).toBe(0);
    });
  });
});
