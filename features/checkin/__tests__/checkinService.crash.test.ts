jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid-123',
}));

const mockUserGet = jest.fn();
const mockUserUpdate = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/storage/userStorage', () => ({
  userStorage: {
    get: (...args: any[]) => mockUserGet(...args),
    update: (...args: any[]) => mockUserUpdate(...args),
  },
}));

const mockGetByDate = jest.fn().mockResolvedValue(null);
const mockCheckinSave = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/storage/checkinStorage', () => ({
  checkinStorage: {
    getByDate: (...args: any[]) => mockGetByDate(...args),
    save: (...args: any[]) => mockCheckinSave(...args),
  },
}));

import { checkinService } from '../checkinService';

describe('checkinService crash prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserGet.mockResolvedValue({ id: 'user-1', streakStartDate: '2026-02-01T00:00:00Z' });
  });

  it('watchedPorn=null → バリデーションエラー（クラッシュしない）', async () => {
    await expect(
      checkinService.processCheckin({
        watchedPorn: null,
        urgeLevel: 3,
        stressLevel: 3,
        qualityOfLife: 3,
      })
    ).rejects.toThrow();
  });

  it('watchedPorn=true, user=null → クラッシュしない', async () => {
    mockUserGet.mockResolvedValue(null);
    const result = await checkinService.processCheckin({
      watchedPorn: true,
      urgeLevel: 3,
      stressLevel: 3,
      qualityOfLife: 3,
    });
    expect(result.userId).toBe('unknown');
    expect(result.watchedPorn).toBe(true);
  });

  it('watchedPorn=false, user=null → クラッシュしない', async () => {
    mockUserGet.mockResolvedValue(null);
    const result = await checkinService.processCheckin({
      watchedPorn: false,
      urgeLevel: 1,
      stressLevel: 1,
      qualityOfLife: 5,
    });
    expect(result.userId).toBe('unknown');
    expect(result.watchedPorn).toBe(false);
  });

  it('watchedPorn=false, streakStartDate=null → 新規streak開始', async () => {
    mockUserGet.mockResolvedValue({ id: 'user-1', streakStartDate: null });
    await checkinService.processCheckin({
      watchedPorn: false,
      urgeLevel: 2,
      stressLevel: 2,
      qualityOfLife: 3,
    });
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ streakStartDate: expect.any(String) })
    );
  });

  it('watchedPorn=true → streakStartDateリセット', async () => {
    await checkinService.processCheckin({
      watchedPorn: true,
      urgeLevel: 5,
      stressLevel: 5,
      qualityOfLife: 1,
    });
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ streakStartDate: expect.any(String) })
    );
  });

  it('memo=undefined → クラッシュしない', async () => {
    const result = await checkinService.processCheckin({
      watchedPorn: false,
      urgeLevel: 3,
      stressLevel: 3,
      qualityOfLife: 3,
      memo: undefined,
    });
    expect(result.memo).toBeUndefined();
  });

  it('memo=非常に長い文字列 → クラッシュしない', async () => {
    const longMemo = 'a'.repeat(10000);
    const result = await checkinService.processCheckin({
      watchedPorn: false,
      urgeLevel: 3,
      stressLevel: 3,
      qualityOfLife: 3,
      memo: longMemo,
    });
    expect(result.memo).toBe(longMemo);
  });

  it('urgeLevel=0 → クラッシュしない', async () => {
    const result = await checkinService.processCheckin({
      watchedPorn: false,
      urgeLevel: 0,
      stressLevel: 0,
      qualityOfLife: 1,
    });
    expect(result.urgeLevel).toBe(0);
  });

  it('やり直し: 前回watchedPorn=true → streak復元', async () => {
    mockUserGet.mockResolvedValue({
      id: 'user-1',
      streakStartDate: '2026-02-26T00:00:00Z',
      previousStreakStartDate: '2026-01-01T00:00:00Z',
    });
    mockGetByDate.mockResolvedValue({ watchedPorn: true });

    await checkinService.processCheckin({
      watchedPorn: false,
      urgeLevel: 2,
      stressLevel: 2,
      qualityOfLife: 4,
    });

    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        streakStartDate: '2026-01-01T00:00:00Z',
        previousStreakStartDate: null,
      })
    );
  });

  it('userStorage.get()がthrow → エラー伝播', async () => {
    mockUserGet.mockRejectedValue(new Error('Storage error'));
    await expect(
      checkinService.processCheckin({
        watchedPorn: true,
        urgeLevel: 3,
        stressLevel: 3,
        qualityOfLife: 3,
      })
    ).rejects.toThrow('Storage error');
  });
});
