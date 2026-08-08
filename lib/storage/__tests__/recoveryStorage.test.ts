const mockGetStrict = jest.fn();
const mockSet = jest.fn();

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    getStrict: (...args: any[]) => mockGetStrict(...args),
    set: (...args: any[]) => mockSet(...args),
  },
}));

import { recoveryStorage } from '../recoveryStorage';

const recovery1 = { id: 'r1', userId: 'u1', trigger: 'stress', checkinId: 'c1', createdAt: '2026-02-25T10:00:00Z' };
const recovery2 = { id: 'r2', userId: 'u1', trigger: 'boredom', checkinId: 'c2', createdAt: '2026-02-26T10:00:00Z' };

describe('recoveryStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('未保存時は空配列を返す', async () => {
      mockGetStrict.mockResolvedValue(null);
      expect(await recoveryStorage.getAll()).toEqual([]);
    });

    it('全件取得する', async () => {
      mockGetStrict.mockResolvedValue([recovery1]);
      expect(await recoveryStorage.getAll()).toEqual([recovery1]);
    });
  });

  describe('save', () => {
    it('新規リカバリーを追加する', async () => {
      mockGetStrict.mockResolvedValue([recovery1]);
      await recoveryStorage.save(recovery2 as any);
      expect(mockSet).toHaveBeenCalledWith('recoveries', [recovery1, recovery2]);
    });

    it('読み込みに失敗した場合は上書き保存せず例外を投げる（履歴消失を防ぐ）', async () => {
      mockGetStrict.mockRejectedValue(new Error('decrypt failed'));
      await expect(recoveryStorage.save(recovery2 as any)).rejects.toThrow('decrypt failed');
      expect(mockSet).not.toHaveBeenCalled();
    });
  });
});
