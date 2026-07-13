import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      surface: '#1a1a1a',
      text: '#ffffff',
    },
    shadows: { sheet: {} },
  }),
}));

import { Toast } from '../Toast';

describe('Toast', () => {
  it('visible=true のとき message が表示される', () => {
    const { getByText } = render(<Toast visible message="ブロック完了" />);
    expect(getByText('ブロック完了')).toBeTruthy();
  });

  it('visible=false のとき何も描画しない', () => {
    const { queryByText } = render(
      <Toast visible={false} message="ブロック完了" />,
    );
    expect(queryByText('ブロック完了')).toBeNull();
  });

  it('testID でトーストコンテナを参照できる', () => {
    const { getByTestId } = render(
      <Toast visible message="ブロック完了" testID="my-toast" />,
    );
    expect(getByTestId('my-toast')).toBeTruthy();
  });
});
