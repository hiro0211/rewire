import { asyncStorageClient } from './asyncStorageClient';
import type { ReviewPromptState } from '@/types/reviewPrompt';

const STORAGE_KEY = 'review_prompt_state';

const DEFAULT_STATE: ReviewPromptState = {
  lastPromptedAt: null,
  dismissCount: 0,
  hasLeftPositiveReview: false,
};

export const reviewPromptStorage = {
  async getState(): Promise<ReviewPromptState> {
    const value = await asyncStorageClient.get<ReviewPromptState>(STORAGE_KEY);
    return value ?? DEFAULT_STATE;
  },

  async recordPromptShown(): Promise<void> {
    const current = await this.getState();
    await asyncStorageClient.set(STORAGE_KEY, {
      ...current,
      lastPromptedAt: new Date().toISOString(),
    });
  },

  async recordDismissal(): Promise<void> {
    const current = await this.getState();
    await asyncStorageClient.set(STORAGE_KEY, {
      ...current,
      lastPromptedAt: new Date().toISOString(),
      dismissCount: current.dismissCount + 1,
    });
  },

  async recordPositiveReview(): Promise<void> {
    const current = await this.getState();
    await asyncStorageClient.set(STORAGE_KEY, {
      ...current,
      lastPromptedAt: new Date().toISOString(),
      hasLeftPositiveReview: true,
    });
  },

  async clear(): Promise<void> {
    await asyncStorageClient.remove(STORAGE_KEY);
  },
};
