import React from 'react';
import { render, act } from '@testing-library/react-native';
import { BreathingTimer } from '../BreathingTimer';

describe('BreathingTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('初期表示では 00:00 を表示する', () => {
    const { getByText } = render(<BreathingTimer phase="idle" cycleCount={0} />);
    expect(getByText('00:00')).toBeTruthy();
  });

  it('サイクル進捗を "0 / 3" 形式で表示する', () => {
    const { getByText } = render(<BreathingTimer phase="inhale" cycleCount={0} />);
    expect(getByText('0 / 3')).toBeTruthy();
  });

  it('cycleCount=2 のときサイクル進捗が "2 / 3" になる', () => {
    const { getByText } = render(<BreathingTimer phase="exhale" cycleCount={2} />);
    expect(getByText('2 / 3')).toBeTruthy();
  });

  it('phase が active なら1秒後にタイマーが 00:01 になる', () => {
    const { getByText } = render(<BreathingTimer phase="inhale" cycleCount={0} />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByText('00:01')).toBeTruthy();
  });

  it('phase が idle のときはタイマーが進まない', () => {
    const { getByText } = render(<BreathingTimer phase="idle" cycleCount={0} />);
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(getByText('00:00')).toBeTruthy();
  });

  it('phase が complete のときはタイマーが進まない', () => {
    const { getByText, rerender } = render(
      <BreathingTimer phase="inhale" cycleCount={0} />,
    );
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    rerender(<BreathingTimer phase="complete" cycleCount={3} />);
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(getByText('00:03')).toBeTruthy();
  });
});
