import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

let listenerCallback: ((response: unknown) => void) | null = null;
const mockRemoveSubscription = jest.fn();
const mockGetLastResponse = jest.fn();

jest.mock('expo-notifications', () => ({
  __esModule: true,
  addNotificationResponseReceivedListener: (cb: (response: unknown) => void) => {
    listenerCallback = cb;
    return { remove: mockRemoveSubscription };
  },
  getLastNotificationResponseAsync: (...args: unknown[]) => mockGetLastResponse(...args),
}));

import { useNotificationDeepLink } from '../useNotificationDeepLink';

const makeResponse = (data: Record<string, unknown>) => ({
  notification: {
    request: {
      content: { data },
    },
  },
});

describe('useNotificationDeepLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    listenerCallback = null;
    mockGetLastResponse.mockResolvedValue(null);
  });

  test('通知タップでroute=/panicならrouter.pushを呼ぶ', () => {
    renderHook(() => useNotificationDeepLink());

    expect(listenerCallback).not.toBeNull();

    act(() => {
      listenerCallback!(makeResponse({ route: '/panic' }));
    });

    expect(mockPush).toHaveBeenCalledWith('/panic');
  });

  test('routeがない通知はナビゲーションしない', () => {
    renderHook(() => useNotificationDeepLink());

    act(() => {
      listenerCallback!(makeResponse({}));
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  test('コールドスタート時にlastNotificationResponseを処理', async () => {
    mockGetLastResponse.mockResolvedValue(makeResponse({ route: '/panic' }));

    renderHook(() => useNotificationDeepLink());

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/panic');
    });
  });

  test('アンマウント時にリスナーをクリーンアップ', () => {
    const { unmount } = renderHook(() => useNotificationDeepLink());

    unmount();

    expect(mockRemoveSubscription).toHaveBeenCalled();
  });
});
