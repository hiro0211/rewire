// RevenueCat から価格を取れなかったときの表示用フォールバック。
// 規約表記（locales/ja.ts の s6Body）と一致させること。ズレていると
// 「見た金額と請求額が違う」状態になり、信頼を直接損なう。
const DEFAULT_ANNUAL_PRICE = 5400;
const DEFAULT_MONTHLY_PRICE = 680;
const DEFAULT_CURRENCY = 'JPY';

interface OfferingPackages {
  annualPackage: any | null;
  monthlyPackage: any | null;
  annualPrice: number;
  monthlyPrice: number;
  currencyCode: string;
}

export function extractOfferingPackages(offering: any): OfferingPackages {
  if (!offering) {
    return {
      annualPackage: null,
      monthlyPackage: null,
      annualPrice: DEFAULT_ANNUAL_PRICE,
      monthlyPrice: DEFAULT_MONTHLY_PRICE,
      currencyCode: DEFAULT_CURRENCY,
    };
  }

  // packageType で明示的に探す。以前は availablePackages[0] を無条件に年額扱いして
  // おり、Offering の並び次第で「年額の価格を見せて月額を売る」不整合が起きた。
  const annualPackage =
    offering.annual ??
    offering.availablePackages?.find((p: any) => p.packageType === 'ANNUAL') ??
    null;
  const monthlyPackage =
    offering.monthly ??
    offering.availablePackages?.find((p: any) => p.packageType === 'MONTHLY') ??
    null;

  const annualPrice = annualPackage?.product?.price ?? DEFAULT_ANNUAL_PRICE;
  const monthlyPrice = monthlyPackage?.product?.price ?? DEFAULT_MONTHLY_PRICE;
  const currencyCode = annualPackage?.product?.currencyCode ?? DEFAULT_CURRENCY;

  return { annualPackage, monthlyPackage, annualPrice, monthlyPrice, currencyCode };
}
