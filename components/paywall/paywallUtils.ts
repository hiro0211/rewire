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

/**
 * 通貨コードに応じた価格フォーマット
 * RevenueCat の product.currencyCode と price から表示用文字列を生成
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  JPY: '¥', USD: '$', EUR: '€', GBP: '£', KRW: '₩', AUD: 'A$', CAD: 'CA$',
};

export function formatPrice(amount: number, currencyCode: string = 'JPY'): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] ?? `${currencyCode} `;
  const isZeroDecimal = currencyCode === 'JPY' || currencyCode === 'KRW';
  if (isZeroDecimal) {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}
