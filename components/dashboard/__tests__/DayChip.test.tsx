import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { DayChip } from '../DayChip';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      pillBackground: 'rgba(255, 255, 255, 0.05)',
      pillBorder: 'rgba(255, 255, 255, 0.12)',
      text: '#E8E8ED',
    },
  }),
}));

describe('DayChip', () => {
  it('day=0 のとき正しくレンダリングされる', () => {
    render(<DayChip day={0} />);
    expect(screen.getByTestId('day-chip')).toBeTruthy();
    expect(screen.getByText(/Day 0/)).toBeTruthy();
  });

  it('day=1 のとき正しくレンダリングされる', () => {
    render(<DayChip day={1} />);
    expect(screen.getByText(/Day 1/)).toBeTruthy();
  });

  it('day=365 のとき正しくレンダリングされる', () => {
    render(<DayChip day={365} />);
    expect(screen.getByText(/Day 365/)).toBeTruthy();
  });

  it('🌙 絵文字が表示される', () => {
    render(<DayChip day={10} />);
    expect(screen.getByText(/🌙/)).toBeTruthy();
  });
});
