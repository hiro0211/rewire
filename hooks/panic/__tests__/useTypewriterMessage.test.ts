import { act, renderHook } from '@testing-library/react-native';

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'panic.messages.m1': '後になってまた後悔するよ？',
        'panic.messages.m2': 'そしてまた自分を嫌いになる',
        'panic.messages.m3': 'またポルノ漬けの生活に戻るの？',
        'panic.messages.m4': 'もうやめるって誓ったでしょ',
        'panic.messages.m5': '乗り越えるたびに、強くなれる',
        'panic.messages.m6': '今が踏ん張りどき',
        'panic.messages.m7': '大丈夫、あなたなら乗り越えられる',
      };
      return map[key] ?? key;
    },
  }),
}));

import { useTypewriterMessage } from '../useTypewriterMessage';
import { TYPEWRITER_CONFIG } from '@/constants/panic';

describe('useTypewriterMessage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('初期表示では空文字と entering フェーズ', () => {
    const { result } = renderHook(() => useTypewriterMessage());
    expect(result.current.displayedText).toBe('');
    expect(result.current.phase).toBe('entering');
  });

  it('ENTER_DURATION_MS 経過後に typing フェーズへ移る', () => {
    const { result } = renderHook(() => useTypewriterMessage());
    act(() => {
      jest.advanceTimersByTime(TYPEWRITER_CONFIG.ENTER_DURATION_MS);
    });
    expect(result.current.phase).toBe('typing');
  });

  it('タイピング中は1文字ずつ文字列が増える', () => {
    const { result } = renderHook(() => useTypewriterMessage());
    act(() => {
      jest.advanceTimersByTime(TYPEWRITER_CONFIG.ENTER_DURATION_MS);
    });
    const firstMessage = '後になってまた後悔するよ？';
    // 1文字目がタイピング開始されるタイミングまで進める
    act(() => {
      jest.advanceTimersByTime(TYPEWRITER_CONFIG.CHAR_INTERVAL_MS);
    });
    expect(result.current.displayedText.length).toBeGreaterThanOrEqual(1);
    expect(firstMessage.startsWith(result.current.displayedText)).toBe(true);
  });

  it('全文表示完了後は pausing フェーズで displayedText が完全な文字列', () => {
    const { result } = renderHook(() => useTypewriterMessage());
    const firstMessage = '後になってまた後悔するよ？';
    act(() => {
      jest.advanceTimersByTime(TYPEWRITER_CONFIG.ENTER_DURATION_MS);
    });
    for (let i = 0; i < firstMessage.length; i++) {
      act(() => {
        jest.advanceTimersByTime(TYPEWRITER_CONFIG.CHAR_INTERVAL_MS);
      });
    }
    expect(result.current.displayedText).toBe(firstMessage);
    expect(result.current.phase).toBe('pausing');
  });
});
