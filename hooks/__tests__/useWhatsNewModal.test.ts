import { renderHook, waitFor, act } from '@testing-library/react-native';

const mockStorageGet = jest.fn();
const mockStorageSet = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: (...a: unknown[]) => mockStorageGet(...a),
    set: (...a: unknown[]) => mockStorageSet(...a),
  },
}));

jest.mock('@/constants/appUpdates', () => ({
  WHATS_NEW_VERSION: '9.9.9',
}));

let mockUserState: { hasHydrated: boolean; user: unknown } = {
  hasHydrated: true,
  user: { nickname: 'hiro' },
};
jest.mock('@/stores/userStore', () => ({
  useUserStore: (selector: (s: unknown) => unknown) => selector(mockUserState),
}));

import { useWhatsNewModal } from '../useWhatsNewModal';

describe('useWhatsNewModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserState = { hasHydrated: true, user: { nickname: 'hiro' } };
  });

  it('既存ユーザーで未読のとき visible=true', async () => {
    mockStorageGet.mockResolvedValue(null);

    const { result } = renderHook(() => useWhatsNewModal());

    await waitFor(() => expect(result.current.visible).toBe(true));
  });

  it('既読バージョンが一致するとき visible=false のまま', async () => {
    mockStorageGet.mockResolvedValue('9.9.9');

    const { result } = renderHook(() => useWhatsNewModal());

    await waitFor(() => expect(mockStorageGet).toHaveBeenCalled());
    expect(result.current.visible).toBe(false);
  });

  it('新規ユーザー（user=null）は表示せず既読として記録する', async () => {
    mockUserState = { hasHydrated: true, user: null };
    mockStorageGet.mockResolvedValue(null);

    const { result } = renderHook(() => useWhatsNewModal());

    await waitFor(() =>
      expect(mockStorageSet).toHaveBeenCalledWith(
        'whats_new_seen_version',
        '9.9.9',
      ),
    );
    expect(result.current.visible).toBe(false);
  });

  it('hydration 前はストレージを読まない', () => {
    mockUserState = { hasHydrated: false, user: null };

    renderHook(() => useWhatsNewModal());

    expect(mockStorageGet).not.toHaveBeenCalled();
  });

  it('dismiss で閉じて既読バージョンを記録する', async () => {
    mockStorageGet.mockResolvedValue(null);

    const { result } = renderHook(() => useWhatsNewModal());
    await waitFor(() => expect(result.current.visible).toBe(true));

    await act(async () => {
      result.current.dismiss();
    });

    expect(result.current.visible).toBe(false);
    expect(mockStorageSet).toHaveBeenCalledWith(
      'whats_new_seen_version',
      '9.9.9',
    );
  });

  it('ストレージ読み込みが失敗しても visible=false でクラッシュしない', async () => {
    mockStorageGet.mockRejectedValue(new Error('storage broken'));

    const { result } = renderHook(() => useWhatsNewModal());

    await waitFor(() => expect(mockStorageGet).toHaveBeenCalled());
    expect(result.current.visible).toBe(false);
  });
});
