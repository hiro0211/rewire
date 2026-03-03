import { SPACING, RADIUS, FONT_SIZE, LAYOUT } from '../theme';

describe('テーマ定数', () => {
  describe('SPACING', () => {
    it('xs が 4 である', () => {
      expect(SPACING.xs).toBe(4);
    });

    it('screenPadding が 20 である', () => {
      expect(SPACING.screenPadding).toBe(20);
    });

    it('サイズ順が xs < sm < md < lg < xl < xxl < xxxl', () => {
      expect(SPACING.xs).toBeLessThan(SPACING.sm);
      expect(SPACING.sm).toBeLessThan(SPACING.md);
      expect(SPACING.md).toBeLessThan(SPACING.lg);
      expect(SPACING.lg).toBeLessThan(SPACING.xl);
      expect(SPACING.xl).toBeLessThan(SPACING.xxl);
      expect(SPACING.xxl).toBeLessThan(SPACING.xxxl);
    });
  });

  describe('RADIUS', () => {
    it('sm が 6 である', () => {
      expect(RADIUS.sm).toBe(6);
    });

    it('full が 9999 である', () => {
      expect(RADIUS.full).toBe(9999);
    });

    it('サイズ順が sm < md < lg < xl < full', () => {
      expect(RADIUS.sm).toBeLessThan(RADIUS.md);
      expect(RADIUS.md).toBeLessThan(RADIUS.lg);
      expect(RADIUS.lg).toBeLessThan(RADIUS.xl);
      expect(RADIUS.xl).toBeLessThan(RADIUS.full);
    });
  });

  describe('FONT_SIZE', () => {
    it('md（Body）が 16 である', () => {
      expect(FONT_SIZE.md).toBe(16);
    });

    it('display が 48 である', () => {
      expect(FONT_SIZE.display).toBe(48);
    });

    it('サイズ順が xs < sm < md < lg < xl < xxl < xxxl < display', () => {
      expect(FONT_SIZE.xs).toBeLessThan(FONT_SIZE.sm);
      expect(FONT_SIZE.sm).toBeLessThan(FONT_SIZE.md);
      expect(FONT_SIZE.md).toBeLessThan(FONT_SIZE.lg);
      expect(FONT_SIZE.lg).toBeLessThan(FONT_SIZE.xl);
      expect(FONT_SIZE.xl).toBeLessThan(FONT_SIZE.xxl);
      expect(FONT_SIZE.xxl).toBeLessThan(FONT_SIZE.xxxl);
      expect(FONT_SIZE.xxxl).toBeLessThan(FONT_SIZE.display);
    });
  });

  describe('LAYOUT', () => {
    it('buttonHeight が 52 である', () => {
      expect(LAYOUT.buttonHeight).toBe(52);
    });
  });
});
