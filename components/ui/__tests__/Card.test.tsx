import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '../Card';

describe('Card', () => {
  it('variant 未指定時、デフォルトスタイルで描画される', () => {
    const { getByText, queryByTestId } = render(
      <Card><Text>テスト</Text></Card>
    );
    expect(getByText('テスト')).toBeTruthy();
    expect(queryByTestId('card-elevated')).toBeNull();
  });

  it('variant="elevated" 時、testID="card-elevated" が存在する', () => {
    const { getByTestId } = render(
      <Card variant="elevated"><Text>テスト</Text></Card>
    );
    expect(getByTestId('card-elevated')).toBeTruthy();
  });

  it('children が正しく描画される', () => {
    const { getByText } = render(
      <Card variant="elevated"><Text>子要素テスト</Text></Card>
    );
    expect(getByText('子要素テスト')).toBeTruthy();
  });
});
