import { renderHook } from '@testing-library/react-native';
import { useEntranceAnimation } from '../useEntranceAnimation';

// react-native-reanimated is mocked by jest-expo preset

describe('useEntranceAnimation', () => {
  it('animatedStyleオブジェクトを返す', () => {
    const { result } = renderHook(() => useEntranceAnimation());
    expect(result.current.animatedStyle).toBeDefined();
  });

  it('delayパラメータを受け取れる', () => {
    const { result } = renderHook(() => useEntranceAnimation({ delay: 200 }));
    expect(result.current.animatedStyle).toBeDefined();
  });

  it('durationパラメータを受け取れる', () => {
    const { result } = renderHook(() => useEntranceAnimation({ duration: 500 }));
    expect(result.current.animatedStyle).toBeDefined();
  });
});
