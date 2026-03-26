import {
  BRAND_CATCHPHRASE_KEYS,
  BRAND_TIMING_CONFIG,
  calculateBrandTimings,
} from '../brandConfig';

describe('brandConfig', () => {
  describe('BRAND_CATCHPHRASE_KEYS', () => {
    it('キャッチフレーズキーが2つある', () => {
      expect(BRAND_CATCHPHRASE_KEYS).toHaveLength(2);
    });

    it('各キーが翻訳キー形式の文字列である', () => {
      BRAND_CATCHPHRASE_KEYS.forEach((key: string) => {
        expect(typeof key).toBe('string');
        expect(key.length).toBeGreaterThan(0);
        expect(key).toMatch(/^brand\./);
      });
    });
  });

  describe('BRAND_TIMING_CONFIG', () => {
    it('charInterval が定義されている', () => {
      expect(BRAND_TIMING_CONFIG.charInterval).toBe(80);
    });
  });

  describe('calculateBrandTimings', () => {
    it('デフォルト設定で正しいタイミングを返す', () => {
      const result = calculateBrandTimings(BRAND_TIMING_CONFIG, BRAND_CATCHPHRASE_KEYS.length);
      expect(result.logo).toBe(300);
      expect(result.lines).toEqual([1000, 4000]);
      expect(result.lineAnimDuration).toBe(400);
    });

    it('navigate が最終行の表示開始 + アニメーション時間 + pause の後になる', () => {
      const result = calculateBrandTimings(BRAND_TIMING_CONFIG, BRAND_CATCHPHRASE_KEYS.length);
      const lastLineStart = result.lines[result.lines.length - 1];
      expect(result.navigate).toBe(lastLineStart + BRAND_TIMING_CONFIG.lineAnimDuration + BRAND_TIMING_CONFIG.postTextPause);
    });

    it('navigate は常に全ての行の表示開始より後になる', () => {
      const result = calculateBrandTimings(BRAND_TIMING_CONFIG, BRAND_CATCHPHRASE_KEYS.length);
      result.lines.forEach((lineTime) => {
        expect(result.navigate).toBeGreaterThan(lineTime);
      });
    });

    it('lines の数が lineCount と一致する', () => {
      const result = calculateBrandTimings(BRAND_TIMING_CONFIG, 5);
      expect(result.lines).toHaveLength(5);
    });

    it('lines が昇順に並んでいる', () => {
      const result = calculateBrandTimings(BRAND_TIMING_CONFIG, 5);
      for (let i = 1; i < result.lines.length; i++) {
        expect(result.lines[i]).toBeGreaterThan(result.lines[i - 1]);
      }
    });

    it('カスタム設定で正しく計算される', () => {
      const customConfig = {
        logoDelay: 500,
        lineStartDelay: 2000,
        lineInterval: 1000,
        lineAnimDuration: 600,
        postTextPause: 1000,
        charInterval: 80,
      };
      const result = calculateBrandTimings(customConfig, 2);
      expect(result.logo).toBe(500);
      expect(result.lines).toEqual([2000, 3000]);
      expect(result.navigate).toBe(3000 + 600 + 1000);
      expect(result.lineAnimDuration).toBe(600);
    });

    it('lineCount=0 のとき lines は空配列で navigate は lineStartDelay + animDuration + pause', () => {
      const result = calculateBrandTimings(BRAND_TIMING_CONFIG, 0);
      expect(result.lines).toEqual([]);
      // 行がない場合: lineStartDelay を基準に navigate を計算
      expect(result.navigate).toBe(
        BRAND_TIMING_CONFIG.lineStartDelay + BRAND_TIMING_CONFIG.lineAnimDuration + BRAND_TIMING_CONFIG.postTextPause
      );
    });
  });
});
