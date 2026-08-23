import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

import { PlanOptionRow } from '../PlanOptionRow';

function fontSizeOf(node: { props: { style?: unknown } }): number {
  const flat = StyleSheet.flatten(node.props.style) as { fontSize?: number } | undefined;
  return flat?.fontSize ?? 0;
}

describe('PlanOptionRow', () => {
  const baseProps = {
    testID: 'plan-annual',
    label: '年額',
    priceMain: '¥5,400／年',
    priceSub: '¥450／月',
    selected: true,
    onPress: jest.fn(),
  };

  it('主表示と従属表示を別の要素として描き分ける', () => {
    // 存在チェックだけでは主従の入れ替わりを検出できないので階層で見る
    const { getByTestId } = render(<PlanOptionRow {...baseProps} />);

    expect(getByTestId('plan-annual-price-main')).toHaveTextContent('¥5,400／年');
    expect(getByTestId('plan-annual-price-sub')).toHaveTextContent('¥450／月');
  });

  it('主表示の文字サイズが従属表示より大きい', () => {
    // Apple: 請求される総額が the most prominent pricing element でなければならない
    const { getByTestId } = render(<PlanOptionRow {...baseProps} />);

    expect(fontSizeOf(getByTestId('plan-annual-price-main'))).toBeGreaterThan(
      fontSizeOf(getByTestId('plan-annual-price-sub'))
    );
  });

  it('従属表示が無いとき主表示だけを描く', () => {
    const { getByTestId, queryByTestId } = render(
      <PlanOptionRow {...baseProps} testID="plan-monthly" priceSub={undefined} />
    );

    expect(getByTestId('plan-monthly-price-main')).toBeTruthy();
    expect(queryByTestId('plan-monthly-price-sub')).toBeNull();
  });
});
