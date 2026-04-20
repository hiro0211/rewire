const mockAddResponseListener = jest.fn();
const mockGetLastResponse = jest.fn().mockResolvedValue(null);
const mockRemove = jest.fn();

jest.mock('expo-notifications', () => ({
  addNotificationResponseReceivedListener: (cb: any) => {
    mockAddResponseListener(cb);
    return { remove: mockRemove };
  },
  getLastNotificationResponseAsync: () => mockGetLastResponse(),
}));

const mockOpen = jest.fn();
jest.mock('@/hooks/reflection/useReflectionSheet', () => ({
  useReflectionSheet: {
    getState: () => ({ open: mockOpen }),
  },
}));

import { renderHook } from '@testing-library/react-native';
import { useReflectionTrigger } from '../useReflectionTrigger';

describe('useReflectionTrigger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLastResponse.mockResolvedValue(null);
  });

  it('mount 時に response listener を登録する', () => {
    renderHook(() => useReflectionTrigger());

    expect(mockAddResponseListener).toHaveBeenCalled();
  });

  it('action=open_reflection の notification tap で open() を呼ぶ', () => {
    renderHook(() => useReflectionTrigger());

    const handler = mockAddResponseListener.mock.calls[0][0];
    handler({
      notification: {
        request: {
          content: { data: { action: 'open_reflection' } },
        },
      },
    });

    expect(mockOpen).toHaveBeenCalled();
  });

  it('action が違う場合は open() を呼ばない', () => {
    renderHook(() => useReflectionTrigger());

    const handler = mockAddResponseListener.mock.calls[0][0];
    handler({
      notification: {
        request: { content: { data: { route: '/streak' } } },
      },
    });

    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('cold start 時に getLastNotificationResponseAsync を確認し open する', async () => {
    mockGetLastResponse.mockResolvedValueOnce({
      notification: {
        request: { content: { data: { action: 'open_reflection' } } },
      },
    });

    renderHook(() => useReflectionTrigger());

    // flush microtasks
    await Promise.resolve();
    await Promise.resolve();

    expect(mockOpen).toHaveBeenCalled();
  });

  it('unmount 時に subscription.remove が呼ばれる', () => {
    const { unmount } = renderHook(() => useReflectionTrigger());

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });
});
