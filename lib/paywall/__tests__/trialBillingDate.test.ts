import {
  calcBillingStartDate,
  formatBillingDate,
} from '../trialBillingDate';

describe('calcBillingStartDate', () => {
  it('2026年8月15日に3日を足したとき2026年8月18日になる', () => {
    const result = calcBillingStartDate(new Date(2026, 7, 15), 3);

    expect(result).toEqual(new Date(2026, 7, 18));
  });

  it('月末をまたぐとき翌月の日付になる', () => {
    const result = calcBillingStartDate(new Date(2026, 7, 30), 3);

    expect(result).toEqual(new Date(2026, 8, 2));
  });

  it('年末をまたぐとき翌年の日付になる', () => {
    const result = calcBillingStartDate(new Date(2026, 11, 30), 3);

    expect(result).toEqual(new Date(2027, 0, 2));
  });

  it('うるう年の2月をまたぐとき2月29日を数えた日付になる', () => {
    // 2028年はうるう年。2/27 + 3日 = 2/28, 2/29, 3/1
    const result = calcBillingStartDate(new Date(2028, 1, 27), 3);

    expect(result).toEqual(new Date(2028, 2, 1));
  });

  it('平年の2月をまたぐとき2月28日までしか数えない日付になる', () => {
    const result = calcBillingStartDate(new Date(2027, 1, 27), 3);

    expect(result).toEqual(new Date(2027, 2, 2));
  });

  it('トライアル日数が0のとき当日と同じ日付になる', () => {
    const result = calcBillingStartDate(new Date(2026, 7, 15), 0);

    expect(result).toEqual(new Date(2026, 7, 15));
  });

  it('引数のDateを渡したとき元のDateは書き換わらない', () => {
    const today = new Date(2026, 7, 15);

    calcBillingStartDate(today, 3);

    expect(today).toEqual(new Date(2026, 7, 15));
  });
});

describe('formatBillingDate', () => {
  it('jaのとき「8月18日」形式になる', () => {
    expect(formatBillingDate(new Date(2026, 7, 18), 'ja')).toBe('8月18日');
  });

  it('enのとき「Aug 18」形式になる', () => {
    expect(formatBillingDate(new Date(2026, 7, 18), 'en')).toBe('Aug 18');
  });

  it('jaで1桁の月日のときゼロ埋めされない', () => {
    expect(formatBillingDate(new Date(2027, 0, 2), 'ja')).toBe('1月2日');
  });

  it('enで1桁の日のときゼロ埋めされない', () => {
    expect(formatBillingDate(new Date(2027, 0, 2), 'en')).toBe('Jan 2');
  });
});
