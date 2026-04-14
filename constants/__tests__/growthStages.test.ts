import { GROWTH_STAGES, GROWTH_STAGE_NAMES, type GrowthStageName } from '../growthStages';

describe('growthStages', () => {
  describe('GROWTH_STAGE_NAMES', () => {
    it('5段階のステージ名を持つ', () => {
      expect(GROWTH_STAGE_NAMES).toEqual(['spark', 'dawn', 'nebula', 'galaxy', 'cosmos']);
    });
  });

  describe('GROWTH_STAGES', () => {
    it('5段階の定義を持つ', () => {
      expect(GROWTH_STAGES).toHaveLength(5);
    });

    it('全段階が 0 から ∞ をカバーする（ギャップなし）', () => {
      expect(GROWTH_STAGES[0].min).toBe(0);
      for (let i = 1; i < GROWTH_STAGES.length; i++) {
        expect(GROWTH_STAGES[i].min).toBe(GROWTH_STAGES[i - 1].max + 1);
      }
      expect(GROWTH_STAGES[GROWTH_STAGES.length - 1].max).toBe(Infinity);
    });

    it('全段階が重複しない', () => {
      for (let i = 0; i < GROWTH_STAGES.length; i++) {
        for (let j = i + 1; j < GROWTH_STAGES.length; j++) {
          const a = GROWTH_STAGES[i];
          const b = GROWTH_STAGES[j];
          // No overlap: a.max < b.min or b.max < a.min
          expect(a.max < b.min || b.max < a.min).toBe(true);
        }
      }
    });

    it('Spark は 0-6 日', () => {
      const spark = GROWTH_STAGES.find((s) => s.name === 'spark');
      expect(spark).toBeDefined();
      expect(spark!.min).toBe(0);
      expect(spark!.max).toBe(6);
    });

    it('Dawn は 7-29 日', () => {
      const dawn = GROWTH_STAGES.find((s) => s.name === 'dawn');
      expect(dawn).toBeDefined();
      expect(dawn!.min).toBe(7);
      expect(dawn!.max).toBe(29);
    });

    it('Nebula は 30-89 日', () => {
      const nebula = GROWTH_STAGES.find((s) => s.name === 'nebula');
      expect(nebula).toBeDefined();
      expect(nebula!.min).toBe(30);
      expect(nebula!.max).toBe(89);
    });

    it('Galaxy は 90-364 日', () => {
      const galaxy = GROWTH_STAGES.find((s) => s.name === 'galaxy');
      expect(galaxy).toBeDefined();
      expect(galaxy!.min).toBe(90);
      expect(galaxy!.max).toBe(364);
    });

    it('Cosmos は 365+ 日', () => {
      const cosmos = GROWTH_STAGES.find((s) => s.name === 'cosmos');
      expect(cosmos).toBeDefined();
      expect(cosmos!.min).toBe(365);
      expect(cosmos!.max).toBe(Infinity);
    });

    it('全ステージ名が GROWTH_STAGE_NAMES と一致する', () => {
      const names = GROWTH_STAGES.map((s) => s.name);
      expect(names).toEqual([...GROWTH_STAGE_NAMES]);
    });
  });
});
