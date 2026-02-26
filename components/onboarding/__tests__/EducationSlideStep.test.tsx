import React from 'react';
import { render } from '@testing-library/react-native';
import { EducationSlideStep } from '../EducationSlideStep';
import type { EducationSlide } from '@/constants/education';

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

const MOCK_SLIDE: EducationSlide = {
  id: 'dopamine_trap',
  title: 'テストタイトル',
  body: 'テスト本文テキスト',
  illustrationType: 'dopamine_bars',
};

describe('EducationSlideStep', () => {
  const defaultProps = {
    slide: MOCK_SLIDE,
    slideIndex: 1,
    totalSlides: 4,
  };

  it('testID="education-slide-container" が存在する', () => {
    const { getByTestId } = render(<EducationSlideStep {...defaultProps} />);
    expect(getByTestId('education-slide-container')).toBeTruthy();
  });

  it('タイトルテキストが表示される', () => {
    const { getByText } = render(<EducationSlideStep {...defaultProps} />);
    expect(getByText('テストタイトル')).toBeTruthy();
  });

  it('本文テキストが表示される', () => {
    const { getByText } = render(<EducationSlideStep {...defaultProps} />);
    expect(getByText('テスト本文テキスト')).toBeTruthy();
  });

  it('testID="page-dots" が存在する', () => {
    const { getByTestId } = render(<EducationSlideStep {...defaultProps} />);
    expect(getByTestId('page-dots')).toBeTruthy();
  });

  it('ページドット数が totalSlides と一致する', () => {
    const { getAllByTestId } = render(<EducationSlideStep {...defaultProps} />);
    const dots = getAllByTestId(/^page-dot-/);
    expect(dots.length).toBe(4);
  });

  it('現在のスライドのドットがアクティブ', () => {
    const { getByTestId } = render(<EducationSlideStep {...defaultProps} />);
    expect(getByTestId('page-dot-active-1')).toBeTruthy();
  });

  it('クラッシュしない', () => {
    expect(() => render(<EducationSlideStep {...defaultProps} />)).not.toThrow();
  });
});
