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

import { PaywallDefault } from '../PaywallDefault';

describe('PaywallDefault crash prevention', () => {
  const baseProps = {
    onDismiss: jest.fn(),
    onPurchaseCompleted: jest.fn(),
    onRestoreCompleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('offering=null → クラッシュしない', () => {
    expect(() => render(<PaywallDefault {...baseProps} offering={null} />)).not.toThrow();
  });

  it('offering=undefined → クラッシュしない', () => {
    expect(() => render(<PaywallDefault {...baseProps} offering={undefined} />)).not.toThrow();
  });

  it('offering.annual=undefined, offering.monthly=undefined → デフォルト値表示', () => {
    const { getByText } = render(<PaywallDefault {...baseProps} offering={{}} />);
    // デフォルト値（¥5,400 / ¥680）でフォールバック
    expect(getByText('Billed as ¥5,400 per year')).toBeTruthy();
  });

  it('offering.annual=null → デフォルト値でレンダリング', () => {
    const offering = { annual: null, monthly: { product: { price: 680 } } };
    expect(() => render(<PaywallDefault {...baseProps} offering={offering} />)).not.toThrow();
  });

  it('offering.monthly=null → デフォルト値でレンダリング', () => {
    const offering = { annual: { product: { price: 5400 } }, monthly: null };
    expect(() => render(<PaywallDefault {...baseProps} offering={offering} />)).not.toThrow();
  });

  it('Purchases=null → 購入ボタン押下でクラッシュしない', () => {
    const offering = {
      annual: { product: { price: 5400 } },
      monthly: { product: { price: 680 } },
    };
    const { getByText } = render(<PaywallDefault {...baseProps} offering={offering} />);
    // Purchases=null(isExpoGo)なので購入は何もしない
    expect(() => fireEvent.press(getByText('今すぐ始める'))).not.toThrow();
  });

  it('Purchases=null → 復元ボタン押下でクラッシュしない', () => {
    const offering = {
      annual: { product: { price: 5400 } },
      monthly: { product: { price: 680 } },
    };
    const { getByText } = render(<PaywallDefault {...baseProps} offering={offering} />);
    expect(() => fireEvent.press(getByText('購入の復元'))).not.toThrow();
  });

  it('offering=null → 閉じるボタン押下でonDismiss呼ばれクラッシュしない', () => {
    const { getByTestId } = render(<PaywallDefault {...baseProps} offering={null} />);
    fireEvent.press(getByTestId('close-button'));
    expect(baseProps.onDismiss).toHaveBeenCalled();
  });

  it('selectedPackage=undefined → 購入ボタンが何もしない', () => {
    // offering={}なのでannual/monthlyともundefined → selectedPackage=undefined
    const { getByText } = render(<PaywallDefault {...baseProps} offering={{}} />);
    expect(() => fireEvent.press(getByText('今すぐ始める'))).not.toThrow();
  });

  it('offering.annual.product=null → デフォルト価格', () => {
    const offering = { annual: { product: null }, monthly: { product: { price: 680 } } };
    expect(() => render(<PaywallDefault {...baseProps} offering={offering} />)).not.toThrow();
  });
});
