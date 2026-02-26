jest.mock('expo-crypto', () => ({
  randomUUID: () => 'mock-uuid-123',
}));

const mockUserStorageGet = jest.fn();
const mockUserStorageUpdate = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/storage/userStorage', () => ({
  userStorage: {
    get: () => mockUserStorageGet(),
    update: (...args: any[]) => mockUserStorageUpdate(...args),
  },
}));

const mockCheckinStorageGetByDate = jest.fn();
jest.mock('@/lib/storage/checkinStorage', () => ({
  checkinStorage: {
    getByDate: (d: string) => mockCheckinStorageGetByDate(d),
  },
}));

import { checkinService } from '../checkinService';
import type { CheckinFormInput } from '@/types/checkin';

const validInput: CheckinFormInput = {
  watchedPorn: false,
  urgeLevel: 2,
  stressLevel: 3,
  qualityOfLife: 4,
  memo: 'テストメモ',
};

const mockUserData = {
  id: 'user-1',
  nickname: 'Test',
  streakStartDate: '2025-01-01',
  previousStreakStartDate: null,
};

describe('checkinService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserStorageGet.mockResolvedValue(mockUserData);
    mockCheckinStorageGetByDate.mockResolvedValue(null);
  });

  describe('processCheckin - バリデーション', () => {
    it('watchedPornがnullの場合エラーをthrowする', async () => {
      await expect(
        checkinService.processCheckin({ ...validInput, watchedPorn: null }),
      ).rejects.toThrow('ポルノ視聴の有無を選択してください');
    });
  });

  describe('processCheckin - 正常系', () => {
    it('正しいチェックインオブジェクトを返す', async () => {
      const result = await checkinService.processCheckin(validInput);

      expect(result).toMatchObject({
        id: 'mock-uuid-123',
        userId: 'user-1',
        watchedPorn: false,
        urgeLevel: 2,
        stressLevel: 3,
        qualityOfLife: 4,
        memo: 'テストメモ',
      });
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.createdAt).toBeTruthy();
    });
  });

  describe('processCheckin - リラプス（watchedPorn=true）', () => {
    it('streakStartDateをリセットしてpreviousStreakStartDateにバックアップする', async () => {
      await checkinService.processCheckin({ ...validInput, watchedPorn: true });

      expect(mockUserStorageUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          previousStreakStartDate: '2025-01-01',
        }),
      );
      // streakStartDate should be set to now (ISO string)
      const updateCall = mockUserStorageUpdate.mock.calls[0][0];
      expect(updateCall.streakStartDate).toBeTruthy();
    });

    it('ユーザーのstreakStartDateがnullでもクラッシュしない', async () => {
      mockUserStorageGet.mockResolvedValue({ ...mockUserData, streakStartDate: null });

      const result = await checkinService.processCheckin({ ...validInput, watchedPorn: true });
      expect(result).toBeTruthy();
      expect(mockUserStorageUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ previousStreakStartDate: null }),
      );
    });
  });

  describe('processCheckin - やり直し（undo relapse）', () => {
    it('今日のチェックインがwatchedPorn=trueだった場合、previousStreakStartDateを復元する', async () => {
      mockCheckinStorageGetByDate.mockResolvedValue({ watchedPorn: true });
      mockUserStorageGet.mockResolvedValue({
        ...mockUserData,
        previousStreakStartDate: '2024-12-01',
      });

      await checkinService.processCheckin(validInput);

      expect(mockUserStorageUpdate).toHaveBeenCalledWith({
        streakStartDate: '2024-12-01',
        previousStreakStartDate: null,
      });
    });

    it('previousStreakStartDateがnullの場合は復元しない', async () => {
      mockCheckinStorageGetByDate.mockResolvedValue({ watchedPorn: true });
      mockUserStorageGet.mockResolvedValue({
        ...mockUserData,
        previousStreakStartDate: null,
      });

      await checkinService.processCheckin(validInput);

      // No restore call since previousStreakStartDate is null
      expect(mockUserStorageUpdate).not.toHaveBeenCalledWith(
        expect.objectContaining({ previousStreakStartDate: null, streakStartDate: expect.any(String) }),
      );
    });
  });

  describe('processCheckin - ユーザーがnull', () => {
    it('ユーザーがnullでもcheckinを返す（userId=unknown）', async () => {
      mockUserStorageGet.mockResolvedValue(null);

      const result = await checkinService.processCheckin(validInput);
      expect(result.userId).toBe('unknown');
    });
  });

  describe('processCheckin - streakStartDateがnull', () => {
    it('watchedPorn=falseでstreakStartDateがnullの場合、新しいstreakStartDateを設定する', async () => {
      mockUserStorageGet.mockResolvedValue({ ...mockUserData, streakStartDate: null });
      mockCheckinStorageGetByDate.mockResolvedValue(null);

      await checkinService.processCheckin(validInput);

      expect(mockUserStorageUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          streakStartDate: expect.any(String),
        }),
      );
    });
  });
});
