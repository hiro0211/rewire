const mockGet = jest.fn();
const mockSet = jest.fn();

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: (...args: any[]) => mockGet(...args),
    set: (...args: any[]) => mockSet(...args),
  },
}));

import { checkinStorage } from '../checkinStorage';

const checkin1 = { id: 'c1', userId: 'u1', date: '2026-02-25', watchedPorn: false, urgeLevel: 3, stressLevel: 2, qualityOfLife: 4, memo: '', createdAt: '2026-02-25T10:00:00Z' };
const checkin2 = { id: 'c2', userId: 'u1', date: '2026-02-26', watchedPorn: false, urgeLevel: 5, stressLevel: 4, qualityOfLife: 3, memo: '', createdAt: '2026-02-26T10:00:00Z' };

describe('checkinStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('全件取得する', async () => {
      mockGet.mockResolvedValue([checkin1, checkin2]);
      const result = await checkinStorage.getAll();
      expect(mockGet).toHaveBeenCalledWith('checkins');
      expect(result).toEqual([checkin1, checkin2]);
    });

    it('未保存時は空配列を返す', async () => {
      mockGet.mockResolvedValue(null);
      const result = await checkinStorage.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getByDate', () => {
    it('指定日のチェックインを返す', async () => {
      mockGet.mockResolvedValue([checkin1, checkin2]);
      const result = await checkinStorage.getByDate('2026-02-25');
      expect(result).toEqual(checkin1);
    });

    it('該当なしの場合はnullを返す', async () => {
      mockGet.mockResolvedValue([checkin1]);
      const result = await checkinStorage.getByDate('2099-01-01');
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('新規チェックインを追加する', async () => {
      mockGet.mockResolvedValue([checkin1]);
      await checkinStorage.save(checkin2 as any);
      expect(mockSet).toHaveBeenCalledWith('checkins', expect.arrayContaining([checkin1, checkin2]));
    });

    it('同日のチェックインを置換する', async () => {
      const updated = { ...checkin1, urgeLevel: 8 };
      mockGet.mockResolvedValue([checkin1]);
      await checkinStorage.save(updated as any);
      const savedData = mockSet.mock.calls[0][1];
      expect(savedData).toHaveLength(1);
      expect(savedData[0].urgeLevel).toBe(8);
    });

    it('日付降順でソートする', async () => {
      mockGet.mockResolvedValue([]);
      // checkin1 is 2/25, checkin2 is 2/26
      await checkinStorage.save(checkin1 as any);
      // Now with checkin1 already saved
      mockGet.mockResolvedValue([checkin1]);
      await checkinStorage.save(checkin2 as any);
      const savedData = mockSet.mock.calls[1][1];
      expect(savedData[0].date).toBe('2026-02-26');
      expect(savedData[1].date).toBe('2026-02-25');
    });
  });

  describe('remove', () => {
    it('指定日のチェックインを削除する', async () => {
      mockGet.mockResolvedValue([checkin1, checkin2]);
      await checkinStorage.remove('2026-02-25');
      expect(mockSet).toHaveBeenCalledWith('checkins', [checkin2]);
    });
  });
});
