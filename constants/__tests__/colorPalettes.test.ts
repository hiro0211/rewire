import { COLORS, GRADIENTS, GLOW, SHADOWS } from '../theme';
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
import type { ColorPalette } from '@/types/theme';

describe('colorPalettes', () => {
  describe('DARK_COLORS', () => {
    it('既存COLORSの全キーを含む', () => {
      const colorsKeys = Object.keys(COLORS) as (keyof typeof COLORS)[];
      for (const key of colorsKeys) {
        expect(DARK_COLORS[key as keyof ColorPalette]).toBe(COLORS[key]);
      }
    });

    it('contrastTextが#FFFFFFである', () => {
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
    it('既存GRADIENTSと一致する', () => {
      expect([...DARK_GRADIENTS.card]).toEqual([...GRADIENTS.card]);
      expect([...DARK_GRADIENTS.hero]).toEqual([...GRADIENTS.hero]);
      expect([...DARK_GRADIENTS.button]).toEqual([...GRADIENTS.button]);
      expect([...DARK_GRADIENTS.danger]).toEqual([...GRADIENTS.danger]);
      expect([...DARK_GRADIENTS.accent]).toEqual([...GRADIENTS.accent]);
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
    it('既存GLOWと一致する', () => {
      expect(DARK_GLOW.purple).toBe(GLOW.purple);
      expect(DARK_GLOW.cyan).toBe(GLOW.cyan);
      expect(DARK_GLOW.danger).toBe(GLOW.danger);
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
    it('既存SHADOWSと一致する', () => {
      expect(DARK_SHADOWS.small).toEqual(SHADOWS.small);
      expect(DARK_SHADOWS.medium).toEqual(SHADOWS.medium);
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
