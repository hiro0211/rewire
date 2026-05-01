import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#fff',
      textSecondary: '#aaa',
      primary: '#4A90D9',
      success: '#3DD68C',
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

import { CompleteStep } from '../CompleteStep';

describe('CompleteStep', () => {
  it('タイトル・説明・CTA がローカライズキー経由で描画される', () => {
    const { getByText } = render(<CompleteStep onFinish={jest.fn()} />);

    expect(getByText('postPurchaseOnboarding.complete.title')).toBeTruthy();
    expect(getByText('postPurchaseOnboarding.complete.description')).toBeTruthy();
    expect(getByText('postPurchaseOnboarding.complete.cta')).toBeTruthy();
  });

  it('CTA タップで onFinish が呼ばれる', () => {
    const onFinish = jest.fn();
    const { getByText } = render(<CompleteStep onFinish={onFinish} />);

    fireEvent.press(getByText('postPurchaseOnboarding.complete.cta'));

    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
