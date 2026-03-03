import {
  DARK_COLORS,
  LIGHT_COLORS,
  DARK_GRADIENTS,
  LIGHT_GRADIENTS,
  DARK_GLOW,
  LIGHT_GLOW,
  DARK_SHADOWS,
  LIGHT_SHADOWS,
} from '../colorPalettes';

describe('colorPalettes', () => {
  describe('DARK_COLORS', () => {
    it('background が #0A0A0F である', () => {
      expect(DARK_COLORS.background).toBe('#0A0A0F');
    });

    it('primary が #4A90D9 である', () => {
      expect(DARK_COLORS.primary).toBe('#4A90D9');
    });

    it('contrastText が #FFFFFF である', () => {
      expect(DARK_COLORS.contrastText).toBe('#FFFFFF');
    });
  });

  describe('LIGHT_COLORS', () => {
    it('DARK_COLORSと同じキーを持つ', () => {
      const darkKeys = Object.keys(DARK_COLORS).sort();
      const lightKeys = Object.keys(LIGHT_COLORS).sort();
      expect(lightKeys).toEqual(darkKeys);
    });

    it('backgroundがダークとは異なる明るい色', () => {
      expect(LIGHT_COLORS.background).not.toBe(DARK_COLORS.background);
    });

    it('contrastTextが#FFFFFFである（ボタン文字用）', () => {
      expect(LIGHT_COLORS.contrastText).toBe('#FFFFFF');
    });
  });

  describe('DARK_GRADIENTS', () => {
    it('card グラデーションが3色の配列', () => {
      expect([...DARK_GRADIENTS.card]).toEqual(['#2D1B69', '#1A1035', '#0A0A0F']);
    });

    it('button グラデーションが2色の配列', () => {
      expect([...DARK_GRADIENTS.button]).toEqual(['#8B5CF6', '#6D28D9']);
    });
  });

  describe('LIGHT_GRADIENTS', () => {
    it('DARK_GRADIENTSと同じキーを持つ', () => {
      const darkKeys = Object.keys(DARK_GRADIENTS).sort();
      const lightKeys = Object.keys(LIGHT_GRADIENTS).sort();
      expect(lightKeys).toEqual(darkKeys);
    });
  });

  describe('DARK_GLOW', () => {
    it('purple glow が定義されている', () => {
      expect(DARK_GLOW.purple).toBe('rgba(139, 92, 246, 0.3)');
    });

    it('cyan glow が定義されている', () => {
      expect(DARK_GLOW.cyan).toBe('rgba(0, 212, 255, 0.2)');
    });
  });

  describe('LIGHT_GLOW', () => {
    it('DARK_GLOWと同じキーを持つ', () => {
      const darkKeys = Object.keys(DARK_GLOW).sort();
      const lightKeys = Object.keys(LIGHT_GLOW).sort();
      expect(lightKeys).toEqual(darkKeys);
    });
  });

  describe('DARK_SHADOWS', () => {
    it('small shadow が定義されている', () => {
      expect(DARK_SHADOWS.small.shadowColor).toBe('#000');
      expect(DARK_SHADOWS.small.elevation).toBe(2);
    });

    it('medium shadow が定義されている', () => {
      expect(DARK_SHADOWS.medium.shadowColor).toBe('#000');
      expect(DARK_SHADOWS.medium.elevation).toBe(4);
    });
  });

  describe('LIGHT_SHADOWS', () => {
    it('DARK_SHADOWSと同じキーを持つ', () => {
      const darkKeys = Object.keys(DARK_SHADOWS).sort();
      const lightKeys = Object.keys(LIGHT_SHADOWS).sort();
      expect(lightKeys).toEqual(darkKeys);
    });
  });
});
