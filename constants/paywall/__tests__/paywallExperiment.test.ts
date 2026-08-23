import {
  PAYWALL_VARIANT_FALLBACK,
  PAYWALL_VARIANTS,
  PAYWALL_VARIANT_WEIGHTS,
  isPaywallVariant,
} from '../paywallExperiment';

describe('isPaywallVariant', () => {
  it('語彙内の値のときtrueを返す', () => {
    expect(isPaywallVariant('cosmicJourney')).toBe(true);
  });

  it('語彙外の文字列のときfalseを返す', () => {
    expect(isPaywallVariant('trial')).toBe(false);
  });

  it('空文字のときfalseを返す', () => {
    expect(isPaywallVariant('')).toBe(false);
  });

  it('非文字列のときfalseを返す', () => {
    expect(isPaywallVariant(0)).toBe(false);
  });

  it('nullのときfalseを返す', () => {
    expect(isPaywallVariant(null)).toBe(false);
  });

  it('undefinedのときfalseを返す', () => {
    expect(isPaywallVariant(undefined)).toBe(false);
  });
});

describe('PAYWALL_VARIANT_WEIGHTS', () => {
  it('全アームに重みが定義されている', () => {
    expect(Object.keys(PAYWALL_VARIANT_WEIGHTS).sort()).toEqual([...PAYWALL_VARIANTS].sort());
  });
});

describe('PAYWALL_VARIANT_FALLBACK', () => {
  it('語彙内の値である', () => {
    expect(isPaywallVariant(PAYWALL_VARIANT_FALLBACK)).toBe(true);
  });
});
