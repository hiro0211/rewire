const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * goalDays日後の日付をロケールに応じた形式で返す
 * ja: 「2026年2月14日」 / en: 「Feb 14, 2026」
 */
export function calcTargetDate(goalDays: number, isJapanese: boolean): string {
  const target = new Date();
  target.setDate(target.getDate() + goalDays);

  if (isJapanese) {
    return `${target.getFullYear()}年${target.getMonth() + 1}月${target.getDate()}日`;
  }

  return `${MONTH_NAMES[target.getMonth()]} ${target.getDate()}, ${target.getFullYear()}`;
}
