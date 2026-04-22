import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

import * as WebBrowser from 'expo-web-browser';
import { PaywallTrial } from '../PaywallTrial';

const mockOffering = {
  annual: { product: { price: 2500, priceString: '¥2,500', currencyCode: 'JPY' } },
};

describe('PaywallTrial', () => {
  const defaultProps = {
    offering: mockOffering,
    onDismiss: jest.fn(),
    onPurchaseCompleted: jest.fn(),
    onRestoreCompleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<PaywallTrial {...defaultProps} />)).not.toThrow();
  });

  it('SPECIAL OFFERが表示される', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    expect(getByText('SPECIAL OFFER')).toBeTruthy();
  });

  it('あなたへの特別オファーが表示される', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    expect(getByText('あなただけに、特別オファー')).toBeTruthy();
  });

  it('69% OFFが表示される', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    expect(getByText('69%')).toBeTruthy();
    expect(getByText('OFF')).toBeTruthy();
  });

  it('FREE TRIALリボンが表示される', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    expect(getByText('FREE TRIAL')).toBeTruthy();
  });

  it('3日間無料のテキストが表示される', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    expect(getByText('Rewire を3日間、無料で。')).toBeTruthy();
    expect(getByText('3日間無料、そのあと ¥2,500／年')).toBeTruthy();
    expect(getByText('支払いは、3日後から。')).toBeTruthy();
  });

  it('閉じるボタンが表示される', () => {
    const { getByTestId } = render(<PaywallTrial {...defaultProps} />);
    expect(getByTestId('close-button')).toBeTruthy();
  });

  it('閉じるボタン押下で onDismiss が呼ばれる', () => {
    const { getByTestId } = render(<PaywallTrial {...defaultProps} />);
    fireEvent.press(getByTestId('close-button'));
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('CTAボタンが表示される', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    expect(getByText('無料トライアルを始める')).toBeTruthy();
  });

  it('購入復元リンクが表示される', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    expect(getByText('購入を復元')).toBeTruthy();
  });

  it('自動更新に関する説明テキストが表示される（トライアル固有文言を含む）', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    expect(getByText(/トライアル終了後、自動で課金されます/)).toBeTruthy();
    expect(getByText(/期間終了の24時間前までに解約しない場合、自動で更新/)).toBeTruthy();
  });

  it('利用規約リンクが表示される', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    expect(getByText('利用規約')).toBeTruthy();
  });

  it('プライバシーポリシーリンクが表示される', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    expect(getByText('プライバシーポリシー')).toBeTruthy();
  });

  it('利用規約タップでWebBrowserが開く', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    fireEvent.press(getByText('利用規約'));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://hiro0211.github.io/rewire-support/#terms'
    );
  });

  it('プライバシーポリシータップでWebBrowserが開く', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    fireEvent.press(getByText('プライバシーポリシー'));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://hiro0211.github.io/rewire-support/#privacy'
    );
  });
});
