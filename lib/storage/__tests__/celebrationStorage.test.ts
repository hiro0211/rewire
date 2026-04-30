jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
  },
}));

import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';
import {
  getLastCelebratedStreak,
  setLastCelebratedStreak,
} from '../celebrationStorage';

describe('celebrationStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLastCelebratedStreak', () => {
    it('settings に値がない場合は null を返す', async () => {
      (asyncStorageClient.get as jest.Mock).mockResolvedValue(null);

      const result = await getLastCelebratedStreak();
      expect(result).toBeNull();
    });

    it('settings に lastCelebratedStreak がない場合は null を返す', async () => {
      (asyncStorageClient.get as jest.Mock).mockResolvedValue({
        lastReflectionDate: '2026-04-30',
      });

      const result = await getLastCelebratedStreak();
      expect(result).toBeNull();
    });

    it('settings に lastCelebratedStreak がある場合は数値を返す', async () => {
      (asyncStorageClient.get as jest.Mock).mockResolvedValue({
        lastCelebratedStreak: 9,
      });

      const result = await getLastCelebratedStreak();
      expect(result).toBe(9);
    });

    it('lastCelebratedStreak=0 を正しく扱う（null と区別する）', async () => {
      (asyncStorageClient.get as jest.Mock).mockResolvedValue({
        lastCelebratedStreak: 0,
      });

      const result = await getLastCelebratedStreak();
      expect(result).toBe(0);
    });

    it('読み出しエラー時は null を返す', async () => {
      (asyncStorageClient.get as jest.Mock).mockRejectedValue(new Error('boom'));

      const result = await getLastCelebratedStreak();
      expect(result).toBeNull();
    });
  });

  describe('setLastCelebratedStreak', () => {
    it('既存の settings を保ったまま lastCelebratedStreak を上書きする', async () => {
      (asyncStorageClient.get as jest.Mock).mockResolvedValue({
        lastReflectionDate: '2026-04-30',
        lastCelebratedStreak: 5,
      });

      await setLastCelebratedStreak(10);

      expect(asyncStorageClient.set).toHaveBeenCalledWith('settings', {
        lastReflectionDate: '2026-04-30',
        lastCelebratedStreak: 10,
      });
    });

    it('既存の settings がない場合は新規に作成する', async () => {
      (asyncStorageClient.get as jest.Mock).mockResolvedValue(null);

      await setLastCelebratedStreak(7);

      expect(asyncStorageClient.set).toHaveBeenCalledWith('settings', {
        lastCelebratedStreak: 7,
      });
    });
  });
});
