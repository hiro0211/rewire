import { buildShareText } from '../shareService';
import type { StopwatchTime } from '@/lib/stats/statsCalculator';

describe('buildShareText', () => {
  it('日・時間・分を含むテキストを生成する', () => {
    const time: StopwatchTime = { days: 26, hours: 15, minutes: 6 };
    expect(buildShareText(time)).toBe('#Rewire ポルノ禁26日15時間6分 💪');
  });

  it('0分のとき0分と表示する', () => {
    const time: StopwatchTime = { days: 0, hours: 0, minutes: 0 };
    expect(buildShareText(time)).toBe('#Rewire ポルノ禁0分 💪');
  });

  it('時間が0のとき日と分のみ表示する', () => {
    const time: StopwatchTime = { days: 10, hours: 0, minutes: 30 };
    expect(buildShareText(time)).toBe('#Rewire ポルノ禁10日30分 💪');
  });

  it('日が0のとき時間と分のみ表示する', () => {
    const time: StopwatchTime = { days: 0, hours: 5, minutes: 10 };
    expect(buildShareText(time)).toBe('#Rewire ポルノ禁5時間10分 💪');
  });

  it('#Rewire ハッシュタグが含まれる', () => {
    const time: StopwatchTime = { days: 5, hours: 3, minutes: 20 };
    expect(buildShareText(time)).toContain('#Rewire');
  });
});
