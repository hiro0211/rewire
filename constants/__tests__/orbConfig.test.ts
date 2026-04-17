import { ORB_CHAPTERS, getOrbConfig } from '../orbConfig';
import { CHAPTER_IDS, type ChapterId } from '../badges/BadgeChapter';

describe('orbConfig', () => {
  describe('ORB_CHAPTERS', () => {
    it('全6章の設定が定義されている', () => {
      for (const id of CHAPTER_IDS) {
        expect(ORB_CHAPTERS[id]).toBeDefined();
      }
    });

    it('chaosチャプターは海王星ブルー', () => {
      const ch = ORB_CHAPTERS.chaos;
      expect(ch.colors).toEqual(['#4A7EC2', '#8CB4E0', '#1E3D6B']);
      expect(ch.pulseDuration).toBe(4000);
    });

    it('ignitionチャプターはオレンジ系でchaosより速いパルス', () => {
      const ch = ORB_CHAPTERS.ignition;
      expect(ch.colors).toEqual(['#FFB547', '#FFE4A0', '#FF7847']);
      expect(ch.pulseDuration).toBe(3500);
      expect(ch.pulseDuration).toBeLessThan(ORB_CHAPTERS.chaos.pulseDuration);
    });

    it('formationチャプターはブラウン系', () => {
      const ch = ORB_CHAPTERS.formation;
      expect(ch.colors).toEqual(['#D17842', '#F4C58A', '#8B3A0F']);
      expect(ch.pulseDuration).toBe(3000);
    });

    it('lifeチャプターはブルー系でformationより速いパルス', () => {
      const ch = ORB_CHAPTERS.life;
      expect(ch.colors).toEqual(['#4A90E2', '#A8D8F0', '#2B5F9E']);
      expect(ch.pulseDuration).toBe(2600);
      expect(ch.pulseDuration).toBeLessThan(
        ORB_CHAPTERS.formation.pulseDuration
      );
    });

    it('expansionチャプターはシアン系', () => {
      const ch = ORB_CHAPTERS.expansion;
      expect(ch.colors).toEqual(['#5CE1E6', '#B8F5F7', '#1E6B7F']);
      expect(ch.pulseDuration).toBe(2200);
    });

    it('transcendenceチャプターはピンク系で最速パルス', () => {
      const ch = ORB_CHAPTERS.transcendence;
      expect(ch.colors).toEqual(['#EC4899', '#FBCFE8', '#831843']);
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

    it('全チャプターがrgba形式のglowColorを持つ', () => {
      for (const id of CHAPTER_IDS) {
        expect(ORB_CHAPTERS[id].glowColor).toMatch(/^rgba\(/);
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
