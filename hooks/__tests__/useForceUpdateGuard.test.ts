import { renderHook, waitFor } from '@testing-library/react-native';

const mockFetchMinSupportedVersion = jest.fn();
jest.mock('@/lib/appConfig/appConfigClient', () => ({
  appConfigClient: {
    fetchMinSupportedVersion: () => mockFetchMinSupportedVersion(),
  },
}));

let mockCurrentVersion: string | null = '2.2.0';
jest.mock('expo-application', () => ({
  get nativeApplicationVersion() {
    return mockCurrentVersion;
  },
}));

import { useForceUpdateGuard } from '../useForceUpdateGuard';

describe('useForceUpdateGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentVersion = '2.2.0';
  });

  it('現在バージョン < 最低バージョン のとき isUpdateRequired=true', async () => {
    mockFetchMinSupportedVersion.mockResolvedValue('2.3.0');

    const { result } = renderHook(() => useForceUpdateGuard());

    await waitFor(() => expect(result.current.isUpdateRequired).toBe(true));
  });

  it('現在バージョン >= 最低バージョン のとき isUpdateRequired=false', async () => {
    mockFetchMinSupportedVersion.mockResolvedValue('2.2.0');

    const { result } = renderHook(() => useForceUpdateGuard());

    await waitFor(() =>
      expect(mockFetchMinSupportedVersion).toHaveBeenCalledTimes(1),
    );
    expect(result.current.isUpdateRequired).toBe(false);
  });

  it('リモート設定が取得できないとき isUpdateRequired=false（フェイルオープン）', async () => {
    mockFetchMinSupportedVersion.mockResolvedValue(null);

    const { result } = renderHook(() => useForceUpdateGuard());

    await waitFor(() =>
      expect(mockFetchMinSupportedVersion).toHaveBeenCalledTimes(1),
    );
    expect(result.current.isUpdateRequired).toBe(false);
  });

  it('現在バージョンが取得できないとき isUpdateRequired=false', async () => {
    mockCurrentVersion = null;
    mockFetchMinSupportedVersion.mockResolvedValue('2.3.0');

    const { result } = renderHook(() => useForceUpdateGuard());

    await waitFor(() =>
      expect(mockFetchMinSupportedVersion).toHaveBeenCalledTimes(1),
    );
    expect(result.current.isUpdateRequired).toBe(false);
  });

  it('fetch が reject しても例外を投げない', async () => {
    mockFetchMinSupportedVersion.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useForceUpdateGuard());

    await waitFor(() =>
      expect(mockFetchMinSupportedVersion).toHaveBeenCalledTimes(1),
    );
    expect(result.current.isUpdateRequired).toBe(false);
  });
});
