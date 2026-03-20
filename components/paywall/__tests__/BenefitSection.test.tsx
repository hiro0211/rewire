import React from 'react';
import { render } from '@testing-library/react-native';

import { BenefitSection } from '../BenefitSection';

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja' as const,
    isJapanese: true,
  }),
}));

const mockSection = {
  id: 'test',
  titleKey: 'mock.section.title',
  emoji: '🧠',
  benefits: [
    { emoji: '🔄', boldKey: 'mock.benefit.dopamine', textKey: 'mock.benefit.reset' },
    { emoji: '🎯', boldKey: 'mock.benefit.focus', textKey: 'mock.benefit.recover' },
  ],
};

describe('BenefitSection', () => {
  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<BenefitSection section={mockSection} />)).not.toThrow();
  });

  it('セクションタイトルが表示される', () => {
    const { getByText } = render(<BenefitSection section={mockSection} />);
    expect(getByText('mock.section.title')).toBeTruthy();
  });

  it('ベネフィットのboldテキストが表示される', () => {
    const { getByText } = render(<BenefitSection section={mockSection} />);
    expect(getByText(/mock\.benefit\.dopamine/)).toBeTruthy();
    expect(getByText(/mock\.benefit\.focus/)).toBeTruthy();
  });

  it('ベネフィットの通常テキストが表示される', () => {
    const { getByText } = render(<BenefitSection section={mockSection} />);
    expect(getByText(/mock\.benefit\.reset/)).toBeTruthy();
  });
});
