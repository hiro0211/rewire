import {
  getDaysInMonth,
  calculateDaysSince,
  clampDay,
  isDateInFuture,
  getYearRange,
} from '../datePickerUtils';

describe('getDaysInMonth', () => {
  it('1月は31日を返す', () => {
    expect(getDaysInMonth(2026, 1)).toBe(31);
  });

  it('4月は30日を返す', () => {
    expect(getDaysInMonth(2026, 4)).toBe(30);
  });

  it('うるう年の2月は29日を返す', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('平年の2月は28日を返す', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  it('12月は31日を返す', () => {
    expect(getDaysInMonth(2026, 12)).toBe(31);
  });
});

describe('calculateDaysSince', () => {
  it('14日前の日付から14を返す', () => {
    const now = new Date(2026, 1, 26); // 2026-02-26
    expect(calculateDaysSince(2026, 2, 12, now)).toBe(14);
  });

  it('今日の日付から0を返す', () => {
    const now = new Date(2026, 1, 26);
    expect(calculateDaysSince(2026, 2, 26, now)).toBe(0);
  });

  it('未来の日付から0を返す', () => {
    const now = new Date(2026, 1, 26);
    expect(calculateDaysSince(2026, 3, 1, now)).toBe(0);
  });

  it('年をまたぐ場合も正しく計算する', () => {
    const now = new Date(2026, 0, 10); // 2026-01-10
    expect(calculateDaysSince(2025, 12, 31, now)).toBe(10);
  });
});

describe('clampDay', () => {
  it('日数が最大日以下ならそのまま返す', () => {
    expect(clampDay(15, 31)).toBe(15);
  });

  it('日数が最大日を超えたら最大日に丸める', () => {
    expect(clampDay(31, 30)).toBe(30);
  });

  it('日数が1未満なら1を返す', () => {
    expect(clampDay(0, 31)).toBe(1);
  });
});

describe('isDateInFuture', () => {
  const now = new Date(2026, 1, 26); // 2026-02-26

  it('未来の日付でtrueを返す', () => {
    expect(isDateInFuture(2026, 2, 27, now)).toBe(true);
  });

  it('今日の日付でfalseを返す', () => {
    expect(isDateInFuture(2026, 2, 26, now)).toBe(false);
  });

  it('過去の日付でfalseを返す', () => {
    expect(isDateInFuture(2026, 2, 25, now)).toBe(false);
  });

  it('未来の月でtrueを返す', () => {
    expect(isDateInFuture(2026, 3, 1, now)).toBe(true);
  });

  it('未来の年でtrueを返す', () => {
    expect(isDateInFuture(2027, 1, 1, now)).toBe(true);
  });
});

describe('getYearRange', () => {
  it('2020年から現在年までの配列を返す', () => {
    const now = new Date(2026, 1, 26);
    const range = getYearRange(2020, now);
    expect(range).toEqual([2020, 2021, 2022, 2023, 2024, 2025, 2026]);
  });

  it('開始年を指定できる', () => {
    const now = new Date(2026, 1, 26);
    const range = getYearRange(2024, now);
    expect(range).toEqual([2024, 2025, 2026]);
  });
});
