import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Valid keys for AsyncStorage to prevent using arbitrary strings.
 */
export type StorageKey = 
  | 'user'
  | 'checkins'
  | 'breath_sessions'
  | 'recoveries'
  | 'article_read_history'
  | 'settings';

export const asyncStorageClient = {
  async get<T>(key: StorageKey): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error(`Error reading ${key} from storage`, e);
      return null;
    }
  },

  async set<T>(key: StorageKey, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
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
