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
import { panicNotificationTracker } from '@/lib/safariWebExtension/panicNotificationTracker';

const makeResponse = (data: Record<string, unknown>, categoryIdentifier?: string) => ({
  notification: {
    request: {
      content: { data, categoryIdentifier },
    },
  },
});

describe('useNotificationDeepLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    listenerCallback = null;
    mockGetLastResponse.mockResolvedValue(null);
    panicNotificationTracker.reset();
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

  test('categoryIdentifierのみの通知（routeなし）はナビゲーションしない', () => {
    // Screen Time Shield から categoryIdentifier だけで送られる通知は
    // Screen Time API 撤去に伴い発生しなくなったので、フォールバック経路は廃止。
    // Safari Web Extension からの通知は常に userInfo.route を持つ。
    renderHook(() => useNotificationDeepLink());

    act(() => {
      listenerCallback!(makeResponse({}, 'rewire-shield-panic'));
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  test('routeがあればそれを優先してrouter.pushする', () => {
    renderHook(() => useNotificationDeepLink());

    act(() => {
      listenerCallback!(makeResponse({ route: '/other' }, 'rewire-shield-panic'));
    });

    expect(mockPush).toHaveBeenCalledWith('/other');
    expect(mockPush).not.toHaveBeenCalledWith('/panic');
  });

  test('route=/panic のとき panicNotificationTracker にタイムスタンプを記録する', () => {
    renderHook(() => useNotificationDeepLink());

    const before = Date.now();
    act(() => {
      listenerCallback!(makeResponse({ route: '/panic' }));
    });

    expect(panicNotificationTracker.getLastPanicNotifiedAt()).toBeGreaterThanOrEqual(before);
  });

  test('route=/panic 以外では panicNotificationTracker は更新しない', () => {
    renderHook(() => useNotificationDeepLink());

    act(() => {
      listenerCallback!(makeResponse({ route: '/other' }));
    });

    expect(panicNotificationTracker.getLastPanicNotifiedAt()).toBe(0);
  });
});
