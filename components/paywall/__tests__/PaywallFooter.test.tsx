import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaywallFooter } from '../PaywallFooter';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { textSecondary: '#6B6B7B' },
  }),
}));

jest.mock('../SubscriptionTerms', () => ({
  SubscriptionTerms: () => null,
}));

describe('PaywallFooter', () => {
  it('「購入の復元」テキストが表示される', () => {
    const { getByText } = render(
      <PaywallFooter onRestore={jest.fn()} purchasing={false} />
    );
    expect(getByText('購入の復元')).toBeTruthy();
  });

  it('復元ボタンタップで onRestore が呼ばれる', () => {
    const onRestore = jest.fn();
    const { getByText } = render(
      <PaywallFooter onRestore={onRestore} purchasing={false} />
    );
    fireEvent.press(getByText('購入の復元'));
    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  it('purchasing=true で復元ボタンが無効化される', () => {
    const onRestore = jest.fn();
    const { getByText } = render(
      <PaywallFooter onRestore={onRestore} purchasing={true} />
    );
    fireEvent.press(getByText('購入の復元'));
    expect(onRestore).not.toHaveBeenCalled();
  });

  it('trialText を渡すとクラッシュしない', () => {
    expect(() =>
      render(
        <PaywallFooter
          onRestore={jest.fn()}
          purchasing={false}
          trialText="トライアルテキスト"
        />
      )
    ).not.toThrow();
  });
});
