import { asyncStorageClient } from './asyncStorageClient';
import type { Recovery } from '@/types/models';

const STORAGE_KEY = 'recoveries';

export const recoveryStorage = {
  async getAll(): Promise<Recovery[]> {
    const data = await asyncStorageClient.get<Recovery[]>(STORAGE_KEY);
    return data ?? [];
  },

  async save(recovery: Recovery): Promise<void> {
    const all = await this.getAll();
    all.push(recovery);
    await asyncStorageClient.set(STORAGE_KEY, all);
  },
};
