import React from 'react';
import { render } from '@testing-library/react-native';

import { ReviewCard } from '../ReviewCard';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#fff',
      textSecondary: '#aaa',
      textTertiary: '#666',
      surface: '#1a1a1a',
      border: '#333',
    },
  }),
}));

describe('ReviewCard', () => {
  const mockReview = {
    id: 'r1',
    stars: 5,
    body: 'ホーム画面に時間が出せるのが良い。',
    author: 'ラグーンマン',
  };

  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<ReviewCard review={mockReview} width={300} />)).not.toThrow();
  });

  it('本文が表示される', () => {
    const { getByText } = render(<ReviewCard review={mockReview} width={300} />);
    expect(getByText('ホーム画面に時間が出せるのが良い。')).toBeTruthy();
  });

  it('author が表示される', () => {
    const { getByText } = render(<ReviewCard review={mockReview} width={300} />);
    expect(getByText('ラグーンマン')).toBeTruthy();
  });

  it('stars の数だけ ★ を描画する (5個で "★★★★★")', () => {
    const { getByTestId } = render(<ReviewCard review={mockReview} width={300} />);
    expect(getByTestId('review-stars').props.children).toBe('★★★★★');
  });

  it('stars=3 なら "★★★" と描画する', () => {
    const { getByTestId } = render(
      <ReviewCard review={{ ...mockReview, stars: 3 }} width={300} />
    );
    expect(getByTestId('review-stars').props.children).toBe('★★★');
  });

  it('指定された width がカード幅に適用される', () => {
    const { getByTestId } = render(<ReviewCard review={mockReview} width={280} />);
    const card = getByTestId('review-card');
    const style = Array.isArray(card.props.style)
      ? Object.assign({}, ...card.props.style.flat().filter(Boolean))
      : card.props.style;
    expect(style.width).toBe(280);
  });
});
