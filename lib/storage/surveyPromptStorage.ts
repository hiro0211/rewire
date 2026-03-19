import { asyncStorageClient } from './asyncStorageClient';
import type { SurveyPromptState } from '@/types/surveyPrompt';

const STORAGE_KEY = 'survey_prompt_state';

const DEFAULT_STATE: SurveyPromptState = {
  lastPromptedAt: null,
  dismissCount: 0,
};

export const surveyPromptStorage = {
  async getState(): Promise<SurveyPromptState> {
    const value = await asyncStorageClient.get<SurveyPromptState>(STORAGE_KEY);
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

  async clear(): Promise<void> {
    await asyncStorageClient.remove(STORAGE_KEY);
  },
};
