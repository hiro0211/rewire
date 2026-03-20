export interface Lesson {
  id: string;
  number: number;
  titleKey: string;
  readMinutes: number;
  contentKey: string;
}

export const LESSONS: Lesson[] = [
  { id: 'lesson-1', number: 1, titleKey: 'lessons.lesson1.title', readMinutes: 2, contentKey: 'lessons.lesson1.content' },
  { id: 'lesson-2', number: 2, titleKey: 'lessons.lesson2.title', readMinutes: 2, contentKey: 'lessons.lesson2.content' },
  { id: 'lesson-3', number: 3, titleKey: 'lessons.lesson3.title', readMinutes: 2, contentKey: 'lessons.lesson3.content' },
  { id: 'lesson-4', number: 4, titleKey: 'lessons.lesson4.title', readMinutes: 2, contentKey: 'lessons.lesson4.content' },
  { id: 'lesson-5', number: 5, titleKey: 'lessons.lesson5.title', readMinutes: 2, contentKey: 'lessons.lesson5.content' },
  { id: 'lesson-6', number: 6, titleKey: 'lessons.lesson6.title', readMinutes: 2, contentKey: 'lessons.lesson6.content' },
  { id: 'lesson-7', number: 7, titleKey: 'lessons.lesson7.title', readMinutes: 2, contentKey: 'lessons.lesson7.content' },
];
