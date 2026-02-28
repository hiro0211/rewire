import React from 'react';
import { render } from '@testing-library/react-native';

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

import { PaywallTrial } from '../PaywallTrial';

const mockOffering = {
  annual: { product: { price: 2500, priceString: '¥2,500' } },
};

describe('PaywallTrial', () => {
  const defaultProps = {
    offering: mockOffering,
    onPurchaseCompleted: jest.fn(),
    onRestoreCompleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<PaywallTrial {...defaultProps} />)).not.toThrow();
  });

  it('ONE TIME OFFERが表示される', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    expect(getByText('ONE TIME OFFER')).toBeTruthy();
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
    expect(getByText('Rewireを3日間無料でお試し')).toBeTruthy();
    expect(getByText('3日間無料、その後 ¥2,500/年')).toBeTruthy();
    expect(getByText('今すぐ支払いなし')).toBeTruthy();
  });

  it('閉じるボタンが存在しない（ハードペイウォール）', () => {
    const { queryByTestId } = render(<PaywallTrial {...defaultProps} />);
    expect(queryByTestId('close-button')).toBeNull();
  });

  it('CTAボタンが表示される', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    expect(getByText('無料トライアルを始める')).toBeTruthy();
  });

  it('購入復元リンクが表示される', () => {
    const { getByText } = render(<PaywallTrial {...defaultProps} />);
    expect(getByText('購入の復元')).toBeTruthy();
  });
});
