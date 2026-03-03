import { getWeeklyProgress, type DayStatus } from '../useWeeklyProgress';

describe('getWeeklyProgress', () => {
  // 固定日: 2026-03-03 (火曜日)
  // 今週: Mon(3/2), Tue(3/3), Wed(3/4), Thu(3/5), Fri(3/6), Sat(3/7), Sun(3/8)
  const tuesday = new Date('2026-03-03T12:00:00');

  it('streak=0 のとき今日が "today" で残りは "future"', () => {
    const result = getWeeklyProgress(0, tuesday);
    expect(result).toHaveLength(7);
    // Mon: 1 day ago, 1 > 0 → future
    expect(result[0]).toEqual({ dayLabel: '月', status: 'future' });
    expect(result[1]).toEqual({ dayLabel: '火', status: 'today' });
    expect(result[2]).toEqual({ dayLabel: '水', status: 'future' });
  });

  it('streak=1 のとき昨日（月曜）が completed, 今日が today', () => {
    const result = getWeeklyProgress(1, tuesday);
    expect(result[0]).toEqual({ dayLabel: '月', status: 'completed' }); // 1 day ago <= 1
    expect(result[1]).toEqual({ dayLabel: '火', status: 'today' });
    expect(result[2]).toEqual({ dayLabel: '水', status: 'future' });
  });

  it('streak=3 でも今週内の過去日のみ completed（火曜なので月曜のみ）', () => {
    const result = getWeeklyProgress(3, tuesday);
    // Mon: 1 day ago, 1 <= 3 → completed
    // Sat/Sun of previous week are NOT in this week's view
    expect(result[0]).toEqual({ dayLabel: '月', status: 'completed' });
    expect(result[1]).toEqual({ dayLabel: '火', status: 'today' });
    expect(result.filter((d: DayStatus) => d.status === 'completed')).toHaveLength(1);
  });

  it('月曜日のとき dayLabels が M,T,W,T,F,S,S の順', () => {
    const result = getWeeklyProgress(0, tuesday);
    const labels = result.map((d: DayStatus) => d.dayLabel);
    expect(labels).toEqual(['月', '火', '水', '木', '金', '土', '日']);
  });

  it('木曜日 streak=7 のとき今週の月〜水が completed', () => {
    // Thu 2026-03-05
    const thursday = new Date('2026-03-05T12:00:00');
    const result = getWeeklyProgress(7, thursday);
    // Mon(3 days ago), Tue(2), Wed(1) → all <= 7 → completed
    expect(result[0]).toEqual({ dayLabel: '月', status: 'completed' });
    expect(result[1]).toEqual({ dayLabel: '火', status: 'completed' });
    expect(result[2]).toEqual({ dayLabel: '水', status: 'completed' });
    expect(result[3]).toEqual({ dayLabel: '木', status: 'today' });
    expect(result[4]).toEqual({ dayLabel: '金', status: 'future' });
  });

  it('日曜日 streak=2 のとき金・土が completed', () => {
    const sunday = new Date('2026-03-08T12:00:00');
    const result = getWeeklyProgress(2, sunday);
    // Mon-Thu: 6,5,4,3 days ago → > 2 → future
    // Fri: 2 days ago → 2 <= 2 → completed
    // Sat: 1 day ago → 1 <= 2 → completed
    // Sun: today
    expect(result[0]).toEqual({ dayLabel: '月', status: 'future' });
    expect(result[3]).toEqual({ dayLabel: '木', status: 'future' });
    expect(result[4]).toEqual({ dayLabel: '金', status: 'completed' });
    expect(result[5]).toEqual({ dayLabel: '土', status: 'completed' });
    expect(result[6]).toEqual({ dayLabel: '日', status: 'today' });
  });

  it('日曜日 streak=30 のとき月〜土が全て completed', () => {
    const sunday = new Date('2026-03-08T12:00:00');
    const result = getWeeklyProgress(30, sunday);
    const completed = result.filter((d: DayStatus) => d.status === 'completed');
    const today = result.filter((d: DayStatus) => d.status === 'today');
    expect(completed).toHaveLength(6);
    expect(today).toHaveLength(1);
  });

  it('月曜日 streak=7 のとき today のみ（過去日なし）', () => {
    const monday = new Date('2026-03-02T12:00:00');
    const result = getWeeklyProgress(7, monday);
    expect(result[0]).toEqual({ dayLabel: '月', status: 'today' });
    expect(result.filter((d: DayStatus) => d.status === 'completed')).toHaveLength(0);
    expect(result.filter((d: DayStatus) => d.status === 'future')).toHaveLength(6);
  });
});
