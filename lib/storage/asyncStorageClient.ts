import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptionService } from '../crypto/encryptionService';
import { logger } from '../logger';

/**
 * Valid keys for AsyncStorage to prevent using arbitrary strings.
 */
export type StorageKey =
  | 'user'
  | 'checkins'
  | 'breath_sessions'
  | 'recoveries'
  | 'article_read_history'
  | 'settings'
  | 'discount_first_shown_at'
  | 'learn_progress'
  | 'survey_completed'
  | 'survey_prompt_state'
  | 'review_prompt_state';

const SENSITIVE_KEYS: StorageKey[] = ['checkins', 'recoveries', 'breath_sessions'];

export const asyncStorageClient = {
  async get<T>(key: StorageKey): Promise<T | null> {
    try {
      const rawValue = await AsyncStorage.getItem(key);
      if (rawValue == null) return null;

      if (SENSITIVE_KEYS.includes(key)) {
        // Handle PLAIN: prefix (fallback when crypto.subtle is unavailable)
        if (rawValue.startsWith('PLAIN:')) {
          return JSON.parse(rawValue.substring(6));
        }
        if (encryptionService.isEncrypted(rawValue)) {
          const decrypted = await encryptionService.decrypt(rawValue);
          return JSON.parse(decrypted);
        }
        // Migration: unencrypted data from before encryption was added
        // Will be encrypted on next write
        return JSON.parse(rawValue);
      }

      return JSON.parse(rawValue);
    } catch (e) {
      logger.error('Storage', `Error reading ${key}`, e);
      return null;
    }
  },

  async set<T>(key: StorageKey, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);

      if (SENSITIVE_KEYS.includes(key)) {
        const encrypted = await encryptionService.encrypt(jsonValue);
        await AsyncStorage.setItem(key, encrypted);
      } else {
        await AsyncStorage.setItem(key, jsonValue);
      }
    } catch (e) {
      logger.error('Storage', `Error writing ${key}`, e);
      throw e;
    }
  },

  async remove(key: StorageKey): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      logger.error('Storage', `Error removing ${key}`, e);
      throw e;
    }
  },

  async clearAll(): Promise<void> {
    try {
      const settingsBackup = await AsyncStorage.getItem('settings');
      await AsyncStorage.clear();
      if (settingsBackup != null) {
        await AsyncStorage.setItem('settings', settingsBackup);
      }
    } catch (e) {
      logger.error('Storage', 'Error clearing storage', e);
      throw e;
    }
  },
};
