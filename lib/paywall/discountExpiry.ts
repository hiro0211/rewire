import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';

export const discountExpiry = {
  EXPIRY_HOURS: 24,

  async recordFirstExposure(): Promise<void> {
    try {
      const existing = await asyncStorageClient.get<string>('discount_first_shown_at');
      if (existing != null) return;
      await asyncStorageClient.set('discount_first_shown_at', new Date().toISOString());
    } catch {
      // フェイルオープン: エラー時は何もしない
    }
  },

  async isDiscountExpired(): Promise<boolean> {
    try {
      const stored = await asyncStorageClient.get<string>('discount_first_shown_at');
      if (stored == null) return false;

      const firstShown = new Date(stored).getTime();
      if (isNaN(firstShown)) return false;

      const elapsed = Date.now() - firstShown;
      const expiryMs = discountExpiry.EXPIRY_HOURS * 60 * 60 * 1000;
      return elapsed >= expiryMs;
    } catch {
      return false;
    }
  },

  async getRemainingSeconds(): Promise<number> {
    const fullDuration = discountExpiry.EXPIRY_HOURS * 60 * 60;
    try {
      const stored = await asyncStorageClient.get<string>('discount_first_shown_at');
      if (stored == null) return fullDuration;

      const firstShown = new Date(stored).getTime();
      if (isNaN(firstShown)) return fullDuration;

      const elapsedMs = Date.now() - firstShown;
      const remainingSeconds = Math.floor((discountExpiry.EXPIRY_HOURS * 60 * 60 * 1000 - elapsedMs) / 1000);
      return Math.max(remainingSeconds, 0);
    } catch {
      return fullDuration;
    }
  },
};
