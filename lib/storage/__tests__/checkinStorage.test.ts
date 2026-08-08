const mockGet = jest.fn();
const mockGetStrict = jest.fn();
const mockSet = jest.fn();

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: (...args: any[]) => mockGet(...args),
    getStrict: (...args: any[]) => mockGetStrict(...args),
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
      mockGetStrict.mockResolvedValue([checkin1, checkin2]);
      const result = await checkinStorage.getAll();
      expect(mockGetStrict).toHaveBeenCalledWith('checkins');
      expect(result).toEqual([checkin1, checkin2]);
    });

    it('未保存時は空配列を返す', async () => {
      mockGetStrict.mockResolvedValue(null);
      const result = await checkinStorage.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getByDate', () => {
    it('指定日のチェックインを返す', async () => {
      mockGetStrict.mockResolvedValue([checkin1, checkin2]);
      const result = await checkinStorage.getByDate('2026-02-25');
      expect(result).toEqual(checkin1);
    });

    it('該当なしの場合はnullを返す', async () => {
      mockGetStrict.mockResolvedValue([checkin1]);
      const result = await checkinStorage.getByDate('2099-01-01');
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('新規チェックインを追加する', async () => {
      mockGetStrict.mockResolvedValue([checkin1]);
      await checkinStorage.save(checkin2 as any);
      expect(mockSet).toHaveBeenCalledWith('checkins', expect.arrayContaining([checkin1, checkin2]));
    });

    it('同日のチェックインを置換する', async () => {
      const updated = { ...checkin1, urgeLevel: 8 };
      mockGetStrict.mockResolvedValue([checkin1]);
      await checkinStorage.save(updated as any);
      const savedData = mockSet.mock.calls[0][1];
      expect(savedData).toHaveLength(1);
      expect(savedData[0].urgeLevel).toBe(8);
    });

    it('日付降順でソートする', async () => {
      mockGetStrict.mockResolvedValue([]);
      // checkin1 is 2/25, checkin2 is 2/26
      await checkinStorage.save(checkin1 as any);
      // Now with checkin1 already saved
      mockGetStrict.mockResolvedValue([checkin1]);
      await checkinStorage.save(checkin2 as any);
      const savedData = mockSet.mock.calls[1][1];
      expect(savedData[0].date).toBe('2026-02-26');
      expect(savedData[1].date).toBe('2026-02-25');
    });

    it('読み込みに失敗した場合は上書き保存せず例外を投げる（履歴消失を防ぐ）', async () => {
      // 復号失敗など「読めない」状態を再現。get() が null を返して []
      // 扱いになると、次の save が全履歴を1件に上書きしてしまう。
      mockGetStrict.mockRejectedValue(new Error('decrypt failed'));
      await expect(checkinStorage.save(checkin2 as any)).rejects.toThrow('decrypt failed');
      expect(mockSet).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('指定日のチェックインを削除する', async () => {
      mockGetStrict.mockResolvedValue([checkin1, checkin2]);
      await checkinStorage.remove('2026-02-25');
      expect(mockSet).toHaveBeenCalledWith('checkins', [checkin2]);
    });
  });
});
