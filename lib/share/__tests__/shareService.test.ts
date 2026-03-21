import { buildShareText } from '../shareService';
import type { StopwatchTime } from '@/lib/stats/statsCalculator';

describe('buildShareText - 日本語', () => {
  it('日・時間・分を含むテキストを生成する', () => {
    const time: StopwatchTime = { days: 26, hours: 15, minutes: 6 };
    expect(buildShareText(time, true)).toBe('#Rewire ポルノ禁26日15時間6分 💪');
  });

  it('0分のとき0分と表示する', () => {
    const time: StopwatchTime = { days: 0, hours: 0, minutes: 0 };
    expect(buildShareText(time, true)).toBe('#Rewire ポルノ禁0分 💪');
  });

  it('#Rewire ハッシュタグが含まれる', () => {
    const time: StopwatchTime = { days: 5, hours: 3, minutes: 20 };
    expect(buildShareText(time, true)).toContain('#Rewire');
  });
});

describe('buildShareText - 英語', () => {
  it('日・時間・分を含むテキストを生成する', () => {
    const time: StopwatchTime = { days: 26, hours: 15, minutes: 6 };
    expect(buildShareText(time, false)).toBe('#Rewire 26d 15h 6m porn-free 💪');
  });

  it('0分のとき0mと表示する', () => {
    const time: StopwatchTime = { days: 0, hours: 0, minutes: 0 };
    expect(buildShareText(time, false)).toBe('#Rewire 0m porn-free 💪');
  });

  it('#Rewire ハッシュタグが含まれる', () => {
    const time: StopwatchTime = { days: 5, hours: 3, minutes: 20 };
    expect(buildShareText(time, false)).toContain('#Rewire');
  });
});
