import { renderHook, act } from '@testing-library/react-native';
import { useShareWidget } from '../useShareWidget';
import { Share, Alert } from 'react-native';

jest.mock('react-native-view-shot', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(({ children, ...props }: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        capture: jest.fn().mockResolvedValue('/tmp/mock-capture.png'),
      }));
      return React.createElement(View, props, children);
    }),
  };
});

jest.mock('@/hooks/dashboard/useStreak', () => ({
  useStreak: () => ({ streak: 10, streakStartDate: '2026-02-05T00:00:00.000Z' }),
}));

jest.mock('@/hooks/dashboard/useStopwatch', () => ({
  useStopwatch: () => ({ days: 10, hours: 5, minutes: 30, formatted: '10日5時間30分' }),
}));

const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: (...args: any[]) => mockLogEvent(...args),
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light' },
}));

describe('useShareWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' } as any);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('viewShotRef が返される', () => {
    const { result } = renderHook(() => useShareWidget());
    expect(result.current.viewShotRef).toBeDefined();
    expect(result.current.viewShotRef.current).toBeNull();
  });

  it('share 関数が返される', () => {
    const { result } = renderHook(() => useShareWidget());
    expect(typeof result.current.share).toBe('function');
  });

  it('share() で時間・分を含むテキストが共有される', async () => {
    const { result } = renderHook(() => useShareWidget());

    (result.current.viewShotRef as any).current = {
      capture: jest.fn().mockResolvedValue('/tmp/mock-capture.png'),
    };

    await act(async () => {
      await result.current.share();
    });

    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '#Rewire ポルノ禁10日5時間30分 💪',
      })
    );
  });

  it('capture 失敗時にテキストのみでシェアされる', async () => {
    const { result } = renderHook(() => useShareWidget());

    (result.current.viewShotRef as any).current = {
      capture: jest.fn().mockRejectedValue(new Error('capture failed')),
    };

    await act(async () => {
      await result.current.share();
    });

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(Share.share).toHaveBeenCalledWith({ message: expect.any(String) });
  });

  it('capture メソッドがない場合にテキストのみでシェアされる', async () => {
    const { result } = renderHook(() => useShareWidget());

    (result.current.viewShotRef as any).current = {};

    await act(async () => {
      await result.current.share();
    });

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(Share.share).toHaveBeenCalledWith({ message: expect.any(String) });
  });

  it('viewShotRef が null の場合にテキストのみでシェアされる', async () => {
    const { result } = renderHook(() => useShareWidget());

    (result.current.viewShotRef as any).current = null;

    await act(async () => {
      await result.current.share();
    });

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(Share.share).toHaveBeenCalledWith({ message: expect.any(String) });
  });

  it('share_tapped アナリティクスイベントが送信される', async () => {
    const { result } = renderHook(() => useShareWidget());

    (result.current.viewShotRef as any).current = {
      capture: jest.fn().mockResolvedValue('/tmp/mock-capture.png'),
    };

    await act(async () => {
      await result.current.share();
    });

    expect(mockLogEvent).toHaveBeenCalledWith('share_tapped');
  });
});
