import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
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
  });

  test('通知タップで route=/panic なら router.push を呼ぶ', () => {
    renderHook(() => useNotificationDeepLink());

    expect(listenerCallback).not.toBeNull();

    act(() => {
      listenerCallback!(makeResponse({ route: '/panic' }));
    });

    expect(mockPush).toHaveBeenCalledWith('/panic');
  });

  test('route がない通知はナビゲーションしない', () => {
    renderHook(() => useNotificationDeepLink());

    act(() => {
      listenerCallback!(makeResponse({}));
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  test('route 付き通知タップで notification_opened を route 付きで送信する', () => {
    renderHook(() => useNotificationDeepLink());

    act(() => {
      listenerCallback!(makeResponse({ route: '/panic' }));
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('notification_opened', { route: '/panic' });
  });

  test('route なし通知では notification_opened を送信しない', () => {
    renderHook(() => useNotificationDeepLink());

    act(() => {
      listenerCallback!(makeResponse({}, 'some-other-category'));
    });

    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  test('コールドスタート時に lastNotificationResponse を処理', async () => {
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

  test('categoryIdentifier=rewire-shield-panic（route なし）でも /panic へ遷移する (Shield Action フォールバック)', () => {
    renderHook(() => useNotificationDeepLink());

    act(() => {
      listenerCallback!(makeResponse({}, 'rewire-shield-panic'));
    });

    expect(mockPush).toHaveBeenCalledWith('/panic');
  });

  test('未知の categoryIdentifier（route なし）はナビゲーションしない', () => {
    renderHook(() => useNotificationDeepLink());

    act(() => {
      listenerCallback!(makeResponse({}, 'some-other-category'));
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  test('route があればそれを優先して router.push する', () => {
    renderHook(() => useNotificationDeepLink());

    act(() => {
      listenerCallback!(makeResponse({ route: '/other' }, 'rewire-shield-panic'));
    });

    expect(mockPush).toHaveBeenCalledWith('/other');
    expect(mockPush).not.toHaveBeenCalledWith('/panic');
  });
});
