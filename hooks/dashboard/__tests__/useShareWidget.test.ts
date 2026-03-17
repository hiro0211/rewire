import { renderHook, act } from '@testing-library/react-native';
import { useShareWidget } from '../useShareWidget';
import { Share } from 'react-native';

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

const mockShareWithImage = jest.fn();
jest.mock('@/lib/share/shareImage', () => ({
  shareWithImage: (...args: any[]) => mockShareWithImage(...args),
}));

const mockCopyToClipboard = jest.fn();
jest.mock('@/lib/share/clipboardService', () => ({
  copyToClipboard: (...args: any[]) => mockCopyToClipboard(...args),
}));

describe('useShareWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' } as any);
    mockShareWithImage.mockResolvedValue(undefined);
    mockCopyToClipboard.mockResolvedValue(true);
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

  describe('キャプチャ成功時', () => {
    it('shareWithImage がテキストと画像URIで呼ばれる', async () => {
      const { result } = renderHook(() => useShareWidget());

      (result.current.viewShotRef as any).current = {
        capture: jest.fn().mockResolvedValue('/tmp/mock-capture.png'),
      };

      await act(async () => {
        await result.current.share();
      });

      expect(mockShareWithImage).toHaveBeenCalledWith(
        '#Rewire ポルノ禁10日5時間30分 💪',
        '/tmp/mock-capture.png',
      );
    });

    it('テキストがクリップボードにコピーされる', async () => {
      const { result } = renderHook(() => useShareWidget());

      (result.current.viewShotRef as any).current = {
        capture: jest.fn().mockResolvedValue('/tmp/mock-capture.png'),
      };

      await act(async () => {
        await result.current.share();
      });

      expect(mockCopyToClipboard).toHaveBeenCalledWith('#Rewire ポルノ禁10日5時間30分 💪');
    });

    it('Share.share が直接呼ばれない', async () => {
      const { result } = renderHook(() => useShareWidget());

      (result.current.viewShotRef as any).current = {
        capture: jest.fn().mockResolvedValue('/tmp/mock-capture.png'),
      };

      await act(async () => {
        await result.current.share();
      });

      expect(Share.share).not.toHaveBeenCalled();
    });

    it('クリップボードコピーが失敗してもシェアは成功する', async () => {
      const { result } = renderHook(() => useShareWidget());

      (result.current.viewShotRef as any).current = {
        capture: jest.fn().mockResolvedValue('/tmp/mock-capture.png'),
      };
      mockCopyToClipboard.mockRejectedValue(new Error('clipboard failed'));

      await act(async () => {
        await result.current.share();
      });

      expect(mockShareWithImage).toHaveBeenCalled();
      expect(Share.share).not.toHaveBeenCalled();
    });
  });

  describe('キャプチャ失敗時', () => {
    it('Share.share でテキストのみ共有される', async () => {
      const { result } = renderHook(() => useShareWidget());

      (result.current.viewShotRef as any).current = {
        capture: jest.fn().mockRejectedValue(new Error('capture failed')),
      };

      await act(async () => {
        await result.current.share();
      });

      expect(Share.share).toHaveBeenCalledWith({
        message: '#Rewire ポルノ禁10日5時間30分 💪',
      });
      expect(mockShareWithImage).not.toHaveBeenCalled();
    });

    it('capture メソッドがない場合にテキストのみでシェアされる', async () => {
      const { result } = renderHook(() => useShareWidget());

      (result.current.viewShotRef as any).current = {};

      await act(async () => {
        await result.current.share();
      });

      expect(Share.share).toHaveBeenCalledWith({ message: expect.any(String) });
      expect(mockShareWithImage).not.toHaveBeenCalled();
    });

    it('viewShotRef が null の場合にテキストのみでシェアされる', async () => {
      const { result } = renderHook(() => useShareWidget());

      (result.current.viewShotRef as any).current = null;

      await act(async () => {
        await result.current.share();
      });

      expect(Share.share).toHaveBeenCalledWith({ message: expect.any(String) });
      expect(mockShareWithImage).not.toHaveBeenCalled();
    });
  });

  describe('画像シェア失敗時のフォールバック', () => {
    it('shareWithImage が失敗した場合にテキストフォールバックされる', async () => {
      const { result } = renderHook(() => useShareWidget());

      (result.current.viewShotRef as any).current = {
        capture: jest.fn().mockResolvedValue('/tmp/mock-capture.png'),
      };
      mockShareWithImage.mockRejectedValue(new Error('sharing failed'));

      await act(async () => {
        await result.current.share();
      });

      expect(Share.share).toHaveBeenCalledWith({
        message: '#Rewire ポルノ禁10日5時間30分 💪',
      });
    });

    it('ユーザーキャンセル（ERR_ABORTED）時はフォールバックしない', async () => {
      const { result } = renderHook(() => useShareWidget());

      (result.current.viewShotRef as any).current = {
        capture: jest.fn().mockResolvedValue('/tmp/mock-capture.png'),
      };
      mockShareWithImage.mockRejectedValue(new Error('ERR_ABORTED'));

      await act(async () => {
        await result.current.share();
      });

      expect(Share.share).not.toHaveBeenCalled();
    });
  });
});
