import React from 'react';
import { render } from '@testing-library/react-native';
import { EducationSlideStep } from '../EducationSlideStep';
import type { EducationSlide } from '@/constants/education';

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja' as const,
    isJapanese: true,
  }),
}));

const MOCK_SLIDE: EducationSlide = {
  id: 'dopamine_trap',
  titleKey: 'mock.slide.title',
  bodyKey: 'mock.slide.body',
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
    expect(getByText('mock.slide.title')).toBeTruthy();
  });

  it('本文テキストが表示される', () => {
    const { getByText } = render(<EducationSlideStep {...defaultProps} />);
    expect(getByText('mock.slide.body')).toBeTruthy();
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
