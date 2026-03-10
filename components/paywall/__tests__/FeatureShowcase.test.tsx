import React from 'react';
import { render } from '@testing-library/react-native';

import { FeatureShowcase } from '../FeatureShowcase';

const mockFeatures = [
  { emoji: '🛡️', title: 'SNSフリクション', description: 'SNSを開く瞬間に介入' },
  { emoji: '🔒', title: 'ブロッカー', description: 'アダルトコンテンツをブロック' },
];

describe('FeatureShowcase', () => {
  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<FeatureShowcase features={mockFeatures} />)).not.toThrow();
  });

  it('セクションタイトルが表示される', () => {
    const { getByText } = render(<FeatureShowcase features={mockFeatures} />);
    expect(getByText(/Rewireの仕組み/)).toBeTruthy();
  });

  it('各機能のタイトルが表示される', () => {
    const { getByText } = render(<FeatureShowcase features={mockFeatures} />);
    expect(getByText('SNSフリクション')).toBeTruthy();
    expect(getByText('ブロッカー')).toBeTruthy();
  });

  it('各機能の説明が表示される', () => {
    const { getByText } = render(<FeatureShowcase features={mockFeatures} />);
    expect(getByText('SNSを開く瞬間に介入')).toBeTruthy();
  });

  it('ウィジェット対応カードが表示される', () => {
    const { FEATURE_ITEMS } = require('../../../constants/preBenefits');
    const { getByText } = render(<FeatureShowcase features={FEATURE_ITEMS} />);
    expect(getByText('ウィジェット対応')).toBeTruthy();
    expect(getByText('アプリを開かずホーム画面で経過時間をチェック')).toBeTruthy();
  });
});
