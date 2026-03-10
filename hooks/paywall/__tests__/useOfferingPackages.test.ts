import { extractOfferingPackages } from '../useOfferingPackages';

const makePackage = (type: string, price: number, currency = 'JPY') => ({
  packageType: type,
  product: { price, currencyCode: currency },
});

describe('extractOfferingPackages', () => {
  it('offering が null の場合デフォルト値を返す', () => {
    const result = extractOfferingPackages(null);
    expect(result.annualPackage).toBeNull();
    expect(result.monthlyPackage).toBeNull();
    expect(result.annualPrice).toBe(2500);
    expect(result.monthlyPrice).toBe(500);
    expect(result.currencyCode).toBe('JPY');
  });

  it('offering.annual から annualPackage を取得する', () => {
    const annual = makePackage('ANNUAL', 2800);
    const offering = { annual, monthly: null, availablePackages: [] };

    const result = extractOfferingPackages(offering);
    expect(result.annualPackage).toBe(annual);
    expect(result.annualPrice).toBe(2800);
  });

  it('offering.annual が無い場合 availablePackages[0] にフォールバック', () => {
    const pkg = makePackage('ANNUAL', 3000, 'USD');
    const offering = { annual: null, monthly: null, availablePackages: [pkg] };

    const result = extractOfferingPackages(offering);
    expect(result.annualPackage).toBe(pkg);
    expect(result.annualPrice).toBe(3000);
    expect(result.currencyCode).toBe('USD');
  });

  it('offering.monthly から monthlyPackage を取得する', () => {
    const monthly = makePackage('MONTHLY', 400);
    const offering = { annual: null, monthly, availablePackages: [] };

    const result = extractOfferingPackages(offering);
    expect(result.monthlyPackage).toBe(monthly);
    expect(result.monthlyPrice).toBe(400);
  });

  it('offering.monthly が無い場合 availablePackages から MONTHLY を検索する', () => {
    const annual = makePackage('ANNUAL', 2800);
    const monthly = makePackage('MONTHLY', 400);
    const offering = {
      annual,
      monthly: null,
      availablePackages: [annual, monthly],
    };

    const result = extractOfferingPackages(offering);
    expect(result.monthlyPackage).toBe(monthly);
  });

  it('product が無い場合デフォルト価格を返す', () => {
    const offering = {
      annual: { packageType: 'ANNUAL', product: null },
      monthly: null,
      availablePackages: [],
    };

    const result = extractOfferingPackages(offering);
    expect(result.annualPrice).toBe(2500);
    expect(result.currencyCode).toBe('JPY');
  });
});
