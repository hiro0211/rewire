import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

import { PaywallCosmicJourney } from '../PaywallCosmicJourney';

describe('PaywallCosmicJourney crash prevention', () => {
  const baseProps = {
    onDismiss: jest.fn(),
    onPurchaseCompleted: jest.fn(),
    onRestoreCompleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('offering が null のときクラッシュしない', () => {
    expect(() =>
      render(<PaywallCosmicJourney {...baseProps} offering={null} />)
    ).not.toThrow();
  });

  it('offering が undefined のときクラッシュしない', () => {
    expect(() =>
      render(<PaywallCosmicJourney {...baseProps} offering={undefined} />)
    ).not.toThrow();
  });

  it('offering が空オブジェクトのときデフォルト価格でレンダリングされる', () => {
    const { getAllByText } = render(<PaywallCosmicJourney {...baseProps} offering={{}} />);

    // package が1つも取れないので月額は選べない扱いになり、年額表示に落ちる。
    // 料金透明性ブロックとフッターの2箇所に出るので getAllByText で受ける
    expect(getAllByText(/¥5,400／年/).length).toBeGreaterThan(0);
  });

  it('offering.annual が null のときクラッシュしない', () => {
    const offering = { annual: null, monthly: { product: { price: 680 } } };

    expect(() =>
      render(<PaywallCosmicJourney {...baseProps} offering={offering} />)
    ).not.toThrow();
  });

  it('offering.monthly が null のときクラッシュしない', () => {
    const offering = { annual: { product: { price: 5400 } }, monthly: null };

    expect(() =>
      render(<PaywallCosmicJourney {...baseProps} offering={offering} />)
    ).not.toThrow();
  });

  it('offering.annual.product が null のときクラッシュしない', () => {
    const offering = { annual: { product: null }, monthly: { product: { price: 680 } } };

    expect(() =>
      render(<PaywallCosmicJourney {...baseProps} offering={offering} />)
    ).not.toThrow();
  });

  it('offering が null のとき閉じるボタン押下で onDismiss が呼ばれクラッシュしない', () => {
    const { getByTestId } = render(
      <PaywallCosmicJourney {...baseProps} offering={null} />
    );

    fireEvent.press(getByTestId('close-button'));

    expect(baseProps.onDismiss).toHaveBeenCalled();
  });

  it('Purchases が null のとき購入ボタン押下でクラッシュしない', () => {
    const { getByText } = render(<PaywallCosmicJourney {...baseProps} offering={{}} />);

    expect(() => fireEvent.press(getByText('無料で始める'))).not.toThrow();
  });

  it('Purchases が null のとき復元ボタン押下でクラッシュしない', () => {
    const { getByText } = render(<PaywallCosmicJourney {...baseProps} offering={{}} />);

    expect(() => fireEvent.press(getByText('購入を復元'))).not.toThrow();
  });

  describe('月額プランが存在しない Offering', () => {
    const annualOnlyOffering = {
      annual: { product: { price: 5400, priceString: '¥5,400', currencyCode: 'JPY' } },
      availablePackages: [
        {
          packageType: 'ANNUAL',
          product: { price: 5400, priceString: '¥5,400', currencyCode: 'JPY' },
        },
      ],
    };

    it('monthlyPackage が存在しないとき月額カードが非表示になる', () => {
      const { queryByTestId } = render(
        <PaywallCosmicJourney {...baseProps} offering={annualOnlyOffering} />
      );

      expect(queryByTestId('plan-monthly')).toBeNull();
    });

    it('月額が買えないとき請求文が年額になる', () => {
      // 初期選択の monthly のまま表示すると、選べない月額の金額（¥680）を見せて
      // 実際は年額を請求することになる。見た金額と請求額のズレは信頼の直接の毀損
      const { getAllByText } = render(
        <PaywallCosmicJourney {...baseProps} offering={annualOnlyOffering} />
      );

      expect(getAllByText(/¥5,400／年/).length).toBeGreaterThan(0);
    });

    it('月額が買えないとき月額の金額を表示しない', () => {
      const { queryByText } = render(
        <PaywallCosmicJourney {...baseProps} offering={annualOnlyOffering} />
      );

      expect(queryByText(/¥680/)).toBeNull();
    });

    it('月額が買えないとき料金透明性ブロックの金額も年額になる', () => {
      const { getByText } = render(
        <PaywallCosmicJourney {...baseProps} offering={annualOnlyOffering} />
      );

      expect(getByText(/から ¥5,400／年。/)).toBeTruthy();
    });
  });
});
