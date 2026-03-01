/**
 * goalDays日後の日付を「YYYY年M月D日」形式で返す
 */
export function calcTargetDate(goalDays: number): string {
  const target = new Date();
  target.setDate(target.getDate() + goalDays);
  return `${target.getFullYear()}年${target.getMonth() + 1}月${target.getDate()}日`;
}
