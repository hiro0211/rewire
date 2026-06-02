import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { PlanSelector } from '../PlanSelector';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

const annualPackage = { product: { price: 5400, priceString: '¥5,400', currencyCode: 'JPY' } };
const monthlyPackage = { product: { price: 680, priceString: '¥680', currencyCode: 'JPY' } };

function fontSizeOf(node: any): number {
  return StyleSheet.flatten(node.props.style)?.fontSize;
}

describe('PlanSelector — Guideline 3.1.2(c) 価格表示の優先順位', () => {
  const baseProps = {
    selectedPlan: 'annual' as const,
    onSelectPlan: jest.fn(),
    currencyCode: 'JPY',
    showMonthly: true,
  };

  it('年額カードで実際の請求総額（¥5,400／年）が表示される', () => {
    const { getByText } = render(
      <PlanSelector {...baseProps} annualPackage={annualPackage} monthlyPackage={monthlyPackage} />,
    );
    expect(getByText('¥5,400')).toBeTruthy();
    expect(getByText('／年')).toBeTruthy();
  });

  it('年額カードで月換算（約 ¥450／月）が従属表示される', () => {
    const { getByText } = render(
      <PlanSelector {...baseProps} annualPackage={annualPackage} monthlyPackage={monthlyPackage} />,
    );
    expect(getByText('約 ¥450／月')).toBeTruthy();
  });

  it('年額カードに割引バッジ（34%お得）が表示される', () => {
    const { getByText } = render(
      <PlanSelector {...baseProps} annualPackage={annualPackage} monthlyPackage={monthlyPackage} />,
    );
    expect(getByText('34%お得')).toBeTruthy();
  });

  it('月額カードで実際の月額請求額（¥680）が表示される', () => {
    const { getByText } = render(
      <PlanSelector {...baseProps} annualPackage={annualPackage} monthlyPackage={monthlyPackage} />,
    );
    expect(getByText('¥680')).toBeTruthy();
  });

  it('プランラベルが日本語でローカライズされる', () => {
    const { getByText } = render(
      <PlanSelector {...baseProps} annualPackage={annualPackage} monthlyPackage={monthlyPackage} />,
    );
    expect(getByText('年額')).toBeTruthy();
    expect(getByText('月額')).toBeTruthy();
  });

  it('月額プランが無い場合は割引バッジを表示しない', () => {
    const { queryByText } = render(
      <PlanSelector
        {...baseProps}
        annualPackage={annualPackage}
        monthlyPackage={null}
        showMonthly={false}
      />,
    );
    expect(queryByText('34%お得')).toBeNull();
  });

  it('請求総額（主役）の文字サイズが月換算（従属）より大きい', () => {
    const { getByText } = render(
      <PlanSelector {...baseProps} annualPackage={annualPackage} monthlyPackage={monthlyPackage} />,
    );
    const billedTotal = fontSizeOf(getByText('¥5,400'));
    const monthlyEquivalent = fontSizeOf(getByText('約 ¥450／月'));
    expect(billedTotal).toBeGreaterThan(monthlyEquivalent);
  });
});
