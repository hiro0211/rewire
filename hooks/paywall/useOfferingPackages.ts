const DEFAULT_ANNUAL_PRICE = 2500;
const DEFAULT_MONTHLY_PRICE = 500;
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

  const annualPackage = offering.annual ?? offering.availablePackages?.[0] ?? null;
  const monthlyPackage =
    offering.monthly ??
    offering.availablePackages?.find((p: any) => p.packageType === 'MONTHLY') ??
    null;

  const annualPrice = annualPackage?.product?.price ?? DEFAULT_ANNUAL_PRICE;
  const monthlyPrice = monthlyPackage?.product?.price ?? DEFAULT_MONTHLY_PRICE;
  const currencyCode = annualPackage?.product?.currencyCode ?? DEFAULT_CURRENCY;

  return { annualPackage, monthlyPackage, annualPrice, monthlyPrice, currencyCode };
}
