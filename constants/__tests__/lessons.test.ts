import { LESSONS, type Lesson } from '../lessons';

describe('LESSONS', () => {
  it('全7レッスンが定義されている', () => {
    expect(LESSONS).toHaveLength(7);
  });

  it('各レッスンに必須フィールドが存在する', () => {
    LESSONS.forEach((lesson) => {
      expect(lesson.id).toBeDefined();
      expect(lesson.number).toBeDefined();
      expect(lesson.titleKey).toBeDefined();
      expect(lesson.readMinutes).toBeDefined();
      expect(lesson.contentKey).toBeDefined();
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

  it('titleKeyがlessons.lessonN.title形式である', () => {
    LESSONS.forEach((lesson) => {
      expect(lesson.titleKey).toBe(`lessons.lesson${lesson.number}.title`);
    });
  });

  it('contentKeyがlessons.lessonN.content形式である', () => {
    LESSONS.forEach((lesson) => {
      expect(lesson.contentKey).toBe(`lessons.lesson${lesson.number}.content`);
    });
  });

  it('readMinutesが正の数値である', () => {
    LESSONS.forEach((lesson) => {
      expect(lesson.readMinutes).toBeGreaterThan(0);
    });
  });
});
