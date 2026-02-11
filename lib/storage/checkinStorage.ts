import { asyncStorageClient } from './asyncStorageClient';
import type { DailyCheckin } from '@/types/models';

const STORAGE_KEY = 'checkins';

export const checkinStorage = {
  async getAll(): Promise<DailyCheckin[]> {
    const data = await asyncStorageClient.get<DailyCheckin[]>(STORAGE_KEY);
    return data ?? [];
  },

  async getByDate(date: string): Promise<DailyCheckin | null> {
    const all = await this.getAll();
    return all.find((c) => c.date === date) ?? null;
  },

  async save(checkin: DailyCheckin): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex((c) => c.date === checkin.date);
    if (index >= 0) {
      all[index] = checkin;
    } else {
      all.push(checkin);
    }
    // Sort by date descending
    all.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
    await asyncStorageClient.set(STORAGE_KEY, all);
  },

  async remove(date: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter((c) => c.date !== date);
    await asyncStorageClient.set(STORAGE_KEY, filtered);
  },
};
