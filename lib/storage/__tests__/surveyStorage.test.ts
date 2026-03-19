const mockGet = jest.fn();
const mockSet = jest.fn();
const mockRemove = jest.fn();

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: (...args: any[]) => mockGet(...args),
    set: (...args: any[]) => mockSet(...args),
    remove: (...args: any[]) => mockRemove(...args),
  },
}));

import { surveyStorage } from '../surveyStorage';

describe('surveyStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isCompleted', () => {
    it('完了済みの場合trueを返す', async () => {
      mockGet.mockResolvedValue('2026-03-18T00:00:00Z');
      const result = await surveyStorage.isCompleted();
      expect(mockGet).toHaveBeenCalledWith('survey_completed');
      expect(result).toBe(true);
    });

    it('未完了の場合falseを返す', async () => {
      mockGet.mockResolvedValue(null);
      const result = await surveyStorage.isCompleted();
      expect(result).toBe(false);
    });
  });

  describe('markCompleted', () => {
    it('完了タイムスタンプを保存する', async () => {
      const before = Date.now();
      await surveyStorage.markCompleted();
      expect(mockSet).toHaveBeenCalledWith('survey_completed', expect.any(String));
      const savedTimestamp = mockSet.mock.calls[0][1];
      const savedTime = new Date(savedTimestamp).getTime();
      expect(savedTime).toBeGreaterThanOrEqual(before);
    });
  });

  describe('clear', () => {
    it('完了状態をクリアする', async () => {
      await surveyStorage.clear();
      expect(mockRemove).toHaveBeenCalledWith('survey_completed');
    });
  });
});
