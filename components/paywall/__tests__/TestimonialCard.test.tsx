import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: (props: any) => <View {...props} /> };
});

import { TestimonialCard } from '../TestimonialCard';

describe('TestimonialCard', () => {
  const defaultProps = {
    quote: 'テスト証言テキスト',
    rating: 5,
    author: 'Anonymous',
  };

  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<TestimonialCard {...defaultProps} />)).not.toThrow();
  });

  it('証言テキストが表示される', () => {
    const { getByText } = render(<TestimonialCard {...defaultProps} />);
    expect(getByText(/テスト証言テキスト/)).toBeTruthy();
  });

  it('著者名が表示される', () => {
    const { getByText } = render(<TestimonialCard {...defaultProps} />);
    expect(getByText('Anonymous')).toBeTruthy();
  });

  it('星が表示される', () => {
    const { getByTestId } = render(<TestimonialCard {...defaultProps} />);
    expect(getByTestId('testimonial-stars')).toBeTruthy();
  });
});
