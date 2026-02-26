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

import { userStorage } from '../userStorage';

const testUser = {
  id: 'user-1',
  nickname: 'Test',
  goalDays: 30,
  streakStartDate: '2026-01-01',
  isPro: false,
  notifyTime: '22:00',
  notifyEnabled: true,
  createdAt: '2026-01-01T00:00:00Z',
  consentGivenAt: '2026-01-01T00:00:00Z',
  ageVerifiedAt: null,
};

describe('userStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('ユーザーを取得する', async () => {
      mockGet.mockResolvedValue(testUser);
      const result = await userStorage.get();
      expect(mockGet).toHaveBeenCalledWith('user');
      expect(result).toEqual(testUser);
    });

    it('未保存時はnullを返す', async () => {
      mockGet.mockResolvedValue(null);
      const result = await userStorage.get();
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('asyncStorageClient.setを呼び出す', async () => {
      await userStorage.save(testUser as any);
      expect(mockSet).toHaveBeenCalledWith('user', testUser);
    });
  });

  describe('update', () => {
    it('既存ユーザーと部分更新をマージして保存', async () => {
      mockGet.mockResolvedValue(testUser);
      await userStorage.update({ nickname: 'Updated' });
      expect(mockSet).toHaveBeenCalledWith('user', { ...testUser, nickname: 'Updated' });
    });

    it('ユーザーが存在しない場合は何もしない', async () => {
      mockGet.mockResolvedValue(null);
      await userStorage.update({ nickname: 'Updated' });
      expect(mockSet).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('removeを呼び出す', async () => {
      await userStorage.clear();
      expect(mockRemove).toHaveBeenCalledWith('user');
    });
  });
});
