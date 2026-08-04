import { create } from 'zustand';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';

interface PaywallState {
  /**
   * ペイウォールを最後に表示した時刻（ISO文字列）。未表示なら null。
   * 起動時ペイウォールの再表示間隔の判定にだけ使う。
   */
  lastShownAt: string | null;
  hasHydrated: boolean;
}

interface PaywallActions {
  loadLaunchPaywallState: () => Promise<void>;
  markLaunchPaywallShown: (now?: Date) => Promise<void>;
}

interface PaywallData {
  lastShownAt?: string;
}

export const usePaywallStore = create<PaywallState & PaywallActions>((set) => ({
  lastShownAt: null,
  hasHydrated: false,

  loadLaunchPaywallState: async () => {
    try {
      const data = await asyncStorageClient.get<PaywallData>('paywall_cooldown');
      if (typeof data?.lastShownAt === 'string') {
        set({ lastShownAt: data.lastShownAt });
      }
    } catch {
      // 読めなくても既定（未記録＝表示する）で進む
    } finally {
      // brand.tsx がこのフラグで遷移の待機を解くため、失敗時も必ず立てる
      set({ hasHydrated: true });
    }
  },

  markLaunchPaywallShown: async (now = new Date()) => {
    const lastShownAt = now.toISOString();
    set({ lastShownAt });
    try {
      await asyncStorageClient.set('paywall_cooldown', { lastShownAt });
    } catch {
      // 永続化に失敗してもメモリ上の状態は維持する
    }
  },
}));
