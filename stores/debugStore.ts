import { create } from 'zustand';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';

interface DebugState {
  /**
   * デバッグプレビュー用フラグ。true のとき:
   *   - オンボーディングをスキップ（dev user を seed して /(tabs) へ）
   *   - 全 18 バッジをアンロック済みとして表示
   *
   * ⚠️ 効果は必ず DEBUG_MENU_ENABLED との二重ゲート（useDebugUnlockAll）を通す。
   *    リリースビルド（DEBUG_MENU_ENABLED=false）ではこの値が true でも無効。
   */
  enabled: boolean;
  hasHydrated: boolean;
}

interface DebugActions {
  setEnabled: (enabled: boolean) => Promise<void>;
  loadDebugSettings: () => Promise<void>;
}

interface DebugData {
  enabled?: boolean;
}

export const useDebugStore = create<DebugState & DebugActions>((set) => ({
  enabled: false,
  hasHydrated: false,

  setEnabled: async (enabled) => {
    set({ enabled });
    try {
      await asyncStorageClient.set('debug', { enabled });
    } catch {
      // 永続化に失敗してもメモリ上の状態は維持する
    }
  },

  loadDebugSettings: async () => {
    try {
      const data = await asyncStorageClient.get<DebugData>('debug');
      if (typeof data?.enabled === 'boolean') {
        set({ enabled: data.enabled });
      }
    } catch {
      // Keep default (false)
    } finally {
      set({ hasHydrated: true });
    }
  },
}));
