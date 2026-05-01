import React from 'react';
import { Linking } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#fff',
      textSecondary: '#aaa',
      primary: '#4A90D9',
      surfaceHighlight: '#1F1F2C',
      surfaceGlass: 'rgba(255,255,255,0.06)',
      contrastText: '#fff',
    },
    shadows: { glowCard: {}, sheet: {} },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja',
  }),
}));

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

import { DemoStep } from '../DemoStep';
import { DEMO_TEST_URL } from '@/constants/postPurchaseOnboarding';

describe('DemoStep', () => {
  beforeEach(() => {
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('「ブロックをテスト」タップで Linking.openURL が DEMO_TEST_URL で呼ばれ、onTestBlock が先に呼ばれる', () => {
    const onTestBlock = jest.fn();
    const onSkip = jest.fn();
    const { getByText } = render(
      <DemoStep onTestBlock={onTestBlock} onSkip={onSkip} />
    );

    fireEvent.press(getByText('postPurchaseOnboarding.demo.testButton'));

    expect(onTestBlock).toHaveBeenCalledTimes(1);
    expect(Linking.openURL).toHaveBeenCalledWith(DEMO_TEST_URL);
  });

  it('DEMO_TEST_URL は GitHub Pages の Rewire 中継ページを指す', () => {
    expect(DEMO_TEST_URL).toBe('https://hiro0211.github.io/rewire-demo-block/');
  });

  it('「あとで試す」タップで onSkip が呼ばれる', () => {
    const onTestBlock = jest.fn();
    const onSkip = jest.fn();
    const { getByText } = render(
      <DemoStep onTestBlock={onTestBlock} onSkip={onSkip} />
    );

    fireEvent.press(getByText('postPurchaseOnboarding.demo.skipButton'));

    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('showRetryHint=true なら retryHint が表示される', () => {
    const { getByText } = render(
      <DemoStep onTestBlock={jest.fn()} onSkip={jest.fn()} showRetryHint />
    );

    expect(getByText('postPurchaseOnboarding.demo.retryHint')).toBeTruthy();
  });
});
