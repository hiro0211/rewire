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

    it('borderGlass が押せる境界として視認できる不透明度である', () => {
      // 背景 #0A0A0F 上でガラスカード/ボタンの境界を可視化するため、
      // iOS HIG 視認性基準に合わせて不透明度を 0.22 に引き上げる
      expect(DARK_COLORS.borderGlass).toBe('rgba(255,255,255,0.22)');
    });

    it('pillBorder が borderGlass と同じ視認レベルである', () => {
      // DayChip 等のピル型要素も同じ視認レベルで統一
      expect(DARK_COLORS.pillBorder).toBe('rgba(255, 255, 255, 0.22)');
    });

    it('textSecondary が WCAG AA を満たす明るさである', () => {
      // #0A0A0F 背景で 2.8:1 → 6.8:1（AA 達成）に引き上げ。
      // Apple HIG 推奨: ラベル・説明文の可読性向上
      expect(DARK_COLORS.textSecondary).toBe('#9CA0B5');
    });

    it('border が surface 上で視認できる明るさである', () => {
      // surface(#0F0F15) 上で #2A2A35 は 1.4:1 でほぼ不可視。
      // #3A3A4A に引き上げて ToolCard 等の境界を可視化
      expect(DARK_COLORS.border).toBe('#3A3A4A');
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

    it('borderGlass が押せる境界として視認できる不透明度である', () => {
      // 明るい背景でも境界が認識できるよう 0.06 → 0.14 に引き上げ
      expect(LIGHT_COLORS.borderGlass).toBe('rgba(0,0,0,0.14)');
    });

    it('pillBorder が borderGlass と同じ視認レベルである', () => {
      expect(LIGHT_COLORS.pillBorder).toBe('rgba(0, 0, 0, 0.14)');
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
