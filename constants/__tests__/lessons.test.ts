import { LESSONS, type Lesson } from '../lessons';

describe('LESSONS', () => {
  it('全7レッスンが定義されている', () => {
    expect(LESSONS).toHaveLength(7);
  });

  it('各レッスンに必須フィールドが存在する', () => {
    LESSONS.forEach((lesson) => {
      expect(lesson.id).toBeDefined();
      expect(lesson.number).toBeDefined();
      expect(lesson.title).toBeDefined();
      expect(lesson.readMinutes).toBeDefined();
      expect(lesson.content).toBeDefined();
    });
  });

  it('レッスン番号が1から7まで連番である', () => {
    const numbers = LESSONS.map((l) => l.number);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('IDがlesson-N形式である', () => {
    LESSONS.forEach((lesson) => {
      expect(lesson.id).toBe(`lesson-${lesson.number}`);
    });
  });

  it('タイトルがMDファイルの原題と一致する', () => {
    const expectedTitles = [
      'ポルノは報酬系の仕組みを変えてしまう',
      '脱感作 ― 同じ刺激では満足できなくなる脳',
      '前頭前皮質の弱体化 ― 「やめたいのにやめられない」の正体',
      '感作 ― ポルノへの「引き金」が刻まれる',
      '性機能への影響 ― ポルノが現実の性生活を壊していく',
      'メンタルヘルスへの影響 ― 不安・抑うつ・孤独感のループ',
      '脳の可塑性 ― 変化は元に戻せる',
    ];
    const titles = LESSONS.map((l) => l.title);
    expect(titles).toEqual(expectedTitles);
  });

  it('各レッスンの本文が空でない', () => {
    LESSONS.forEach((lesson) => {
      expect(lesson.content.length).toBeGreaterThan(0);
    });
  });

  it('readMinutesが正の数値である', () => {
    LESSONS.forEach((lesson) => {
      expect(lesson.readMinutes).toBeGreaterThan(0);
    });
  });
});
