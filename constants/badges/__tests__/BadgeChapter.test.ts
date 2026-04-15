import { CHAPTERS, type ChapterId } from '../BadgeChapter';

describe('CHAPTERS', () => {
  it('6章が定義されている', () => {
    expect(CHAPTERS).toHaveLength(6);
  });

  it('全章のIDがユニークである', () => {
    const ids = CHAPTERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(6);
  });

  it('全章にid, nameJa, nameEnフィールドがある', () => {
    for (const chapter of CHAPTERS) {
      expect(chapter.id).toBeTruthy();
      expect(chapter.nameJa).toBeTruthy();
      expect(chapter.nameEn).toBeTruthy();
    }
  });

  it('章IDの順序が正しい', () => {
    const ids = CHAPTERS.map((c) => c.id);
    expect(ids).toEqual([
      'chaos',
      'ignition',
      'formation',
      'life',
      'expansion',
      'transcendence',
    ]);
  });

  it('ChapterId型が6つのリテラルを含む', () => {
    const validIds: ChapterId[] = [
      'chaos',
      'ignition',
      'formation',
      'life',
      'expansion',
      'transcendence',
    ];
    expect(validIds).toHaveLength(6);
  });
});
