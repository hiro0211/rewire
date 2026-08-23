import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { PaywallUnavailableState } from '../PaywallUnavailableState';

describe('PaywallUnavailableState', () => {
  const defaultProps = {
    onRetry: jest.fn(),
    onBack: jest.fn(),
    isFromOnboarding: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('接続できないときにタイトルが表示される', () => {
    const { getByText } = render(<PaywallUnavailableState {...defaultProps} />);
    expect(getByText('いま、つながりません')).toBeTruthy();
  });

  it('再試行ボタンを押したときonRetryが呼ばれる', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<PaywallUnavailableState {...defaultProps} onRetry={onRetry} />);
    fireEvent.press(getByText('再試行'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('オンボーディング経由のときに「あとで試す」が表示される', () => {
    const { getByText } = render(<PaywallUnavailableState {...defaultProps} isFromOnboarding />);
    expect(getByText('あとで試す')).toBeTruthy();
  });

  it('オンボーディング経由のときに「戻る」が表示されない', () => {
    const { queryByText } = render(<PaywallUnavailableState {...defaultProps} isFromOnboarding />);
    expect(queryByText('戻る')).toBeNull();
  });

  it('オンボーディング経由でないときに「戻る」が表示される', () => {
    const { getByText } = render(
      <PaywallUnavailableState {...defaultProps} isFromOnboarding={false} />
    );
    expect(getByText('戻る')).toBeTruthy();
  });

  it('戻るボタンを押したときonBackが呼ばれる', () => {
    const onBack = jest.fn();
    const { getByText } = render(<PaywallUnavailableState {...defaultProps} onBack={onBack} />);
    fireEvent.press(getByText('戻る'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('あとで試すボタンを押したときonBackが呼ばれる', () => {
    const onBack = jest.fn();
    const { getByText } = render(
      <PaywallUnavailableState {...defaultProps} isFromOnboarding onBack={onBack} />
    );
    fireEvent.press(getByText('あとで試す'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
