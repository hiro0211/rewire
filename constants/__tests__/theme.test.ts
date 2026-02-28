import { COLORS, GRADIENTS, GLOW } from '../theme';

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

  describe('GRADIENTS 定数', () => {
    it('card グラデーションが3色の配列', () => {
      expect(GRADIENTS.card).toHaveLength(3);
      expect(GRADIENTS.card[0]).toBe('#2D1B69');
    });

    it('hero グラデーションが2色の配列', () => {
      expect(GRADIENTS.hero).toHaveLength(2);
      expect(GRADIENTS.hero[0]).toBe('#1E0A3C');
    });

    it('button グラデーションが2色の配列', () => {
      expect(GRADIENTS.button).toHaveLength(2);
      expect(GRADIENTS.button[0]).toBe('#8B5CF6');
    });

    it('danger グラデーションが2色の配列', () => {
      expect(GRADIENTS.danger).toHaveLength(2);
      expect(GRADIENTS.danger[0]).toBe('#EF4444');
    });

    it('accent グラデーションが2色の配列', () => {
      expect(GRADIENTS.accent).toHaveLength(2);
      expect(GRADIENTS.accent[0]).toBe('#00D4FF');
    });
  });

  describe('GLOW 定数', () => {
    it('purple glow が定義されている', () => {
      expect(GLOW.purple).toBe('rgba(139, 92, 246, 0.3)');
    });

    it('cyan glow が定義されている', () => {
      expect(GLOW.cyan).toBe('rgba(0, 212, 255, 0.2)');
    });

    it('danger glow が定義されている', () => {
      expect(GLOW.danger).toBe('rgba(239, 68, 68, 0.3)');
    });
  });
});
