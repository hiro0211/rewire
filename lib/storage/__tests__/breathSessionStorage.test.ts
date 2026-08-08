const mockGetStrict = jest.fn();
const mockSet = jest.fn();

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    getStrict: (...args: any[]) => mockGetStrict(...args),
    set: (...args: any[]) => mockSet(...args),
  },
}));

import { breathSessionStorage } from '../breathSessionStorage';

const session1 = { id: 's1', durationSec: 60, createdAt: '2026-02-25T10:00:00Z' };
const session2 = { id: 's2', durationSec: 90, createdAt: '2026-02-26T10:00:00Z' };

describe('breathSessionStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('未保存時は空配列を返す', async () => {
      mockGetStrict.mockResolvedValue(null);
      expect(await breathSessionStorage.getAll()).toEqual([]);
    });

    it('全件取得する', async () => {
      mockGetStrict.mockResolvedValue([session1]);
      expect(await breathSessionStorage.getAll()).toEqual([session1]);
    });
  });

  describe('save', () => {
    it('新規セッションを追加する', async () => {
      mockGetStrict.mockResolvedValue([session1]);
      await breathSessionStorage.save(session2 as any);
      expect(mockSet).toHaveBeenCalledWith('breath_sessions', [session1, session2]);
    });

    it('読み込みに失敗した場合は上書き保存せず例外を投げる（履歴消失を防ぐ）', async () => {
      mockGetStrict.mockRejectedValue(new Error('decrypt failed'));
      await expect(breathSessionStorage.save(session2 as any)).rejects.toThrow('decrypt failed');
      expect(mockSet).not.toHaveBeenCalled();
    });
  });
});
