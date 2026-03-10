import { create } from 'zustand';
import { breathSessionStorage } from '@/lib/storage/breathSessionStorage';
import { logger } from '@/lib/logger';
import type { BreathSession } from '@/types/models';

interface BreathState {
  sessions: BreathSession[];
  totalSessions: number;
}

interface BreathActions {
  loadSessions: () => Promise<void>;
  addSession: (session: BreathSession) => Promise<void>;
  reset: () => void;
}

export const useBreathStore = create<BreathState & BreathActions>((set, get) => ({
  sessions: [],
  totalSessions: 0,

  loadSessions: async () => {
    try {
      const sessions = await breathSessionStorage.getAll();
      set({ sessions, totalSessions: sessions.length });
    } catch (e) {
      logger.error('BreathStore', 'Failed to load breath sessions', e);
    }
  },

  addSession: async (session) => {
    const { sessions } = get();
    const newSessions = [...sessions, session];
    set({ sessions: newSessions, totalSessions: newSessions.length });
    await breathSessionStorage.save(session);
  },

  reset: () => {
    set({ sessions: [], totalSessions: 0 });
  },
}));
