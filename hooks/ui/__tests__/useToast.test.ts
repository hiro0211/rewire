import { renderHook, act } from '@testing-library/react-native';
import { useToast } from '../useToast';

describe('useToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('初期状態は非表示', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.visible).toBe(false);
  });

  it('show() で visible=true になる', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.show();
    });

    expect(result.current.visible).toBe(true);
  });

  it('durationMs 経過で自動的に visible=false に戻る', () => {
    const { result } = renderHook(() => useToast(1500));

    act(() => {
      result.current.show();
    });
    expect(result.current.visible).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(result.current.visible).toBe(false);
  });

  it('hide() で即座に visible=false になる', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.show();
    });
    act(() => {
      result.current.hide();
    });

    expect(result.current.visible).toBe(false);
  });

  it('unmount 時にタイマーがクリーンアップされ、以降 state 更新が起きない', () => {
    const { result, unmount } = renderHook(() => useToast(1500));

    act(() => {
      result.current.show();
    });

    unmount();

    // アンマウント後にタイマーが発火しても警告なく完了する
    expect(() => {
      act(() => {
        jest.advanceTimersByTime(1500);
      });
    }).not.toThrow();
  });
});
