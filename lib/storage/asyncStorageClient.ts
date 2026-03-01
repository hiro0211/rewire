import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptionService } from '../crypto/encryptionService';

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
  | 'discount_first_shown_at';

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
      console.error(`Error reading ${key} from storage`, e);
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
      console.error(`Error writing ${key} to storage`, e);
      throw e;
    }
  },

  async remove(key: StorageKey): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing ${key} from storage`, e);
      throw e;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Error clearing storage', e);
      throw e;
    }
  },
};
