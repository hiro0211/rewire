import React from 'react';
import { render, act } from '@testing-library/react-native';
import { CountdownTimer } from '../CountdownTimer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('初期値を MM:SS で表示する', () => {
    const { getByTestId } = render(<CountdownTimer initialSeconds={300} />);
    expect(getByTestId('countdown-timer').props.children).toBe('05:00');
  });

  it('1秒後にデクリメントされる', () => {
    const { getByTestId } = render(<CountdownTimer initialSeconds={300} />);
    act(() => { jest.advanceTimersByTime(1000); });
    expect(getByTestId('countdown-timer').props.children).toBe('04:59');
  });

  it('0で停止する', () => {
    const { getByTestId } = render(<CountdownTimer initialSeconds={2} />);
    act(() => { jest.advanceTimersByTime(3000); });
    expect(getByTestId('countdown-timer').props.children).toBe('00:00');
  });

  it('60秒未満のフォーマット', () => {
    const { getByTestId } = render(<CountdownTimer initialSeconds={45} />);
    expect(getByTestId('countdown-timer').props.children).toBe('00:45');
  });
});
