import { discountExpiry } from '../discountExpiry';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const mockGet = asyncStorageClient.get as jest.Mock;
const mockSet = asyncStorageClient.set as jest.Mock;

describe('discountExpiry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('EXPIRY_HOURS', () => {
    it('24が設定されている', () => {
      expect(discountExpiry.EXPIRY_HOURS).toBe(24);
    });
  });

  describe('recordFirstExposure', () => {
    it('未保存時に現在時刻を保存する', async () => {
      mockGet.mockResolvedValue(null);
      mockSet.mockResolvedValue(undefined);

      await discountExpiry.recordFirstExposure();

      expect(mockGet).toHaveBeenCalledWith('discount_first_shown_at');
      expect(mockSet).toHaveBeenCalledWith(
        'discount_first_shown_at',
        expect.any(String)
      );
    });

    it('保存済みの場合は上書きしない', async () => {
      mockGet.mockResolvedValue('2025-01-01T00:00:00.000Z');

      await discountExpiry.recordFirstExposure();

      expect(mockGet).toHaveBeenCalledWith('discount_first_shown_at');
      expect(mockSet).not.toHaveBeenCalled();
    });

    it('エラー時も例外を投げない', async () => {
      mockGet.mockRejectedValue(new Error('storage error'));

      await expect(discountExpiry.recordFirstExposure()).resolves.not.toThrow();
    });
  });

  describe('isDiscountExpired', () => {
    it('未保存の場合はfalseを返す', async () => {
      mockGet.mockResolvedValue(null);

      const result = await discountExpiry.isDiscountExpired();

      expect(result).toBe(false);
    });

    it('24時間未満の場合はfalseを返す', async () => {
      const recent = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString();
      mockGet.mockResolvedValue(recent);

      const result = await discountExpiry.isDiscountExpired();

      expect(result).toBe(false);
    });

    it('24時間以上経過の場合はtrueを返す', async () => {
      const old = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      mockGet.mockResolvedValue(old);

      const result = await discountExpiry.isDiscountExpired();

      expect(result).toBe(true);
    });

    it('エラー時はfalseを返す（フェイルオープン）', async () => {
      mockGet.mockRejectedValue(new Error('storage error'));

      const result = await discountExpiry.isDiscountExpired();

      expect(result).toBe(false);
    });

    it('不正な日付値の場合はfalseを返す', async () => {
      mockGet.mockResolvedValue('invalid-date');

      const result = await discountExpiry.isDiscountExpired();

      expect(result).toBe(false);
    });
  });

  describe('getRemainingSeconds', () => {
    it('残り時間を秒数で返す', async () => {
      // 1時間前に初回表示 → 残り23時間 = 82800秒
      const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
      mockGet.mockResolvedValue(oneHourAgo);

      const result = await discountExpiry.getRemainingSeconds();

      // 多少の誤差を許容
      expect(result).toBeGreaterThan(82790);
      expect(result).toBeLessThanOrEqual(82800);
    });

    it('期限切れの場合は0を返す', async () => {
      const old = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      mockGet.mockResolvedValue(old);

      const result = await discountExpiry.getRemainingSeconds();

      expect(result).toBe(0);
    });

    it('未保存の場合は24時間分の秒数を返す', async () => {
      mockGet.mockResolvedValue(null);

      const result = await discountExpiry.getRemainingSeconds();

      expect(result).toBe(24 * 60 * 60);
    });

    it('エラー時は24時間分の秒数を返す（フェイルオープン）', async () => {
      mockGet.mockRejectedValue(new Error('storage error'));

      const result = await discountExpiry.getRemainingSeconds();

      expect(result).toBe(24 * 60 * 60);
    });

    it('不正な日付値の場合は24時間分の秒数を返す', async () => {
      mockGet.mockResolvedValue('invalid-date');

      const result = await discountExpiry.getRemainingSeconds();

      expect(result).toBe(24 * 60 * 60);
    });
  });
});
