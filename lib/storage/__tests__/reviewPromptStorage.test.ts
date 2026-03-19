const mockGet = jest.fn();
const mockSet = jest.fn();
const mockRemove = jest.fn();

jest.mock('../asyncStorageClient', () => ({
  asyncStorageClient: {
    get: (...args: any[]) => mockGet(...args),
    set: (...args: any[]) => mockSet(...args),
    remove: (...args: any[]) => mockRemove(...args),
  },
}));

import { reviewPromptStorage } from '../reviewPromptStorage';
import type { ReviewPromptState } from '@/types/reviewPrompt';

describe('reviewPromptStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getState', () => {
    it('未保存時はデフォルト値を返す', async () => {
      mockGet.mockResolvedValue(null);

      const state = await reviewPromptStorage.getState();

      expect(state).toEqual({
        lastPromptedAt: null,
        dismissCount: 0,
        hasLeftPositiveReview: false,
      });
      expect(mockGet).toHaveBeenCalledWith('review_prompt_state');
    });

    it('保存済みの状態を返す', async () => {
      const saved: ReviewPromptState = {
        lastPromptedAt: '2026-01-01T00:00:00Z',
        dismissCount: 2,
        hasLeftPositiveReview: false,
      };
      mockGet.mockResolvedValue(saved);

      const state = await reviewPromptStorage.getState();

      expect(state).toEqual(saved);
    });
  });

  describe('recordPromptShown', () => {
    it('lastPromptedAtを現在時刻で更新する', async () => {
      mockGet.mockResolvedValue({ lastPromptedAt: null, dismissCount: 0, hasLeftPositiveReview: false });
      mockSet.mockResolvedValue(undefined);

      const before = new Date().toISOString();
      await reviewPromptStorage.recordPromptShown();
      const after = new Date().toISOString();

      const [key, value] = mockSet.mock.calls[0];
      expect(key).toBe('review_prompt_state');
      expect(value.lastPromptedAt >= before).toBe(true);
      expect(value.lastPromptedAt <= after).toBe(true);
      expect(value.dismissCount).toBe(0);
      expect(value.hasLeftPositiveReview).toBe(false);
    });
  });

  describe('recordDismissal', () => {
    it('dismissCountをインクリメントしlastPromptedAtを更新する', async () => {
      mockGet.mockResolvedValue({ lastPromptedAt: '2026-01-01T00:00:00Z', dismissCount: 1, hasLeftPositiveReview: false });
      mockSet.mockResolvedValue(undefined);

      await reviewPromptStorage.recordDismissal();

      const [key, value] = mockSet.mock.calls[0];
      expect(key).toBe('review_prompt_state');
      expect(value.dismissCount).toBe(2);
      expect(value.lastPromptedAt).not.toBe('2026-01-01T00:00:00Z');
    });

    it('初回dismissでdismissCountが1になる', async () => {
      mockGet.mockResolvedValue({ lastPromptedAt: null, dismissCount: 0, hasLeftPositiveReview: false });
      mockSet.mockResolvedValue(undefined);

      await reviewPromptStorage.recordDismissal();

      const [, value] = mockSet.mock.calls[0];
      expect(value.dismissCount).toBe(1);
    });
  });

  describe('recordPositiveReview', () => {
    it('hasLeftPositiveReviewをtrueに設定する', async () => {
      mockGet.mockResolvedValue({ lastPromptedAt: null, dismissCount: 0, hasLeftPositiveReview: false });
      mockSet.mockResolvedValue(undefined);

      await reviewPromptStorage.recordPositiveReview();

      const [key, value] = mockSet.mock.calls[0];
      expect(key).toBe('review_prompt_state');
      expect(value.hasLeftPositiveReview).toBe(true);
      expect(value.lastPromptedAt).not.toBeNull();
    });
  });

  describe('clear', () => {
    it('ストレージからキーを削除する', async () => {
      mockRemove.mockResolvedValue(undefined);

      await reviewPromptStorage.clear();

      expect(mockRemove).toHaveBeenCalledWith('review_prompt_state');
    });
  });
});
