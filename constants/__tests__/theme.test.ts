import { COLORS } from '../theme';

describe('テーマ定数', () => {
  describe('新規カラー定義', () => {
    it('COLORS.backgroundDeepNavy が定義されている', () => {
      expect(COLORS.backgroundDeepNavy).toBeDefined();
    });

    it('COLORS.backgroundNavy が定義されている', () => {
      expect(COLORS.backgroundNavy).toBeDefined();
    });

    it('COLORS.cyan が定義されている', () => {
      expect(COLORS.cyan).toBeDefined();
    });

    it('COLORS.pillBorder が定義されている', () => {
      expect(COLORS.pillBorder).toBeDefined();
    });

    it('COLORS.pillBackground が定義されている', () => {
      expect(COLORS.pillBackground).toBeDefined();
    });

    it('COLORS.selectedPillBorder が定義されている', () => {
      expect(COLORS.selectedPillBorder).toBeDefined();
    });
  });

  describe('既存カラーが維持されている', () => {
    it('COLORS.background が定義されている', () => {
      expect(COLORS.background).toBe('#0A0A0F');
    });

    it('COLORS.primary が定義されている', () => {
      expect(COLORS.primary).toBe('#4A90D9');
    });
  });
});
