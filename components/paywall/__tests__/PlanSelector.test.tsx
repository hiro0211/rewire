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

  describe('emphasizeMonthly（月換算を主役にする表示）', () => {
    const props = {
      ...baseProps,
      annualPackage,
      monthlyPackage,
      emphasizeMonthly: true,
    };

    it('年額カードの主表示が月換算の金額になる', () => {
      const { getByText } = render(<PlanSelector {...props} />);

      expect(getByText('¥450')).toBeTruthy();
    });

    it('年額カードに実際の請求総額が「¥5,400／年」として残る', () => {
      // 主役を月換算にしても、実際に請求される総額を消してはいけない
      // （Guideline 3.1.2(c)／見た金額と請求額のズレは信頼の直接の毀損）
      const { getByText } = render(<PlanSelector {...props} />);

      expect(getByText('¥5,400／年')).toBeTruthy();
    });

    it('月換算（主役）の文字サイズが請求総額（従属）より大きい', () => {
      const { getByText } = render(<PlanSelector {...props} />);

      expect(fontSizeOf(getByText('¥450'))).toBeGreaterThan(
        fontSizeOf(getByText('¥5,400／年')),
      );
    });

    it('月額カードの表示は変わらない', () => {
      const { getByText } = render(<PlanSelector {...props} />);

      expect(getByText('¥680')).toBeTruthy();
    });

    it('指定しないときは従来どおり総額が主役のまま', () => {
      // 対照群（PaywallDefault）の見た目を変えないための回帰テスト
      const { getByText, queryByText } = render(
        <PlanSelector {...baseProps} annualPackage={annualPackage} monthlyPackage={monthlyPackage} />,
      );

      expect(getByText('¥5,400')).toBeTruthy();
      expect(queryByText('¥5,400／年')).toBeNull();
    });
  });
});
