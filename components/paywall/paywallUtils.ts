/**
 * 月額換算計算
 */
export function calcMonthlyPrice(annualPrice: number): number {
  return Math.round(annualPrice / 12);
}

/**
 * 割引率計算（月額比）
 */
export function calcRelativeDiscount(monthlyPrice: number, annualPrice: number): number {
  if (monthlyPrice <= 0) return 0;
  return Math.round(((monthlyPrice - annualPrice / 12) / monthlyPrice) * 100);
}
