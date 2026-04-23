import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#fff',
      textSecondary: '#aaa',
      primary: '#4A90D9',
      surfaceHighlight: '#1F1F2C',
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

import { ThankYouStep } from '../ThankYouStep';

describe('ThankYouStep', () => {
  it('タイトル・説明・CTAを表示する', () => {
    const onNext = jest.fn();
    const { getByText } = render(<ThankYouStep onNext={onNext} />);

    expect(getByText('postPurchaseOnboarding.thankYou.title')).toBeTruthy();
    expect(getByText('postPurchaseOnboarding.thankYou.description')).toBeTruthy();
    expect(getByText('postPurchaseOnboarding.thankYou.cta')).toBeTruthy();
  });

  it('CTA タップで onNext が呼ばれる', () => {
    const onNext = jest.fn();
    const { getByText } = render(<ThankYouStep onNext={onNext} />);

    fireEvent.press(getByText('postPurchaseOnboarding.thankYou.cta'));

    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
