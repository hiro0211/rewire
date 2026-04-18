import { ORB_CHAPTERS, getOrbConfig } from '../orbConfig';
import { CHAPTER_IDS, type ChapterId } from '../badges/BadgeChapter';

describe('orbConfig', () => {
  describe('ORB_CHAPTERS', () => {
    it('全6章の設定が定義されている', () => {
      for (const id of CHAPTER_IDS) {
        expect(ORB_CHAPTERS[id]).toBeDefined();
      }
    });

    it('chaosチャプターのアニメーション設定が正しい', () => {
      const ch = ORB_CHAPTERS.chaos;
      expect(ch.pulseDuration).toBe(4000);
      expect(ch.scaleMin).toBe(0.96);
      expect(ch.scaleMax).toBe(1.04);
      expect(ch.particleCount).toBe(4);
    });

    it('ignitionチャプターはchaosより速いパルス', () => {
      const ch = ORB_CHAPTERS.ignition;
      expect(ch.pulseDuration).toBe(3500);
      expect(ch.pulseDuration).toBeLessThan(ORB_CHAPTERS.chaos.pulseDuration);
    });

    it('formationチャプターのアニメーション設定が正しい', () => {
      const ch = ORB_CHAPTERS.formation;
      expect(ch.pulseDuration).toBe(3000);
    });

    it('lifeチャプターはformationより速いパルス', () => {
      const ch = ORB_CHAPTERS.life;
      expect(ch.pulseDuration).toBe(2600);
      expect(ch.pulseDuration).toBeLessThan(
        ORB_CHAPTERS.formation.pulseDuration
      );
    });

    it('expansionチャプターのアニメーション設定が正しい', () => {
      const ch = ORB_CHAPTERS.expansion;
      expect(ch.pulseDuration).toBe(2200);
    });

    it('transcendenceチャプターは最速パルス', () => {
      const ch = ORB_CHAPTERS.transcendence;
      expect(ch.pulseDuration).toBe(1800);
      expect(ch.pulseDuration).toBeLessThan(
        ORB_CHAPTERS.expansion.pulseDuration
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
    it('chaosで正しい設定を返す', () => {
      expect(getOrbConfig('chaos')).toBe(ORB_CHAPTERS.chaos);
    });

    it('各チャプターIDで正しい設定を返す', () => {
      for (const id of CHAPTER_IDS) {
        expect(getOrbConfig(id)).toBe(ORB_CHAPTERS[id]);
      }
    });
  });
});
