import React from 'react';
import { render } from '@testing-library/react-native';
import { ShareWidgetCard } from '../ShareWidgetCard';

describe('ShareWidgetCard', () => {
  const defaultProps = {
    elapsed: '30日2時間10分',
    relapseCount: 3,
    goalDays: 90,
    testID: 'share-widget-card',
  };

  it('ウィジェットカードが表示される', () => {
    const { getByTestId } = render(<ShareWidgetCard {...defaultProps} />);
    expect(getByTestId('share-widget-card')).toBeTruthy();
  });

  it('経過時間ラベルと値が表示される', () => {
    const { getByText } = render(<ShareWidgetCard {...defaultProps} />);
    expect(getByText('経過時間')).toBeTruthy();
    expect(getByText('30日2時間10分')).toBeTruthy();
  });

  it('リセット回数が表示される', () => {
    const { getByText } = render(<ShareWidgetCard {...defaultProps} />);
    expect(getByText('リセット 3回')).toBeTruthy();
  });

  it('目標日数が表示される', () => {
    const { getByText } = render(<ShareWidgetCard {...defaultProps} />);
    expect(getByText('目標 90日')).toBeTruthy();
  });
});
