import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: require('@/constants/colorPalettes').DARK_COLORS,
    isDark: true,
  }),
}));

import CreditsScreen from '../credits';

describe('CreditsScreen', () => {
  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<CreditsScreen />)).not.toThrow();
  });

  it('Planet textures 見出しが表示される', () => {
    const { getByText } = render(<CreditsScreen />);
    expect(getByText('惑星テクスチャ')).toBeTruthy();
  });

  it('Solar System Scope への帰属が本文に含まれる', () => {
    const { getAllByText } = render(<CreditsScreen />);
    expect(getAllByText(/Solar System Scope/).length).toBeGreaterThan(0);
  });

  it('CC BY 4.0 ライセンス表記が含まれる', () => {
    const { getAllByText } = render(<CreditsScreen />);
    expect(getAllByText(/CC BY 4\.0/).length).toBeGreaterThan(0);
  });

  it('NASA の言及が含まれる', () => {
    const { getAllByText } = render(<CreditsScreen />);
    expect(getAllByText(/NASA/).length).toBeGreaterThan(0);
  });

  it('CC ライセンス全文へのリンクが描画される', () => {
    const { getByTestId } = render(<CreditsScreen />);
    expect(getByTestId('credits-cc-link')).toBeTruthy();
  });
});
