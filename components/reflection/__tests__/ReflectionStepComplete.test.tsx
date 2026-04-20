import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReflectionStepComplete } from '../ReflectionStepComplete';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#E8E8ED',
      textSecondary: '#6B6B7B',
      primary: '#8B5CF6',
      contrastText: '#FFFFFF',
      surface: '#0F0F15',
      surfaceHighlight: '#1F1F2C',
      danger: '#EF4444',
    },
    gradients: {
      button: ['#8B5CF6', '#6D28D9'],
      sos: ['#EF4444', '#991B1B'],
      glass: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'],
    },
    glow: { purple: 'rgba(139,92,246,0.3)', danger: 'rgba(239,68,68,0.3)' },
    shadows: { small: {}, medium: {}, glowCard: {}, sheet: {} },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja',
    isJapanese: true,
  }),
}));

describe('ReflectionStepComplete', () => {
  it('励ましタイトルと Finish ボタンが表示される', () => {
    const { getByText, getByTestId } = render(
      <ReflectionStepComplete onFinish={jest.fn()} />
    );

    expect(getByText('reflection.step3.title')).toBeTruthy();
    expect(getByTestId('reflection-finish')).toBeTruthy();
  });

  it('Finish ボタン押下で onFinish が呼ばれる', () => {
    const onFinish = jest.fn();
    const { getByTestId } = render(<ReflectionStepComplete onFinish={onFinish} />);

    fireEvent.press(getByTestId('reflection-finish'));

    expect(onFinish).toHaveBeenCalled();
  });
});
