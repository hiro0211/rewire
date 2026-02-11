import { create } from 'zustand';
import { breathSessionStorage } from '@/lib/storage/breathSessionStorage';
import type { BreathSession } from '@/types/models';

interface BreathState {
  sessions: BreathSession[];
  totalSessions: number;
}

interface BreathActions {
  loadSessions: () => Promise<void>;
  addSession: (session: BreathSession) => Promise<void>;
}

export const useBreathStore = create<BreathState & BreathActions>((set, get) => ({
  sessions: [],
  totalSessions: 0,

  loadSessions: async () => {
    try {
      const sessions = await breathSessionStorage.getAll();
      set({ sessions, totalSessions: sessions.length });
    } catch (e) {
      console.error('Failed to load breath sessions', e);
    }
  },

  addSession: async (session) => {
    const { sessions } = get();
    const newSessions = [...sessions, session];
    set({ sessions: newSessions, totalSessions: newSessions.length });
    await breathSessionStorage.save(session);
  },
}));
