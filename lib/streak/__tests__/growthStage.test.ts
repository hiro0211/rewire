import { getGrowthStage } from '../growthStage';

describe('getGrowthStage', () => {
  describe('境界値テスト', () => {
    it('day=0 のとき spark を返す', () => {
      expect(getGrowthStage(0).name).toBe('spark');
    });

    it('day=6 のとき spark を返す', () => {
      expect(getGrowthStage(6).name).toBe('spark');
    });

    it('day=7 のとき dawn を返す', () => {
      expect(getGrowthStage(7).name).toBe('dawn');
    });

    it('day=29 のとき dawn を返す', () => {
      expect(getGrowthStage(29).name).toBe('dawn');
    });

    it('day=30 のとき nebula を返す', () => {
      expect(getGrowthStage(30).name).toBe('nebula');
    });

    it('day=89 のとき nebula を返す', () => {
      expect(getGrowthStage(89).name).toBe('nebula');
    });

    it('day=90 のとき galaxy を返す', () => {
      expect(getGrowthStage(90).name).toBe('galaxy');
    });

    it('day=364 のとき galaxy を返す', () => {
      expect(getGrowthStage(364).name).toBe('galaxy');
    });

    it('day=365 のとき cosmos を返す', () => {
      expect(getGrowthStage(365).name).toBe('cosmos');
    });

    it('day=1000 のとき cosmos を返す', () => {
      expect(getGrowthStage(1000).name).toBe('cosmos');
    });
  });

  describe('返り値の構造', () => {
    it('name, min, max を持つ', () => {
      const result = getGrowthStage(15);
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('min');
      expect(result).toHaveProperty('max');
    });

    it('dawn のとき min=7, max=29 を返す', () => {
      const result = getGrowthStage(15);
      expect(result.name).toBe('dawn');
      expect(result.min).toBe(7);
      expect(result.max).toBe(29);
    });
  });
});
