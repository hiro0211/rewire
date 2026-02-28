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

import { PaywallDefault } from '../PaywallDefault';

const mockOffering = {
  annual: { product: { price: 5400, priceString: '¥5,400' } },
  monthly: { product: { price: 680, priceString: '¥680' } },
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
    const { getByText } = render(<PaywallDefault {...defaultProps} />);
    expect(getByText('Rewire')).toBeTruthy();
    expect(getByText('Reclaim yourself.')).toBeTruthy();
  });

  it('機能カードが表示される', () => {
    const { getByText } = render(<PaywallDefault {...defaultProps} />);
    expect(getByText('ストリーク記録')).toBeTruthy();
    expect(getByText('SOS呼吸法')).toBeTruthy();
    expect(getByText('デイリーチェックイン')).toBeTruthy();
    expect(getByText('実績バッジ')).toBeTruthy();
  });

  it('CTAボタンが表示される', () => {
    const { getByText } = render(<PaywallDefault {...defaultProps} />);
    expect(getByText('今すぐ始める')).toBeTruthy();
  });

  it('閉じるボタンでonDismissが呼ばれる', () => {
    const { getByTestId } = render(<PaywallDefault {...defaultProps} />);
    fireEvent.press(getByTestId('close-button'));
    expect(defaultProps.onDismiss).toHaveBeenCalled();
  });

  it('年額プランの課金表示が表示される', () => {
    const { getByText } = render(<PaywallDefault {...defaultProps} />);
    expect(getByText('Billed as ¥5,400 per year')).toBeTruthy();
  });

  it('月額プラン選択時に課金表示が変わる', () => {
    const { getByTestId, getByText } = render(<PaywallDefault {...defaultProps} />);
    fireEvent.press(getByTestId('plan-monthly'));
    expect(getByText('Billed as ¥680 per month')).toBeTruthy();
  });

  it('購入復元リンクが表示される', () => {
    const { getByText } = render(<PaywallDefault {...defaultProps} />);
    expect(getByText('購入の復元')).toBeTruthy();
  });
});
