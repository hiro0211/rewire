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
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

import { TrialBottomSheet } from '../TrialBottomSheet';

const mockOffering = {
  annual: { product: { price: 2500, priceString: '¥2,500', currencyCode: 'JPY' } },
};

describe('TrialBottomSheet', () => {
  const defaultProps = {
    visible: true,
    offering: mockOffering,
    onDismiss: jest.fn(),
    onPurchaseCompleted: jest.fn(),
    onRestoreCompleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('visible=true でレンダリングされる', () => {
    expect(() => render(<TrialBottomSheet {...defaultProps} />)).not.toThrow();
  });

  it('visible=false でコンテンツが非表示', () => {
    const { queryByText } = render(
      <TrialBottomSheet {...defaultProps} visible={false} />
    );
    expect(queryByText('3日間無料でお試し')).toBeNull();
  });

  it('トライアルタイトル「3日間無料でお試し」が表示される', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    expect(getByText('3日間無料でお試し')).toBeTruthy();
  });

  it('価格テキストが表示される', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    expect(getByText('3日間無料、その後 ¥2,500/年')).toBeTruthy();
  });

  it('「今すぐ支払いなし」が表示される', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    expect(getByText('今すぐ支払いなし')).toBeTruthy();
  });

  it('CTAボタン「無料トライアルを始める」が表示される', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    expect(getByText('無料トライアルを始める')).toBeTruthy();
  });

  it('SubscriptionTerms が表示される', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    expect(
      getByText(/無料トライアル終了後、サブスクリプション料金が自動で課金されます/)
    ).toBeTruthy();
  });

  it('「購入の復元」リンクが表示される', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    expect(getByText('購入の復元')).toBeTruthy();
  });

  it('「閉じる」テキストリンクが表示される', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    expect(getByText('閉じる')).toBeTruthy();
  });

  it('背景タップで onDismiss が呼ばれる', () => {
    const { getByTestId } = render(<TrialBottomSheet {...defaultProps} />);
    fireEvent.press(getByTestId('bottom-sheet-overlay'));
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('「閉じる」タップで onDismiss が呼ばれる', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    fireEvent.press(getByText('閉じる'));
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });
});
