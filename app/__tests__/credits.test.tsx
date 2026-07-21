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

  it('深宇宙の画像 見出しが表示される', () => {
    const { getByText } = render(<CreditsScreen />);
    expect(getByText('深宇宙の画像')).toBeTruthy();
  });

  it('ESA/Webb・ESA/Hubble への帰属が含まれる', () => {
    const { getAllByText } = render(<CreditsScreen />);
    expect(getAllByText(/ESA/).length).toBeGreaterThan(0);
  });
});

describe('docs/asset-credits.md', () => {
  const fs = require('fs');
  const path = require('path');
  const md = fs.readFileSync(
    path.resolve(__dirname, '../../docs/asset-credits.md'),
    'utf8',
  );

  it.each([
    'stardust',
    'nebula',
    'protostar',
    'whiteDwarf',
    'stellarSystem',
    'starCluster',
    'galaxy',
    'cosmos',
  ])('%s-field.webp のクレジット行がある', (name) => {
    expect(md).toContain(`${name}-field.webp`);
  });

  it('ESA/Webb と ESA/Hubble の帰属が記載されている', () => {
    expect(md).toMatch(/ESA\/Webb/);
    expect(md).toMatch(/ESA\/Hubble/);
  });
});
