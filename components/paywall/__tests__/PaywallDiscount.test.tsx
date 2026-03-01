import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: (props: any) => <View {...props} /> };
});
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

import * as WebBrowser from 'expo-web-browser';
import { PaywallDiscount } from '../PaywallDiscount';

const mockOffering = {
  annual: { product: { price: 2500, priceString: '¥2,500' } },
};

describe('PaywallDiscount', () => {
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
    expect(() => render(<PaywallDiscount {...defaultProps} />)).not.toThrow();
  });

  it('ONE TIME OFFERが表示される', () => {
    const { getByText } = render(<PaywallDiscount {...defaultProps} />);
    expect(getByText('ONE TIME OFFER')).toBeTruthy();
  });

  it('69% OFFが表示される', () => {
    const { getByText } = render(<PaywallDiscount {...defaultProps} />);
    expect(getByText('69%')).toBeTruthy();
    expect(getByText('OFF')).toBeTruthy();
  });

  it('LOWEST PRICE EVERバッジが表示される', () => {
    const { getByText } = render(<PaywallDiscount {...defaultProps} />);
    expect(getByText('LOWEST PRICE EVER')).toBeTruthy();
  });

  it('月額換算価格が表示される', () => {
    const { getByText } = render(<PaywallDiscount {...defaultProps} />);
    expect(getByText('¥208/月')).toBeTruthy();
  });

  it('閉じるボタンでonDismissが呼ばれる', () => {
    const { getByTestId } = render(<PaywallDiscount {...defaultProps} />);
    fireEvent.press(getByTestId('close-button'));
    expect(defaultProps.onDismiss).toHaveBeenCalled();
  });

  it('CTAボタンが表示される', () => {
    const { getByText } = render(<PaywallDiscount {...defaultProps} />);
    expect(getByText('今すぐオファーを受け取る')).toBeTruthy();
  });

  it('購入復元リンクが表示される', () => {
    const { getByText } = render(<PaywallDiscount {...defaultProps} />);
    expect(getByText('購入の復元')).toBeTruthy();
  });

  it('カウントダウンタイマーが表示される', () => {
    const { getByTestId } = render(<PaywallDiscount {...defaultProps} />);
    expect(getByTestId('countdown-timer')).toBeTruthy();
  });

  it('自動更新に関する説明テキストが表示される', () => {
    const { getByText } = render(<PaywallDiscount {...defaultProps} />);
    expect(getByText(/サブスクリプションは期間終了の24時間前までにキャンセルしない限り自動更新されます/)).toBeTruthy();
  });

  it('利用規約リンクが表示される', () => {
    const { getByText } = render(<PaywallDiscount {...defaultProps} />);
    expect(getByText('利用規約')).toBeTruthy();
  });

  it('プライバシーポリシーリンクが表示される', () => {
    const { getByText } = render(<PaywallDiscount {...defaultProps} />);
    expect(getByText('プライバシーポリシー')).toBeTruthy();
  });

  it('利用規約タップでWebBrowserが開く', () => {
    const { getByText } = render(<PaywallDiscount {...defaultProps} />);
    fireEvent.press(getByText('利用規約'));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://hiro0211.github.io/rewire-support/#terms'
    );
  });

  it('プライバシーポリシータップでWebBrowserが開く', () => {
    const { getByText } = render(<PaywallDiscount {...defaultProps} />);
    fireEvent.press(getByText('プライバシーポリシー'));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://hiro0211.github.io/rewire-support/#privacy'
    );
  });
});
