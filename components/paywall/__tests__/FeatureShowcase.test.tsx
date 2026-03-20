import React from 'react';
import { render } from '@testing-library/react-native';

import { FeatureShowcase } from '../FeatureShowcase';
import { t } from '@/locales/i18n';

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja' as const,
    isJapanese: true,
  }),
}));

const mockFeatures = [
  { emoji: '🛡️', titleKey: 'mock.feature.sns', descriptionKey: 'mock.feature.snsDesc' },
  { emoji: '🔒', titleKey: 'mock.feature.blocker', descriptionKey: 'mock.feature.blockerDesc' },
];

describe('FeatureShowcase', () => {
  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<FeatureShowcase features={mockFeatures} />)).not.toThrow();
  });

  it('セクションタイトルが表示される', () => {
    const { getByText } = render(<FeatureShowcase features={mockFeatures} />);
    expect(getByText('paywall.howItWorks')).toBeTruthy();
  });

  it('各機能のタイトルが表示される', () => {
    const { getByText } = render(<FeatureShowcase features={mockFeatures} />);
    expect(getByText('mock.feature.sns')).toBeTruthy();
    expect(getByText('mock.feature.blocker')).toBeTruthy();
  });

  it('各機能の説明が表示される', () => {
    const { getByText } = render(<FeatureShowcase features={mockFeatures} />);
    expect(getByText('mock.feature.snsDesc')).toBeTruthy();
  });

  it('ウィジェット対応カードが表示される', () => {
    const { FEATURE_ITEMS } = require('../../../constants/preBenefits');
    const { getByText } = render(<FeatureShowcase features={FEATURE_ITEMS} />);
    // With identity t mock, rendered text is the translation key
    expect(getByText('preBenefits.features.widget.title')).toBeTruthy();
    expect(getByText('preBenefits.features.widget.description')).toBeTruthy();
  });
});
