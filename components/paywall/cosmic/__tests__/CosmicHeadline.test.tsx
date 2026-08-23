import { render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

import { CosmicHeadline } from '../CosmicHeadline';

describe('CosmicHeadline', () => {
  it('レンダリングしたとき見出しの上に前置きを置かない', () => {
    // 見出しの前に一言あると、本題に入る前にもう一段読ませることになる
    const { queryByText } = render(<CosmicHeadline />);

    expect(queryByText('今夜が、1日目になる。')).toBeNull();
  });

  it('レンダリングしたとき見出しが2行で表示される', () => {
    const { getByText } = render(<CosmicHeadline />);

    expect(getByText('意志力の問題じゃない。')).toBeTruthy();
    expect(getByText('仕組みで、止める。')).toBeTruthy();
  });

  it('レンダリングしたとき本文が表示される', () => {
    const { getByText } = render(<CosmicHeadline />);

    expect(getByText(/誘惑が強すぎるだけ/)).toBeTruthy();
  });

  it('翻訳キーが解決できたとき missing translation の生文字列が出ない', () => {
    const { queryByText } = render(<CosmicHeadline />);

    expect(queryByText(/missing/i)).toBeNull();
  });
});
