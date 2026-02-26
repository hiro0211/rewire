import React from 'react';
import { render, act } from '@testing-library/react-native';
import { AnalyzingStep } from '../AnalyzingStep';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Error: 'error' },
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Svg: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Circle: (props: any) => <View {...props} />,
  };
});

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, testID, ...props }: any) => (
      <View testID={testID} {...props}>{children}</View>
    ),
  };
});

describe('AnalyzingStep', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('testID="circular-progress-ring" が存在する', () => {
    const { getByTestId } = render(<AnalyzingStep onComplete={jest.fn()} />);
    expect(getByTestId('circular-progress-ring')).toBeTruthy();
  });

  it('testID="progress-percentage" が存在し "0%" テキストを含む', () => {
    const { getByTestId, getByText } = render(<AnalyzingStep onComplete={jest.fn()} />);
    expect(getByTestId('progress-percentage')).toBeTruthy();
    expect(getByText('0%')).toBeTruthy();
  });

  it('"分析中" テキストが表示される', () => {
    const { getByText } = render(<AnalyzingStep onComplete={jest.fn()} />);
    expect(getByText(/分析中/)).toBeTruthy();
  });

  it('分析ステップの説明テキストが表示される', () => {
    const { getByText } = render(<AnalyzingStep onComplete={jest.fn()} />);
    // Advance to let first item's fade animation start
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(getByText(/回答データを集計/)).toBeTruthy();
  });

  it('onComplete が分析完了後に呼ばれる', () => {
    const onComplete = jest.fn();
    render(<AnalyzingStep onComplete={onComplete} />);
    // Total duration = 2000+2000+1500+1500 = 7000 + 500 padding
    act(() => {
      jest.advanceTimersByTime(8000);
    });
    expect(onComplete).toHaveBeenCalled();
  });

  it('クラッシュしない', () => {
    expect(() =>
      render(<AnalyzingStep onComplete={jest.fn()} />)
    ).not.toThrow();
  });
});
