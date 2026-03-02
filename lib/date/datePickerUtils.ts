/**
 * 指定した年月の日数を返す
 */
export function getDaysInMonth(year: number, month: number): number {
  // month は 1-12。Date コンストラクタの day=0 で前月の末日を取得
  return new Date(year, month, 0).getDate();
}

/**
 * 指定日付から now までの経過日数を返す（未来なら 0）
 */
export function calculateDaysSince(
  year: number,
  month: number,
  day: number,
  now: Date = new Date()
): number {
  const target = new Date(year, month - 1, day);
  const diffMs = now.getTime() - target.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * day を 1〜maxDay の範囲に丸める
 */
export function clampDay(day: number, maxDay: number): number {
  if (day < 1) return 1;
  if (day > maxDay) return maxDay;
  return day;
}

/**
 * 指定日付が now より未来かどうか
 */
export function isDateInFuture(
  year: number,
  month: number,
  day: number,
  now: Date = new Date()
): boolean {
  const target = new Date(year, month - 1, day);
  // 日付単位で比較（時刻を無視）
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return target.getTime() > todayStart.getTime();
}

/**
 * startYear から現在年までの年リストを返す
 */
export function getYearRange(
  startYear: number = 2020,
  now: Date = new Date()
): number[] {
  const currentYear = now.getFullYear();
  const years: number[] = [];
  for (let y = startYear; y <= currentYear; y++) {
    years.push(y);
  }
  return years;
}
