import { renderHook } from '@testing-library/react-native';
import { useTimeBasedLayout } from '../useTimeBasedLayout';

describe('useTimeBasedLayout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const setHour = (hour: number) => {
    const d = new Date();
    d.setHours(hour, 0, 0, 0);
    jest.setSystemTime(d);
  };

  // Morning: 5-11
  it('朝5時は morning レイアウトを返す', () => {
    setHour(5);
    const { result } = renderHook(() => useTimeBasedLayout());
    expect(result.current.timeOfDay).toBe('morning');
    expect(result.current.sections).toEqual(['checkin', 'streak', 'chart', 'sos']);
  });

  it('朝11時は morning レイアウトを返す', () => {
    setHour(11);
    const { result } = renderHook(() => useTimeBasedLayout());
    expect(result.current.timeOfDay).toBe('morning');
  });

  // Afternoon: 12-17
  it('昼12時は afternoon レイアウトを返す', () => {
    setHour(12);
    const { result } = renderHook(() => useTimeBasedLayout());
    expect(result.current.timeOfDay).toBe('afternoon');
    expect(result.current.sections).toEqual(['streak', 'chart', 'checkin', 'sos']);
  });

  it('昼17時は afternoon レイアウトを返す', () => {
    setHour(17);
    const { result } = renderHook(() => useTimeBasedLayout());
    expect(result.current.timeOfDay).toBe('afternoon');
  });

  // Evening: 18-22
  it('夜18時は evening レイアウトを返す', () => {
    setHour(18);
    const { result } = renderHook(() => useTimeBasedLayout());
    expect(result.current.timeOfDay).toBe('evening');
    expect(result.current.sections).toEqual(['streak', 'checkin', 'chart', 'sos']);
  });

  it('夜22時は evening レイアウトを返す', () => {
    setHour(22);
    const { result } = renderHook(() => useTimeBasedLayout());
    expect(result.current.timeOfDay).toBe('evening');
  });

  // Night: 23-4
  it('深夜23時は night レイアウトを返す', () => {
    setHour(23);
    const { result } = renderHook(() => useTimeBasedLayout());
    expect(result.current.timeOfDay).toBe('night');
    expect(result.current.sections).toEqual(['sos', 'streak']);
  });

  it('深夜0時は night レイアウトを返す', () => {
    setHour(0);
    const { result } = renderHook(() => useTimeBasedLayout());
    expect(result.current.timeOfDay).toBe('night');
  });

  it('深夜4時は night レイアウトを返す', () => {
    setHour(4);
    const { result } = renderHook(() => useTimeBasedLayout());
    expect(result.current.timeOfDay).toBe('night');
  });

  it('sections は DashboardSection 型の配列を返す', () => {
    setHour(10);
    const { result } = renderHook(() => useTimeBasedLayout());
    expect(Array.isArray(result.current.sections)).toBe(true);
    result.current.sections.forEach((s) => {
      expect(['streak', 'chart', 'checkin', 'sos']).toContain(s);
    });
  });

  it('morning の sections は checkin で始まる', () => {
    setHour(8);
    const { result } = renderHook(() => useTimeBasedLayout());
    expect(result.current.sections[0]).toBe('checkin');
  });

  it('night の sections は sos で始まる', () => {
    setHour(1);
    const { result } = renderHook(() => useTimeBasedLayout());
    expect(result.current.sections[0]).toBe('sos');
  });
});
