import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
jest.mock('@/hooks/paywall/useDiscountExpiryTracker', () => ({
  useDiscountExpiryTracker: jest.fn(),
}));
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

import { PaywallDiscount } from '../PaywallDiscount';

describe('PaywallDiscount crash prevention', () => {
  const baseProps = {
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

  it('offering=null → クラッシュしない', () => {
    expect(() => render(<PaywallDiscount {...baseProps} offering={null} />)).not.toThrow();
  });

  it('offering=undefined → クラッシュしない', () => {
    expect(() => render(<PaywallDiscount {...baseProps} offering={undefined} />)).not.toThrow();
  });

  it('offering.annual=undefined → デフォルト値（¥2,500）で表示', () => {
    const { getByText } = render(<PaywallDiscount {...baseProps} offering={{}} />);
    expect(getByText(/2,500/)).toBeTruthy();
  });

  it('offering.annual.product=null → デフォルト価格で表示', () => {
    const offering = { annual: { product: null } };
    expect(() => render(<PaywallDiscount {...baseProps} offering={offering} />)).not.toThrow();
  });

  it('Purchases=null → 購入ボタン押下でクラッシュしない', () => {
    const offering = { annual: { product: { price: 2500 } } };
    const { getByText } = render(<PaywallDiscount {...baseProps} offering={offering} />);
    expect(() => fireEvent.press(getByText('今すぐオファーを受け取る'))).not.toThrow();
  });

  it('Purchases=null → 復元ボタン押下でクラッシュしない', () => {
    const offering = { annual: { product: { price: 2500 } } };
    const { getByText } = render(<PaywallDiscount {...baseProps} offering={offering} />);
    expect(() => fireEvent.press(getByText('購入の復元'))).not.toThrow();
  });

  it('offering=null → 閉じるボタン押下でonDismiss呼ばれクラッシュしない', () => {
    const { getByTestId } = render(<PaywallDiscount {...baseProps} offering={null} />);
    fireEvent.press(getByTestId('close-button'));
    expect(baseProps.onDismiss).toHaveBeenCalled();
  });

  it('initialSeconds=0 → クラッシュしない', () => {
    expect(() => render(
      <PaywallDiscount {...baseProps} offering={{ annual: { product: { price: 2500 } } }} initialSeconds={0} />
    )).not.toThrow();
  });
});
