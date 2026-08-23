import { render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

import { FeatureRowList } from '../FeatureRowList';

describe('FeatureRowList', () => {
  it('機能が5行描画される', () => {
    const { getAllByTestId } = render(<FeatureRowList />);

    expect(getAllByTestId('feature-row')).toHaveLength(5);
  });

  it('対照群と同じ機能の見出しを表示する', () => {
    // 新旧で違う約束を見せると、A/B の差が「約束の違い」になってしまう
    const { getByText } = render(<FeatureRowList />);

    expect(getByText('全ブラウザで、見る前に止める')).toBeTruthy();
    expect(getByText('続いた日数を、ひと目で')).toBeTruthy();
    expect(getByText('衝動がきたら、ひと呼吸')).toBeTruthy();
    expect(getByText('1日1分の、振り返り')).toBeTruthy();
    expect(getByText('月から宇宙まで、18の節目')).toBeTruthy();
  });

  it('翻訳キーが解決できず生キーのまま出ることがない', () => {
    const { queryByText } = render(<FeatureRowList />);

    expect(queryByText(/paywall\.features\./)).toBeNull();
  });
});
