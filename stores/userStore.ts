import { create } from 'zustand';
import { userStorage } from '@/lib/storage/userStorage';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';
import { useCheckinStore } from './checkinStore';
import { useBreathStore } from './breathStore';
import type { User } from '@/types/models';

interface UserState {
  user: User | null;
  isLoading: boolean;
  hasHydrated: boolean;
}

interface UserActions {
  setUser: (user: User) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  loadUser: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  user: null,
  isLoading: false,
  hasHydrated: false,

  setUser: async (user) => {
    set({ user });
    await userStorage.save(user);
  },

  updateUser: async (updates) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, ...updates };
      set({ user: updatedUser });
      await userStorage.save(updatedUser);
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await userStorage.get();
      set({ user, hasHydrated: true });
    } catch (e) {
      console.error('Failed to load user', e);
      set({ hasHydrated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: async () => {
    set({ user: null });
    await asyncStorageClient.clearAll();
    useCheckinStore.getState().reset();
    useBreathStore.getState().reset();
  },
}));
