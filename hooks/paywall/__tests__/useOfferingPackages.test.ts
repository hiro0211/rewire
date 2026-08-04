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
    expect(result.annualPrice).toBe(5400);
    expect(result.monthlyPrice).toBe(680);
    expect(result.currencyCode).toBe('JPY');
  });

  it('offering.annual から annualPackage を取得する', () => {
    const annual = makePackage('ANNUAL', 2800);
    const offering = { annual, monthly: null, availablePackages: [] };

    const result = extractOfferingPackages(offering);
    expect(result.annualPackage).toBe(annual);
    expect(result.annualPrice).toBe(2800);
  });

  it('offering.annual が無い場合 availablePackages から ANNUAL を検索する', () => {
    const pkg = makePackage('ANNUAL', 3000, 'USD');
    const offering = { annual: null, monthly: null, availablePackages: [pkg] };

    const result = extractOfferingPackages(offering);
    expect(result.annualPackage).toBe(pkg);
    expect(result.annualPrice).toBe(3000);
    expect(result.currencyCode).toBe('USD');
  });

  it('年額が存在しないとき、先頭の月額を年額として扱わない', () => {
    // 以前は availablePackages[0] を無条件に年額扱いしていたため、
    // 「年額の価格を表示して月額を購入させる」不整合が起きうる状態だった
    const monthly = makePackage('MONTHLY', 680);
    const offering = { annual: null, monthly: null, availablePackages: [monthly] };

    const result = extractOfferingPackages(offering);
    expect(result.annualPackage).toBeNull();
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
    expect(result.annualPrice).toBe(5400);
    expect(result.currencyCode).toBe('JPY');
  });
});
