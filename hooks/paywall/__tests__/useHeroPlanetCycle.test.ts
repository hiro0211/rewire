import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import type { AppStateStatus, NativeEventSubscription } from 'react-native';

import { HERO_PLANET_BADGE_IDS, HERO_PLANET_INTERVAL_MS } from '@/constants/paywall/heroPlanets';
import { useHeroPlanetCycle } from '../useHeroPlanetCycle';

describe('useHeroPlanetCycle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('初期表示は先頭の天体になる', () => {
    const { result } = renderHook(() => useHeroPlanetCycle());

    expect(result.current).toBe(HERO_PLANET_BADGE_IDS[0]);
  });

  it('待ち時間が過ぎると次の天体に進む', () => {
    const { result } = renderHook(() => useHeroPlanetCycle());

    act(() => {
      jest.advanceTimersByTime(HERO_PLANET_INTERVAL_MS);
    });

    expect(result.current).toBe(HERO_PLANET_BADGE_IDS[1]);
  });

  it('最後まで進んだら先頭に戻る', () => {
    const { result } = renderHook(() => useHeroPlanetCycle());

    act(() => {
      jest.advanceTimersByTime(HERO_PLANET_INTERVAL_MS * HERO_PLANET_BADGE_IDS.length);
    });

    expect(result.current).toBe(HERO_PLANET_BADGE_IDS[0]);
  });

  it('全ての天体を順番どおりに通る', () => {
    const { result } = renderHook(() => useHeroPlanetCycle());
    const seen: string[] = [result.current];

    for (let i = 1; i < HERO_PLANET_BADGE_IDS.length; i += 1) {
      act(() => {
        jest.advanceTimersByTime(HERO_PLANET_INTERVAL_MS);
      });
      seen.push(result.current);
    }

    expect(seen).toEqual([...HERO_PLANET_BADGE_IDS]);
  });

  it('バックグラウンドに入ると進まなくなる', () => {
    // 見えていない画面でタイマーを回し続けても意味がなく、
    // 復帰した瞬間に何コマも飛ぶと視覚的にちらつく
    const listeners: ((s: AppStateStatus) => void)[] = [];
    const spy = jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_event, cb) => {
        listeners.push(cb);
        return { remove: jest.fn() } as unknown as NativeEventSubscription;
      });

    const { result } = renderHook(() => useHeroPlanetCycle());

    act(() => {
      listeners.forEach((cb) => cb('background'));
      jest.advanceTimersByTime(HERO_PLANET_INTERVAL_MS * 3);
    });

    expect(result.current).toBe(HERO_PLANET_BADGE_IDS[0]);

    spy.mockRestore();
  });

  it('アンマウントすると自分が張ったタイマーを片づける', () => {
    // 絶対数で見ないのは、他のライブラリのタイマーが同居しうるため。
    // マウント前後の差分で「自分の分だけ」を見る
    const before = jest.getTimerCount();
    const { unmount } = renderHook(() => useHeroPlanetCycle());
    expect(jest.getTimerCount()).toBeGreaterThan(before);

    unmount();

    expect(jest.getTimerCount()).toBe(before);
  });
});
