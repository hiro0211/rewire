import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));
jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string, options?: Record<string, string>) => {
      if (options) {
        return Object.entries(options).reduce(
          (str, [k, v]) => str.replace(`{{${k}}}`, v),
          key,
        );
      }
      return key;
    },
    locale: 'ja' as const,
    isJapanese: true,
  }),
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
    expect(queryByText('paywall.tryFree')).toBeNull();
  });

  it('トライアルタイトルキー paywall.tryFree が表示される', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    expect(getByText('paywall.tryFree')).toBeTruthy();
  });

  it('価格テキストキー paywall.trialBilling が表示される', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    expect(getByText(/paywall\.trialBilling/)).toBeTruthy();
  });

  it('paywall.noPaymentNow が表示される', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    expect(getByText('paywall.noPaymentNow')).toBeTruthy();
  });

  it('CTAボタン paywall.startFreeTrial が表示される', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    expect(getByText('paywall.startFreeTrial')).toBeTruthy();
  });

  it('paywall.trialAutoRenew が表示される', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    expect(getByText(/paywall\.trialAutoRenew/)).toBeTruthy();
  });

  it('paywall.restorePurchase が表示される', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    expect(getByText('paywall.restorePurchase')).toBeTruthy();
  });

  it('common.close が表示される', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    expect(getByText('common.close')).toBeTruthy();
  });

  it('背景タップで onDismiss が呼ばれる', () => {
    const { getByTestId } = render(<TrialBottomSheet {...defaultProps} />);
    fireEvent.press(getByTestId('bottom-sheet-overlay'));
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('「閉じる」タップで onDismiss が呼ばれる', () => {
    const { getByText } = render(<TrialBottomSheet {...defaultProps} />);
    fireEvent.press(getByText('common.close'));
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });
});
