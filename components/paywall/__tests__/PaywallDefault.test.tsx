import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

import * as WebBrowser from 'expo-web-browser';
import { PaywallDefault } from '../PaywallDefault';

const mockOffering = {
  annual: { product: { price: 5400, priceString: '¥5,400', currencyCode: 'JPY' } },
  monthly: { product: { price: 680, priceString: '¥680', currencyCode: 'JPY' } },
};

describe('PaywallDefault', () => {
  const defaultProps = {
    offering: mockOffering,
    onDismiss: jest.fn(),
    onPurchaseCompleted: jest.fn(),
    onRestoreCompleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<PaywallDefault {...defaultProps} />)).not.toThrow();
  });

  it('ロゴとタグラインが表示される', () => {
    const { getByText, UNSAFE_getAllByType } = render(<PaywallDefault {...defaultProps} />);
    const { Image } = require('react-native');
    const images = UNSAFE_getAllByType(Image);
    expect(images.length).toBeGreaterThanOrEqual(1);
    expect(getByText('自分を、取り戻そう。')).toBeTruthy();
  });

  it('機能カードが表示される', () => {
    const { getByText } = render(<PaywallDefault {...defaultProps} />);
    expect(getByText('全ブラウザで、見る前に止める')).toBeTruthy();
    expect(getByText('続いた日数を、ひと目で')).toBeTruthy();
    expect(getByText('衝動がきたら、ひと呼吸')).toBeTruthy();
    expect(getByText('1日1分の、振り返り')).toBeTruthy();
    expect(getByText('月から宇宙まで、18の節目')).toBeTruthy();
  });

  it('CTAボタンに「無料で始める」と表示される', () => {
    const { getByText } = render(<PaywallDefault {...defaultProps} />);
    expect(getByText('無料で始める')).toBeTruthy();
  });

  it('閉じるボタンでonDismissが呼ばれる', () => {
    const { getByTestId } = render(<PaywallDefault {...defaultProps} />);
    fireEvent.press(getByTestId('close-button'));
    expect(defaultProps.onDismiss).toHaveBeenCalled();
  });

  it('年額プランの課金表示に無料体験が含まれる', () => {
    const { getByText } = render(<PaywallDefault {...defaultProps} />);
    expect(getByText('3日間無料、そのあと ¥5,400／年')).toBeTruthy();
  });

  it('月額プラン選択時に課金表示に無料体験が含まれる', () => {
    const { getByTestId, getByText } = render(<PaywallDefault {...defaultProps} />);
    fireEvent.press(getByTestId('plan-monthly'));
    expect(getByText('3日間無料、そのあと ¥680／月')).toBeTruthy();
  });

  it('プラン選択時に plan_selected を送信する', () => {
    const { getByTestId } = render(<PaywallDefault {...defaultProps} />);
    fireEvent.press(getByTestId('plan-monthly'));
    expect(mockTrackEvent).toHaveBeenCalledWith('plan_selected', { plan: 'monthly' });
  });

  it('購入復元リンクが表示される', () => {
    const { getByText } = render(<PaywallDefault {...defaultProps} />);
    expect(getByText('購入を復元')).toBeTruthy();
  });

  it('自動更新に関する説明テキストが表示される', () => {
    const { getByText } = render(<PaywallDefault {...defaultProps} />);
    expect(getByText(/期間終了の24時間前までに解約しない場合、自動で更新/)).toBeTruthy();
  });

  it('利用規約リンクが表示される', () => {
    const { getByText } = render(<PaywallDefault {...defaultProps} />);
    expect(getByText('利用規約')).toBeTruthy();
  });

  it('プライバシーポリシーリンクが表示される', () => {
    const { getByText } = render(<PaywallDefault {...defaultProps} />);
    expect(getByText('プライバシーポリシー')).toBeTruthy();
  });

  it('利用規約タップでWebBrowserが開く', () => {
    const { getByText } = render(<PaywallDefault {...defaultProps} />);
    fireEvent.press(getByText('利用規約'));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://hiro0211.github.io/rewire-support/#terms'
    );
  });

  it('プライバシーポリシータップでWebBrowserが開く', () => {
    const { getByText } = render(<PaywallDefault {...defaultProps} />);
    fireEvent.press(getByText('プライバシーポリシー'));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://hiro0211.github.io/rewire-support/#privacy'
    );
  });

  describe('monthlyPackage フォールバック', () => {
    it('offering.monthly が undefined でも availablePackages から MONTHLY を取得する', () => {
      const offeringWithoutMonthly = {
        annual: { product: { price: 5400, priceString: '¥5,400', currencyCode: 'JPY' } },
        availablePackages: [
          { packageType: 'ANNUAL', product: { price: 5400, priceString: '¥5,400', currencyCode: 'JPY' } },
          { packageType: 'MONTHLY', product: { price: 680, priceString: '¥680', currencyCode: 'JPY' } },
        ],
      };

      const { getByTestId, getByText } = render(
        <PaywallDefault {...defaultProps} offering={offeringWithoutMonthly} />,
      );

      fireEvent.press(getByTestId('plan-monthly'));
      expect(getByText('3日間無料、そのあと ¥680／月')).toBeTruthy();
    });

    it('monthlyPackage が完全に存在しない場合 Monthly プランカードが非表示', () => {
      const annualOnlyOffering = {
        annual: { product: { price: 5400, priceString: '¥5,400', currencyCode: 'JPY' } },
        availablePackages: [
          { packageType: 'ANNUAL', product: { price: 5400, priceString: '¥5,400', currencyCode: 'JPY' } },
        ],
      };

      const { queryByTestId } = render(
        <PaywallDefault {...defaultProps} offering={annualOnlyOffering} />,
      );

      expect(queryByTestId('plan-monthly')).toBeNull();
    });
  });
});
