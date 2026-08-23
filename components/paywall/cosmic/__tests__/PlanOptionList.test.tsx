import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

import { PlanOptionList } from '../PlanOptionList';

describe('PlanOptionList', () => {
  const baseProps = {
    annualPrice: 5400,
    monthlyPrice: 680,
    currencyCode: 'JPY',
    monthlyCurrencyCode: 'JPY',
    showMonthly: true,
    selectedPlan: 'annual' as const,
    onSelectPlan: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('年額の主表示が実際に請求される総額になる', () => {
    // Apple: "the amount that will be billed must be the most prominent
    // pricing element in the layout"
    const { getByTestId } = render(<PlanOptionList {...baseProps} />);

    expect(getByTestId('plan-annual-price-main')).toHaveTextContent('¥5,400／年');
  });

  it('年額の従属表示が月換算になる', () => {
    // 計算値は "subordinate position and size" に置く
    const { getByTestId } = render(<PlanOptionList {...baseProps} />);

    expect(getByTestId('plan-annual-price-sub')).toHaveTextContent('¥450／月');
  });

  it('月額の金額が表示される', () => {
    const { getByText } = render(<PlanOptionList {...baseProps} />);

    expect(getByText('¥680／月')).toBeTruthy();
  });

  it('年額に割引バッジが出る', () => {
    const { getByText } = render(<PlanOptionList {...baseProps} />);

    expect(getByText('34%お得')).toBeTruthy();
  });

  it('選択中のプランだけがチェック状態になる', () => {
    const { getByTestId, queryByTestId } = render(<PlanOptionList {...baseProps} />);

    expect(getByTestId('plan-annual-checked')).toBeTruthy();
    expect(queryByTestId('plan-monthly-checked')).toBeNull();
  });

  it('月額を選ぶと選択が切り替わる', () => {
    const { getByTestId, queryByTestId } = render(
      <PlanOptionList {...baseProps} selectedPlan="monthly" />
    );

    expect(getByTestId('plan-monthly-checked')).toBeTruthy();
    expect(queryByTestId('plan-annual-checked')).toBeNull();
  });

  it('行を押すと onSelectPlan が呼ばれる', () => {
    const { getByTestId } = render(<PlanOptionList {...baseProps} />);

    fireEvent.press(getByTestId('plan-monthly'));

    expect(baseProps.onSelectPlan).toHaveBeenCalledWith('monthly');
  });

  it('月額が買えないとき月額の行を出さない', () => {
    const { queryByTestId } = render(<PlanOptionList {...baseProps} showMonthly={false} />);

    expect(queryByTestId('plan-monthly')).toBeNull();
  });

  it('月額が買えないとき割引バッジも出さない', () => {
    // 比較対象が無いのに割引率を出すと、架空の基準価格を作ることになる
    const { queryByText } = render(<PlanOptionList {...baseProps} showMonthly={false} />);

    expect(queryByText('34%お得')).toBeNull();
  });
});
