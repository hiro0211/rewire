const mockGet = jest.fn();
const mockSet = jest.fn().mockResolvedValue(undefined);

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: (...args: any[]) => mockGet(...args),
    set: (...args: any[]) => mockSet(...args),
  },
}));

import { useThemeStore } from '../themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useThemeStore.setState({ themePreference: 'dark' });
  });

  describe('初期状態', () => {
    it('デフォルトはdark', () => {
      expect(useThemeStore.getState().themePreference).toBe('dark');
    });
  });

  describe('setThemePreference', () => {
    it('lightに変更できる', async () => {
      await useThemeStore.getState().setThemePreference('light');

      expect(useThemeStore.getState().themePreference).toBe('light');
    });

    it('systemに変更できる', async () => {
      await useThemeStore.getState().setThemePreference('system');

      expect(useThemeStore.getState().themePreference).toBe('system');
    });

    it('AsyncStorageのsettingsキーに永続化する', async () => {
      mockGet.mockResolvedValueOnce(null);
      await useThemeStore.getState().setThemePreference('light');

      expect(mockSet).toHaveBeenCalledWith('settings', { themePreference: 'light' });
    });

    it('既存のsettingsデータをマージして保存する', async () => {
      mockGet.mockResolvedValueOnce({ localePreference: 'ja' });
      await useThemeStore.getState().setThemePreference('light');

      expect(mockSet).toHaveBeenCalledWith('settings', {
        localePreference: 'ja',
        themePreference: 'light',
      });
    });
  });

  describe('loadThemePreference', () => {
    it('ストレージからテーマ設定を読み込む', async () => {
      mockGet.mockResolvedValueOnce({ themePreference: 'light' });

      await useThemeStore.getState().loadThemePreference();

      expect(useThemeStore.getState().themePreference).toBe('light');
      expect(mockGet).toHaveBeenCalledWith('settings');
    });

    it('ストレージが空の場合darkのまま', async () => {
      mockGet.mockResolvedValueOnce(null);

      await useThemeStore.getState().loadThemePreference();

      expect(useThemeStore.getState().themePreference).toBe('dark');
    });

    it('ストレージにthemePreferenceキーがない場合darkのまま', async () => {
      mockGet.mockResolvedValueOnce({});

      await useThemeStore.getState().loadThemePreference();

      expect(useThemeStore.getState().themePreference).toBe('dark');
    });

    it('ストレージエラー時もdarkのまま', async () => {
      mockGet.mockRejectedValueOnce(new Error('Storage error'));

      await useThemeStore.getState().loadThemePreference();

      expect(useThemeStore.getState().themePreference).toBe('dark');
    });
  });
});
