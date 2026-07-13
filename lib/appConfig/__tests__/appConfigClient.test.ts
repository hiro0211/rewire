const mockGet = jest.fn();
const mockDoc = jest.fn((_id: string) => ({ get: () => mockGet() }));
const mockCollection = jest.fn((_name: string) => ({
  doc: (id: string) => mockDoc(id),
}));

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: false }));
jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  // Why: import ホイスティングで factory がテスト本体の const より先に実行されるため、
  // 外側の jest.fn は必ず遅延参照する（即時参照すると TDZ で firestore=null になる）
  default: () => ({ collection: (name: string) => mockCollection(name) }),
}));

import { appConfigClient } from '../appConfigClient';

describe('appConfigClient.fetchMinSupportedVersion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('appConfig/ios の minSupportedVersion を返す', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ minSupportedVersion: '2.3.0' }),
    });

    const version = await appConfigClient.fetchMinSupportedVersion();

    expect(mockCollection).toHaveBeenCalledWith('appConfig');
    expect(mockDoc).toHaveBeenCalledWith('ios');
    expect(version).toBe('2.3.0');
  });

  it('ドキュメントが存在しないとき null', async () => {
    mockGet.mockResolvedValue({ exists: false, data: () => undefined });

    expect(await appConfigClient.fetchMinSupportedVersion()).toBeNull();
  });

  it('minSupportedVersion フィールドが無いとき null', async () => {
    mockGet.mockResolvedValue({ exists: true, data: () => ({}) });

    expect(await appConfigClient.fetchMinSupportedVersion()).toBeNull();
  });

  it('minSupportedVersion が文字列でないとき null', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ minSupportedVersion: 230 }),
    });

    expect(await appConfigClient.fetchMinSupportedVersion()).toBeNull();
  });

  it('Firestore がthrow したとき null（例外伝播しない）', async () => {
    mockGet.mockRejectedValue(new Error('network'));

    await expect(appConfigClient.fetchMinSupportedVersion()).resolves.toBeNull();
  });
});
