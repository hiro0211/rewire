const mockGet = jest.fn();
const mockAdd = jest.fn();
const mockWhere = jest.fn();

const mockCollection = jest.fn(() => ({
  where: (...args: any[]) => {
    mockWhere(...args);
    return { get: () => mockGet(), where: mockWhere };
  },
  add: (...args: any[]) => mockAdd(...args),
}));

jest.mock('@/lib/nativeGuard', () => ({
  isExpoGo: false,
}));

jest.mock('@react-native-firebase/firestore', () => ({
  default: () => ({
    collection: (...args: any[]) => {
      mockCollection(...args);
      return mockCollection(...args);
    },
  }),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { promoFirestoreClient } from '../promoFirestoreClient';

describe('promoFirestoreClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection.mockImplementation(() => ({
      where: (...args: any[]) => {
        mockWhere(...args);
        return { get: () => mockGet(), where: mockWhere };
      },
      add: (...args: any[]) => mockAdd(...args),
    }));
  });

  describe('validateCode', () => {
    it('有効なコードの場合はPromoCodeオブジェクトを返す', async () => {
      mockGet.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({
              code: 'REWIRE2026',
              source: 'general',
              maxUses: 500,
              currentUses: 10,
              isActive: true,
            }),
          },
        ],
      });

      const result = await promoFirestoreClient.validateCode('REWIRE2026');

      expect(mockCollection).toHaveBeenCalledWith('promoCodes');
      expect(mockWhere).toHaveBeenCalledWith('code', '==', 'REWIRE2026');
      expect(result).toEqual({
        code: 'REWIRE2026',
        source: 'general',
        maxUses: 500,
        currentUses: 10,
        isActive: true,
      });
    });

    it('存在しないコードの場合はnullを返す', async () => {
      mockGet.mockResolvedValue({ empty: true, docs: [] });

      const result = await promoFirestoreClient.validateCode('INVALID');
      expect(result).toBeNull();
    });

    it('無効化されたコードの場合はnullを返す', async () => {
      mockGet.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({
              code: 'EXPIRED',
              source: 'general',
              maxUses: 100,
              currentUses: 100,
              isActive: false,
            }),
          },
        ],
      });

      const result = await promoFirestoreClient.validateCode('EXPIRED');
      expect(result).toBeNull();
    });

    it('入力コードを大文字に正規化する', async () => {
      mockGet.mockResolvedValue({ empty: true, docs: [] });

      await promoFirestoreClient.validateCode('rewire2026');

      expect(mockWhere).toHaveBeenCalledWith('code', '==', 'REWIRE2026');
    });

    it('Firestoreエラー時はnullを返す', async () => {
      mockGet.mockRejectedValue(new Error('Network error'));

      const result = await promoFirestoreClient.validateCode('REWIRE2026');
      expect(result).toBeNull();
    });
  });

  describe('recordRedemption', () => {
    it('promoRedemptionsコレクションに使用記録を書き込む', async () => {
      mockAdd.mockResolvedValue({});

      const redemption = {
        userId: 'user-1',
        code: 'REWIRE2026',
        source: 'general',
        redeemedAt: '2026-03-21T00:00:00.000Z',
        platform: 'ios' as const,
        appVersion: '1.0.0',
      };

      await promoFirestoreClient.recordRedemption(redemption);

      expect(mockCollection).toHaveBeenCalledWith('promoRedemptions');
      expect(mockAdd).toHaveBeenCalledWith(redemption);
    });

    it('Firestoreエラー時でもthrowしない', async () => {
      mockAdd.mockRejectedValue(new Error('Write failed'));

      await expect(
        promoFirestoreClient.recordRedemption({
          userId: 'user-1',
          code: 'REWIRE2026',
          source: 'general',
          redeemedAt: '2026-03-21T00:00:00.000Z',
          platform: 'ios',
          appVersion: '1.0.0',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('isAlreadyRedeemed', () => {
    it('既に使用済みの場合はtrueを返す', async () => {
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ userId: 'user-1', code: 'REWIRE2026' }) }],
      });

      const result = await promoFirestoreClient.isAlreadyRedeemed('user-1');
      expect(result).toBe(true);
      expect(mockCollection).toHaveBeenCalledWith('promoRedemptions');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user-1');
    });

    it('未使用の場合はfalseを返す', async () => {
      mockGet.mockResolvedValue({ empty: true, docs: [] });

      const result = await promoFirestoreClient.isAlreadyRedeemed('user-1');
      expect(result).toBe(false);
    });

    it('Firestoreエラー時はfalseを返す', async () => {
      mockGet.mockRejectedValue(new Error('Network error'));

      const result = await promoFirestoreClient.isAlreadyRedeemed('user-1');
      expect(result).toBe(false);
    });
  });
});
