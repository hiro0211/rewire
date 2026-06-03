import { create } from 'zustand';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';

const STORAGE_KEY = 'screenTime';

export interface ScreenTimePersisted {
  enabled?: boolean;
  selectionToken?: string | null;
  selectionApplicationCount?: number;
  lastShieldedAt?: number | null;
  lastClearedAt?: number | null;
  removalLocked?: boolean;
  lastRemovalLockedAt?: number | null;
}

interface ScreenTimeState {
  enabled: boolean;
  selectionToken: string | null;
  selectionApplicationCount: number;
  lastShieldedAt: number | null;
  lastClearedAt: number | null;
  removalLocked: boolean;
  lastRemovalLockedAt: number | null;
}

interface ScreenTimeActions {
  setSelection: (token: string, applicationCount: number) => Promise<void>;
  clearSelection: () => Promise<void>;
  markShielded: () => Promise<void>;
  markCleared: () => Promise<void>;
  markRemovalLocked: () => Promise<void>;
  markRemovalUnlocked: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const INITIAL_STATE: ScreenTimeState = {
  enabled: false,
  selectionToken: null,
  selectionApplicationCount: 0,
  lastShieldedAt: null,
  lastClearedAt: null,
  removalLocked: false,
  lastRemovalLockedAt: null,
};

async function persist(state: ScreenTimeState): Promise<void> {
  const payload: ScreenTimePersisted = {
    enabled: state.enabled,
    selectionToken: state.selectionToken,
    selectionApplicationCount: state.selectionApplicationCount,
    lastShieldedAt: state.lastShieldedAt,
    lastClearedAt: state.lastClearedAt,
    removalLocked: state.removalLocked,
    lastRemovalLockedAt: state.lastRemovalLockedAt,
  };
  await asyncStorageClient.set(STORAGE_KEY, payload);
}

export const useScreenTimeStore = create<ScreenTimeState & ScreenTimeActions>(
  (set, get) => ({
    ...INITIAL_STATE,

    setSelection: async (token, applicationCount) => {
      set({ selectionToken: token, selectionApplicationCount: applicationCount });
      await persist(get());
    },

    clearSelection: async () => {
      set({ selectionToken: null, selectionApplicationCount: 0 });
      await persist(get());
    },

    markShielded: async () => {
      set({ enabled: true, lastShieldedAt: Date.now() });
      await persist(get());
    },

    markCleared: async () => {
      set({ enabled: false, lastClearedAt: Date.now() });
      await persist(get());
    },

    markRemovalLocked: async () => {
      set({ removalLocked: true, lastRemovalLockedAt: Date.now() });
      await persist(get());
    },

    markRemovalUnlocked: async () => {
      set({ removalLocked: false });
      await persist(get());
    },

    loadFromStorage: async () => {
      try {
        const data = await asyncStorageClient.get<ScreenTimePersisted>(STORAGE_KEY);
        if (!data) return;
        set({
          enabled: data.enabled ?? false,
          selectionToken: data.selectionToken ?? null,
          selectionApplicationCount: data.selectionApplicationCount ?? 0,
          lastShieldedAt: data.lastShieldedAt ?? null,
          lastClearedAt: data.lastClearedAt ?? null,
          removalLocked: data.removalLocked ?? false,
          lastRemovalLockedAt: data.lastRemovalLockedAt ?? null,
        });
      } catch {
        // Keep defaults
      }
    },
  }),
);
