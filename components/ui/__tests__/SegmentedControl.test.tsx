import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SegmentedControl } from '../SegmentedControl';

const mockSelectionAsync = jest.fn();
jest.mock('expo-haptics', () => ({
  selectionAsync: (...args: any[]) => mockSelectionAsync(...args),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

const mockUseTheme = jest.fn();
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => mockUseTheme(),
}));

const darkTheme = {
  colors: {
    surfaceHighlight: '#1F1F2C',
    surface: '#16161E',
    text: '#E8E8ED',
    textSecondary: '#6B6B7B',
  },
  isDark: true,
};

const lightTheme = {
  colors: {
    surfaceHighlight: '#EEEEF0',
    surface: '#FFFFFF',
    text: '#1A1A1F',
    textSecondary: '#6B6B7B',
  },
  isDark: false,
};

describe('SegmentedControl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.mockReturnValue(darkTheme);
  });

  it('全セグメントのテキストが表示される', () => {
    const { getByText } = render(
      <SegmentedControl
        segments={['日', '週']}
        selectedIndex={0}
        onChange={jest.fn()}
      />
    );
    expect(getByText('日')).toBeTruthy();
    expect(getByText('週')).toBeTruthy();
  });

  it('セグメントタップ時にonChangeが正しいインデックスで呼ばれる', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <SegmentedControl
        segments={['日', '週']}
        selectedIndex={0}
        onChange={onChange}
      />
    );
    fireEvent.press(getByText('週'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('セグメントタップ時にハプティクス(selectionAsync)が呼ばれる', () => {
    const { getByText } = render(
      <SegmentedControl
        segments={['日', '週']}
        selectedIndex={0}
        onChange={jest.fn()}
      />
    );
    fireEvent.press(getByText('週'));
    expect(mockSelectionAsync).toHaveBeenCalled();
  });

  it('3つ以上のセグメントが正しく表示される', () => {
    const { getByText } = render(
      <SegmentedControl
        segments={['日', '週', '月']}
        selectedIndex={0}
        onChange={jest.fn()}
      />
    );
    expect(getByText('日')).toBeTruthy();
    expect(getByText('週')).toBeTruthy();
    expect(getByText('月')).toBeTruthy();
  });

  it('ダークモードで非選択テキストにtextSecondaryカラーが適用される', () => {
    mockUseTheme.mockReturnValue(darkTheme);
    const { getByText } = render(
      <SegmentedControl
        segments={['日', '週']}
        selectedIndex={0}
        onChange={jest.fn()}
      />
    );
    const unselectedText = getByText('週');
    const flatStyle = Array.isArray(unselectedText.props.style)
      ? Object.assign({}, ...unselectedText.props.style)
      : unselectedText.props.style;
    expect(flatStyle.color).toBe('#6B6B7B');
  });

  it('ライトモードで選択テキストにtextカラーが適用される', () => {
    mockUseTheme.mockReturnValue(lightTheme);
    const { getByText } = render(
      <SegmentedControl
        segments={['日', '週']}
        selectedIndex={0}
        onChange={jest.fn()}
      />
    );
    const selectedText = getByText('日');
    const flatStyle = Array.isArray(selectedText.props.style)
      ? Object.assign({}, ...selectedText.props.style)
      : selectedText.props.style;
    expect(flatStyle.color).toBe('#1A1A1F');
  });
});
