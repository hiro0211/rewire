import { BADGE_DEFINITIONS } from '../BADGE_DEFINITIONS';
import { CHAPTERS } from '../BadgeChapter';

describe('BADGE_DEFINITIONS', () => {
  it('18バッジが定義されている', () => {
    expect(BADGE_DEFINITIONS).toHaveLength(18);
  });

  it('日数が昇順に並んでいる', () => {
    for (let i = 1; i < BADGE_DEFINITIONS.length; i++) {
      expect(BADGE_DEFINITIONS[i].day).toBeGreaterThan(
        BADGE_DEFINITIONS[i - 1].day
      );
    }
  });

  it('全バッジのIDがユニークである', () => {
    const ids = BADGE_DEFINITIONS.map((b) => b.id);
    expect(new Set(ids).size).toBe(18);
  });

  it('全バッジのnameJaが空でない', () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.nameJa.length).toBeGreaterThan(0);
    }
  });

  it('全バッジのnameEnが空でない', () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.nameEn.length).toBeGreaterThan(0);
    }
  });

  it('全バッジのmessageが60文字以内である', () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.message.length).toBeLessThanOrEqual(60);
    }
  });

  it('全バッジのvisualが空でない', () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.visual.length).toBeGreaterThan(0);
    }
  });

  it('全バッジのneuralが空でない', () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.neural.length).toBeGreaterThan(0);
    }
  });

  it('全バッジが有効なchapterに所属している', () => {
    const chapterIds = CHAPTERS.map((c) => c.id);
    for (const badge of BADGE_DEFINITIONS) {
      expect(chapterIds).toContain(badge.chapter);
    }
  });

  it('全バッジの色が#形式である', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.colors.core).toMatch(hexPattern);
      expect(badge.colors.mid).toMatch(hexPattern);
      expect(badge.colors.outer).toMatch(hexPattern);
      expect(badge.colors.glow).toMatch(hexPattern);
    }
  });

  it('先頭バッジはstardustでday=0', () => {
    expect(BADGE_DEFINITIONS[0].id).toBe('stardust');
    expect(BADGE_DEFINITIONS[0].day).toBe(0);
  });

  it('末尾バッジはcosmosでday=1095', () => {
    const last = BADGE_DEFINITIONS[BADGE_DEFINITIONS.length - 1];
    expect(last.id).toBe('cosmos');
    expect(last.day).toBe(1095);
  });

  it('章ごとのバッジ数が正しい', () => {
    const countByChapter = BADGE_DEFINITIONS.reduce(
      (acc, b) => {
        acc[b.chapter] = (acc[b.chapter] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    expect(countByChapter['birth']).toBe(3);
    expect(countByChapter['innerPlanets']).toBe(3);
    expect(countByChapter['terrestrial']).toBe(3);
    expect(countByChapter['outerPlanets']).toBe(3);
    expect(countByChapter['stellar']).toBe(3);
    expect(countByChapter['cosmic']).toBe(3);
  });
});
