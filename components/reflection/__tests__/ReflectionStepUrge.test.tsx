import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReflectionStepUrge } from '../ReflectionStepUrge';

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

describe('ReflectionStepUrge', () => {
  it('タイトルと5段階のレベルボタンが表示される', () => {
    const { getByText, getByTestId } = render(
      <ReflectionStepUrge onSelect={jest.fn()} isSubmitting={false} />
    );

    expect(getByText('reflection.step2.title')).toBeTruthy();
    [0, 1, 2, 3, 4].forEach((v) => {
      expect(getByTestId(`reflection-urge-${v}`)).toBeTruthy();
    });
  });

  it('各ボタンを押すと対応する level で onSelect が呼ばれる', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <ReflectionStepUrge onSelect={onSelect} isSubmitting={false} />
    );

    fireEvent.press(getByTestId('reflection-urge-2'));

    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it('isSubmitting=true のときはタップしても onSelect が呼ばれない', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <ReflectionStepUrge onSelect={onSelect} isSubmitting={true} />
    );

    fireEvent.press(getByTestId('reflection-urge-2'));

    expect(onSelect).not.toHaveBeenCalled();
  });
});
