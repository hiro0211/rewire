import { PAYWALL_SOURCE, PAYWALL_SOURCES, toPaywallSource } from '../paywallSource';

describe('PAYWALL_SOURCES', () => {
  it('ペイウォール導線の語彙は onboarding / returning / unknown の3つである', () => {
    expect(PAYWALL_SOURCES).toEqual(['onboarding', 'returning', 'unknown']);
  });
});

describe('toPaywallSource', () => {
  it('onboarding のとき onboarding になる', () => {
    expect(toPaywallSource('onboarding')).toBe(PAYWALL_SOURCE.ONBOARDING);
  });

  it('returning のとき returning になる', () => {
    expect(toPaywallSource('returning')).toBe(PAYWALL_SOURCE.RETURNING);
  });

  it('未指定のとき unknown になる', () => {
    expect(toPaywallSource(undefined)).toBe(PAYWALL_SOURCE.UNKNOWN);
  });

  it('語彙にない値のとき unknown になる', () => {
    // 語彙外の文字列がそのまま計測に流れると BigQuery 側で導線が割れるため丸める
    expect(toPaywallSource('settings')).toBe(PAYWALL_SOURCE.UNKNOWN);
  });

  it('配列で渡されたとき先頭要素を採用する', () => {
    // useLocalSearchParams は同名パラメータが複数あると配列を返す
    expect(toPaywallSource(['returning'])).toBe(PAYWALL_SOURCE.RETURNING);
  });

  it('空配列のとき unknown になる', () => {
    expect(toPaywallSource([])).toBe(PAYWALL_SOURCE.UNKNOWN);
  });
});
