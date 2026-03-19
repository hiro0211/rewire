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

import { surveyPromptStorage } from '../surveyPromptStorage';
import type { SurveyPromptState } from '@/types/surveyPrompt';

describe('surveyPromptStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getState', () => {
    it('未保存時はデフォルト値を返す', async () => {
      mockGet.mockResolvedValue(null);

      const state = await surveyPromptStorage.getState();

      expect(state).toEqual({ lastPromptedAt: null, dismissCount: 0 });
      expect(mockGet).toHaveBeenCalledWith('survey_prompt_state');
    });

    it('保存済みの状態を返す', async () => {
      const saved: SurveyPromptState = {
        lastPromptedAt: '2026-01-01T00:00:00Z',
        dismissCount: 2,
      };
      mockGet.mockResolvedValue(saved);

      const state = await surveyPromptStorage.getState();

      expect(state).toEqual(saved);
    });
  });

  describe('recordPromptShown', () => {
    it('lastPromptedAtを現在時刻で更新する', async () => {
      mockGet.mockResolvedValue({ lastPromptedAt: null, dismissCount: 0 });
      mockSet.mockResolvedValue(undefined);

      const before = new Date().toISOString();
      await surveyPromptStorage.recordPromptShown();
      const after = new Date().toISOString();

      expect(mockSet).toHaveBeenCalledTimes(1);
      const [key, value] = mockSet.mock.calls[0];
      expect(key).toBe('survey_prompt_state');
      expect(value.lastPromptedAt >= before).toBe(true);
      expect(value.lastPromptedAt <= after).toBe(true);
      expect(value.dismissCount).toBe(0);
    });
  });

  describe('recordDismissal', () => {
    it('dismissCountをインクリメントしlastPromptedAtを更新する', async () => {
      mockGet.mockResolvedValue({ lastPromptedAt: '2026-01-01T00:00:00Z', dismissCount: 1 });
      mockSet.mockResolvedValue(undefined);

      await surveyPromptStorage.recordDismissal();

      expect(mockSet).toHaveBeenCalledTimes(1);
      const [key, value] = mockSet.mock.calls[0];
      expect(key).toBe('survey_prompt_state');
      expect(value.dismissCount).toBe(2);
      expect(value.lastPromptedAt).not.toBe('2026-01-01T00:00:00Z');
    });

    it('初回dismissでdismissCountが1になる', async () => {
      mockGet.mockResolvedValue({ lastPromptedAt: null, dismissCount: 0 });
      mockSet.mockResolvedValue(undefined);

      await surveyPromptStorage.recordDismissal();

      const [, value] = mockSet.mock.calls[0];
      expect(value.dismissCount).toBe(1);
    });
  });

  describe('clear', () => {
    it('ストレージからキーを削除する', async () => {
      mockRemove.mockResolvedValue(undefined);

      await surveyPromptStorage.clear();

      expect(mockRemove).toHaveBeenCalledWith('survey_prompt_state');
    });
  });
});
