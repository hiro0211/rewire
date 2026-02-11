import { asyncStorageClient } from './asyncStorageClient';
import type { User } from '@/types/models';

const STORAGE_KEY = 'user';

export const userStorage = {
  async get(): Promise<User | null> {
    return asyncStorageClient.get<User>(STORAGE_KEY);
  },

  async save(user: User): Promise<void> {
    await asyncStorageClient.set(STORAGE_KEY, user);
  },

  async update(updates: Partial<User>): Promise<void> {
    const current = await this.get();
    if (current) {
      await this.save({ ...current, ...updates });
    }
  },

  async clear(): Promise<void> {
    await asyncStorageClient.remove(STORAGE_KEY);
  },
};
