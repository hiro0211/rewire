import { useDebugStore } from '@/stores/debugStore';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const mockGet = asyncStorageClient.get as jest.MockedFunction<typeof asyncStorageClient.get>;
const mockSet = asyncStorageClient.set as jest.MockedFunction<typeof asyncStorageClient.set>;

describe('debugStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDebugStore.setState({ enabled: false, hasHydrated: false });
  });

  it('デフォルトの enabled は false である', () => {
    expect(useDebugStore.getState().enabled).toBe(false);
  });

  it('初期状態では hasHydrated は false である', () => {
    expect(useDebugStore.getState().hasHydrated).toBe(false);
  });

  it('setEnabled で enabled を変更できる', async () => {
    await useDebugStore.getState().setEnabled(true);
    expect(useDebugStore.getState().enabled).toBe(true);
  });

  it('setEnabled は debug キーに永続化する', async () => {
    await useDebugStore.getState().setEnabled(true);
    expect(mockSet).toHaveBeenCalledWith('debug', { enabled: true });
  });

  it('loadDebugSettings で AsyncStorage から読み込める', async () => {
    mockGet.mockResolvedValueOnce({ enabled: true });
    await useDebugStore.getState().loadDebugSettings();
    expect(useDebugStore.getState().enabled).toBe(true);
  });

  it('loadDebugSettings 成功時に hasHydrated が true になる', async () => {
    mockGet.mockResolvedValueOnce({ enabled: true });
    await useDebugStore.getState().loadDebugSettings();
    expect(useDebugStore.getState().hasHydrated).toBe(true);
  });

  it('AsyncStorage にデータがない場合はデフォルト（false）を維持する', async () => {
    mockGet.mockResolvedValueOnce(null);
    await useDebugStore.getState().loadDebugSettings();
    expect(useDebugStore.getState().enabled).toBe(false);
  });

  it('loadDebugSettings でエラーが起きても hasHydrated は true になる', async () => {
    mockGet.mockRejectedValueOnce(new Error('storage error'));
    await useDebugStore.getState().loadDebugSettings();
    expect(useDebugStore.getState().hasHydrated).toBe(true);
    expect(useDebugStore.getState().enabled).toBe(false);
  });
});
