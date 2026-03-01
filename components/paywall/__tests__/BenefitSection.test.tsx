import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: (props: any) => <View {...props} /> };
});

import { BenefitSection } from '../BenefitSection';

const mockSection = {
  id: 'test',
  title: 'テストセクション',
  emoji: '🧠',
  benefits: [
    { emoji: '🔄', bold: 'ドーパミン', text: 'をリセット' },
    { emoji: '🎯', bold: '集中力', text: 'を回復' },
  ],
};

describe('BenefitSection', () => {
  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<BenefitSection section={mockSection} />)).not.toThrow();
  });

  it('セクションタイトルが表示される', () => {
    const { getByText } = render(<BenefitSection section={mockSection} />);
    expect(getByText('テストセクション')).toBeTruthy();
  });

  it('ベネフィットのboldテキストが表示される', () => {
    const { getByText } = render(<BenefitSection section={mockSection} />);
    expect(getByText(/ドーパミン/)).toBeTruthy();
    expect(getByText(/集中力/)).toBeTruthy();
  });

  it('ベネフィットの通常テキストが表示される', () => {
    const { getByText } = render(<BenefitSection section={mockSection} />);
    expect(getByText(/をリセット/)).toBeTruthy();
  });
});
