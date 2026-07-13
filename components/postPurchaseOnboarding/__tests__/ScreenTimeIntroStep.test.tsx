import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#fff',
      textSecondary: '#aaa',
      surfaceHighlight: '#222',
      primary: '#8B5CF6',
      contrastText: '#fff',
    },
    gradients: { button: ['#8B5CF6', '#6D28D9'] },
    glow: { purple: '#8B5CF6' },
    shadows: { glowCard: {} },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ t: (k: string) => k }),
}));

import { ScreenTimeIntroStep } from '../ScreenTimeIntroStep';

describe('ScreenTimeIntroStep', () => {
  it('タイトルと説明が表示される', () => {
    const { getByText } = render(<ScreenTimeIntroStep onNext={jest.fn()} />);
    expect(getByText('postPurchaseOnboarding.screenTimeIntro.title')).toBeTruthy();
    expect(
      getByText('postPurchaseOnboarding.screenTimeIntro.description'),
    ).toBeTruthy();
  });

  it('CTA タップで onNext が呼ばれる', () => {
    const onNext = jest.fn();
    const { getByTestId } = render(<ScreenTimeIntroStep onNext={onNext} />);
    fireEvent.press(getByTestId('screen-time-intro-next'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
