import { ORB_CHAPTERS, getOrbConfig } from '../orbConfig';
import { CHAPTER_IDS, type ChapterId } from '../badges/BadgeChapter';

describe('orbConfig', () => {
  describe('ORB_CHAPTERS', () => {
    it('全6章の設定が定義されている', () => {
      for (const id of CHAPTER_IDS) {
        expect(ORB_CHAPTERS[id]).toBeDefined();
      }
    });

    it('birthチャプターのアニメーション設定が正しい', () => {
      const ch = ORB_CHAPTERS.birth;
      expect(ch.pulseDuration).toBe(4000);
      expect(ch.scaleMin).toBe(0.96);
      expect(ch.scaleMax).toBe(1.04);
      expect(ch.particleCount).toBe(4);
    });

    it('innerPlanetsチャプターはbirthより速いパルス', () => {
      const ch = ORB_CHAPTERS.innerPlanets;
      expect(ch.pulseDuration).toBe(3500);
      expect(ch.pulseDuration).toBeLessThan(ORB_CHAPTERS.birth.pulseDuration);
    });

    it('terrestrialチャプターのアニメーション設定が正しい', () => {
      const ch = ORB_CHAPTERS.terrestrial;
      expect(ch.pulseDuration).toBe(3000);
    });

    it('outerPlanetsチャプターはterrestrialより速いパルス', () => {
      const ch = ORB_CHAPTERS.outerPlanets;
      expect(ch.pulseDuration).toBe(2600);
      expect(ch.pulseDuration).toBeLessThan(
        ORB_CHAPTERS.terrestrial.pulseDuration
      );
    });

    it('stellarチャプターのアニメーション設定が正しい', () => {
      const ch = ORB_CHAPTERS.stellar;
      expect(ch.pulseDuration).toBe(2200);
    });

    it('cosmicチャプターは最速パルス', () => {
      const ch = ORB_CHAPTERS.cosmic;
      expect(ch.pulseDuration).toBe(1800);
      expect(ch.pulseDuration).toBeLessThan(
        ORB_CHAPTERS.stellar.pulseDuration
      );
    });

    it('全チャプターがparticleCountを持つ', () => {
      for (const id of CHAPTER_IDS) {
        expect(ORB_CHAPTERS[id].particleCount).toBeGreaterThanOrEqual(4);
        expect(ORB_CHAPTERS[id].particleCount).toBeLessThanOrEqual(10);
      }
    });

    it('particleCountが章の進行とともに増える', () => {
      const counts = CHAPTER_IDS.map((id) => ORB_CHAPTERS[id].particleCount);
      for (let i = 1; i < counts.length; i++) {
        expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
      }
    });

    it('全チャプターがscaleMin < scaleMaxを満たす', () => {
      for (const id of CHAPTER_IDS) {
        const ch = ORB_CHAPTERS[id];
        expect(ch.scaleMin).toBeLessThan(ch.scaleMax);
      }
    });

    it('パルス速度が章の進行とともに速くなる', () => {
      const durations = CHAPTER_IDS.map((id) => ORB_CHAPTERS[id].pulseDuration);
      for (let i = 1; i < durations.length; i++) {
        expect(durations[i]).toBeLessThan(durations[i - 1]);
      }
    });
  });

  describe('getOrbConfig', () => {
    it('birthで正しい設定を返す', () => {
      expect(getOrbConfig('birth')).toBe(ORB_CHAPTERS.birth);
    });

    it('各チャプターIDで正しい設定を返す', () => {
      for (const id of CHAPTER_IDS) {
        expect(getOrbConfig(id)).toBe(ORB_CHAPTERS[id]);
      }
    });
  });
});
