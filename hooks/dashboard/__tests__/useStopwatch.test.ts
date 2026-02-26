import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';

// Spy on AppState.addEventListener
let appStateCallback: ((state: string) => void) | null = null;
const mockRemove = jest.fn();
jest.spyOn(AppState, 'addEventListener').mockImplementation((event, cb) => {
  appStateCallback = cb as (state: string) => void;
  return { remove: mockRemove } as any;
});

import { useStopwatch } from '../useStopwatch';

describe('useStopwatch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-26T10:30:00Z'));
    appStateCallback = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('nullの場合はゼロを返す', () => {
    const { result } = renderHook(() => useStopwatch(null));
    expect(result.current.days).toBe(0);
    expect(result.current.hours).toBe(0);
    expect(result.current.minutes).toBe(0);
    expect(result.current.formatted).toBe('0分');
  });

  it('経過時間を正しく返す', () => {
    const { result } = renderHook(() => useStopwatch('2026-02-24T19:00:00Z'));
    expect(result.current.days).toBe(1);
    expect(result.current.hours).toBe(15);
    expect(result.current.minutes).toBe(30);
    expect(result.current.formatted).toBe('1日15時間30分');
  });

  it('60秒後にtickで更新される', () => {
    jest.setSystemTime(new Date('2026-02-26T10:00:00Z'));
    const { result } = renderHook(() => useStopwatch('2026-02-26T09:00:00Z'));
    expect(result.current.hours).toBe(1);
    expect(result.current.minutes).toBe(0);

    // advanceTimersByTime also advances Date.now, so 60s advance = 10:01:00
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(result.current.minutes).toBe(1);
  });

  it('AppState.active時に即更新される', () => {
    jest.setSystemTime(new Date('2026-02-26T10:00:00Z'));
    const { result } = renderHook(() => useStopwatch('2026-02-26T09:00:00Z'));
    expect(result.current.hours).toBe(1);

    act(() => {
      jest.setSystemTime(new Date('2026-02-26T12:00:00Z'));
      appStateCallback?.('active');
    });
    expect(result.current.hours).toBe(3);
  });
});
