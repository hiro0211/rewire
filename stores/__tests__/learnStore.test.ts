const mockGet = jest.fn();
const mockSet = jest.fn().mockResolvedValue(undefined);

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: (...args: unknown[]) => mockGet(...args),
    set: (...args: unknown[]) => mockSet(...args),
  },
}));

import { useLearnStore } from '../learnStore';
import { LESSONS } from '@/constants/lessons';

describe('learnStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLearnStore.setState({ completedLessons: [] });
  });

  describe('初期状態', () => {
    it('completedLessonsが空配列である', () => {
      expect(useLearnStore.getState().completedLessons).toEqual([]);
    });
  });

  describe('completeLesson', () => {
    it('レッスンIDを完了リストに追加する', async () => {
      await useLearnStore.getState().completeLesson('lesson-1');

      expect(useLearnStore.getState().completedLessons).toEqual(['lesson-1']);
    });

    it('同じレッスンを二重登録しない', async () => {
      await useLearnStore.getState().completeLesson('lesson-1');
      await useLearnStore.getState().completeLesson('lesson-1');

      expect(useLearnStore.getState().completedLessons).toEqual(['lesson-1']);
    });

    it('AsyncStorageに永続化する', async () => {
      await useLearnStore.getState().completeLesson('lesson-1');

      expect(mockSet).toHaveBeenCalledWith('learn_progress', {
        completedLessons: ['lesson-1'],
      });
    });
  });

  describe('isCompleted', () => {
    it('完了済みレッスンに対してtrueを返す', async () => {
      await useLearnStore.getState().completeLesson('lesson-1');

      expect(useLearnStore.getState().isCompleted('lesson-1')).toBe(true);
    });

    it('未完了レッスンに対してfalseを返す', () => {
      expect(useLearnStore.getState().isCompleted('lesson-1')).toBe(false);
    });
  });

  describe('isUnlocked', () => {
    it('最初のレッスンは常にアンロック済み', () => {
      expect(useLearnStore.getState().isUnlocked(LESSONS[0])).toBe(true);
    });

    it('前のレッスンが未完了なら次はロック', () => {
      expect(useLearnStore.getState().isUnlocked(LESSONS[1])).toBe(false);
    });

    it('前のレッスンが完了なら次はアンロック', async () => {
      await useLearnStore.getState().completeLesson('lesson-1');

      expect(useLearnStore.getState().isUnlocked(LESSONS[1])).toBe(true);
    });

    it('レッスン3はレッスン2が完了していればアンロック', async () => {
      await useLearnStore.getState().completeLesson('lesson-1');
      await useLearnStore.getState().completeLesson('lesson-2');

      expect(useLearnStore.getState().isUnlocked(LESSONS[2])).toBe(true);
    });

    it('レッスン3はレッスン1だけ完了ではロック', async () => {
      await useLearnStore.getState().completeLesson('lesson-1');

      expect(useLearnStore.getState().isUnlocked(LESSONS[2])).toBe(false);
    });
  });

  describe('resetProgress', () => {
    it('全進捗をリセットする', async () => {
      await useLearnStore.getState().completeLesson('lesson-1');
      await useLearnStore.getState().completeLesson('lesson-2');

      await useLearnStore.getState().resetProgress();

      expect(useLearnStore.getState().completedLessons).toEqual([]);
    });

    it('リセット後AsyncStorageに空配列を保存する', async () => {
      await useLearnStore.getState().resetProgress();

      expect(mockSet).toHaveBeenCalledWith('learn_progress', {
        completedLessons: [],
      });
    });
  });

  describe('loadProgress', () => {
    it('ストレージから進捗を読み込む', async () => {
      mockGet.mockResolvedValueOnce({ completedLessons: ['lesson-1', 'lesson-2'] });

      await useLearnStore.getState().loadProgress();

      expect(useLearnStore.getState().completedLessons).toEqual(['lesson-1', 'lesson-2']);
      expect(mockGet).toHaveBeenCalledWith('learn_progress');
    });

    it('ストレージが空の場合は空配列のまま', async () => {
      mockGet.mockResolvedValueOnce(null);

      await useLearnStore.getState().loadProgress();

      expect(useLearnStore.getState().completedLessons).toEqual([]);
    });

    it('ストレージエラー時も空配列のまま', async () => {
      mockGet.mockRejectedValueOnce(new Error('Storage error'));

      await useLearnStore.getState().loadProgress();

      expect(useLearnStore.getState().completedLessons).toEqual([]);
    });
  });
});
