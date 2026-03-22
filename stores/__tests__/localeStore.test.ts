import { useLocaleStore } from '@/stores/localeStore';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const mockGet = asyncStorageClient.get as jest.MockedFunction<typeof asyncStorageClient.get>;
const mockSet = asyncStorageClient.set as jest.MockedFunction<typeof asyncStorageClient.set>;

describe('localeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLocaleStore.setState({ localePreference: 'system' });
  });

  it('デフォルトの言語設定はsystemである', () => {
    expect(useLocaleStore.getState().localePreference).toBe('system');
  });

  it('setLocalePreferenceで言語設定を変更できる', async () => {
    mockGet.mockResolvedValueOnce(null);
    await useLocaleStore.getState().setLocalePreference('en');
    expect(useLocaleStore.getState().localePreference).toBe('en');
  });

  it('setLocalePreferenceで既存のsettingsデータをマージして保存する', async () => {
    mockGet.mockResolvedValueOnce({ themePreference: 'light' });
    await useLocaleStore.getState().setLocalePreference('ja');
    expect(mockSet).toHaveBeenCalledWith('settings', {
      themePreference: 'light',
      localePreference: 'ja',
    });
  });

  it('loadLocalePreferenceでAsyncStorageから読み込める', async () => {
    mockGet.mockResolvedValueOnce({ localePreference: 'ja' });
    await useLocaleStore.getState().loadLocalePreference();
    expect(useLocaleStore.getState().localePreference).toBe('ja');
  });

  it('AsyncStorageにデータがない場合はデフォルトを維持する', async () => {
    mockGet.mockResolvedValueOnce(null);
    await useLocaleStore.getState().loadLocalePreference();
    expect(useLocaleStore.getState().localePreference).toBe('system');
  });

  it('AsyncStorageでエラーが発生してもクラッシュしない', async () => {
    mockGet.mockRejectedValueOnce(new Error('storage error'));
    await useLocaleStore.getState().loadLocalePreference();
    expect(useLocaleStore.getState().localePreference).toBe('system');
  });
});
