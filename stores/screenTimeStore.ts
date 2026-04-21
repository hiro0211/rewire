import { create } from 'zustand';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';

const STORAGE_KEY = 'screenTime';

interface ScreenTimeState {
  enabled: boolean;
}

interface ScreenTimeActions {
  setEnabled: (enabled: boolean) => Promise<void>;
  loadEnabled: () => Promise<void>;
}

interface PersistedData {
  enabled?: boolean;
}

export const useScreenTimeStore = create<ScreenTimeState & ScreenTimeActions>((set) => ({
  enabled: false,

  setEnabled: async (enabled) => {
    set({ enabled });
    const existing = (await asyncStorageClient.get<Record<string, unknown>>(STORAGE_KEY)) ?? {};
    await asyncStorageClient.set(STORAGE_KEY, { ...existing, enabled });
  },

  loadEnabled: async () => {
    try {
      const data = await asyncStorageClient.get<PersistedData>(STORAGE_KEY);
      if (typeof data?.enabled === 'boolean') {
        set({ enabled: data.enabled });
      }
    } catch {
      // Keep default false
    }
  },
}));
