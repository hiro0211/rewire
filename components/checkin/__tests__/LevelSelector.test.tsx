import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LevelSelector } from '../LevelSelector';

// useTheme mock
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#E8E8ED',
      textSecondary: '#6B6B7B',
      primary: '#4A90D9',
      contrastText: '#FFFFFF',
      surfaceHighlight: '#1F1F2C',
    },
  }),
}));

// Haptics mock
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
}));

const DEFAULT_OPTIONS = [
  { value: 0, label: 'なし' },
  { value: 1, label: '低い' },
  { value: 2, label: '中程度' },
  { value: 3, label: '高い' },
  { value: 4, label: '非常に高い' },
];

describe('LevelSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ラベルが表示される', () => {
    const { getByText } = render(
      <LevelSelector
        label="ストレスレベル"
        value={0}
        onChange={mockOnChange}
        options={DEFAULT_OPTIONS}
      />
    );
    expect(getByText('ストレスレベル')).toBeTruthy();
  });

  it('全てのオプションボタンが表示される', () => {
    const { getByText } = render(
      <LevelSelector
        label="ストレスレベル"
        value={0}
        onChange={mockOnChange}
        options={DEFAULT_OPTIONS}
      />
    );
    DEFAULT_OPTIONS.forEach((option) => {
      expect(getByText(option.label)).toBeTruthy();
    });
  });

  it('ボタンを押すとonChangeが呼ばれる', () => {
    const { getByText } = render(
      <LevelSelector
        label="ストレスレベル"
        value={0}
        onChange={mockOnChange}
        options={DEFAULT_OPTIONS}
      />
    );
    fireEvent.press(getByText('高い'));
    expect(mockOnChange).toHaveBeenCalledWith(3);
  });

  it('異なるボタンを押すと対応する値でonChangeが呼ばれる', () => {
    const { getByText } = render(
      <LevelSelector
        label="ストレスレベル"
        value={0}
        onChange={mockOnChange}
        options={DEFAULT_OPTIONS}
      />
    );
    fireEvent.press(getByText('なし'));
    expect(mockOnChange).toHaveBeenCalledWith(0);

    fireEvent.press(getByText('非常に高い'));
    expect(mockOnChange).toHaveBeenCalledWith(4);
  });

  it('1-5の範囲のオプションでも正しく動作する', () => {
    const qualityOptions = [
      { value: 1, label: '悪い' },
      { value: 2, label: 'やや悪い' },
      { value: 3, label: '普通' },
      { value: 4, label: 'やや良い' },
      { value: 5, label: '良い' },
    ];

    const { getByText } = render(
      <LevelSelector
        label="生活の質"
        value={3}
        onChange={mockOnChange}
        options={qualityOptions}
      />
    );
    fireEvent.press(getByText('良い'));
    expect(mockOnChange).toHaveBeenCalledWith(5);
  });

  it('ボタン押下時にHapticsが呼ばれる', () => {
    const Haptics = require('expo-haptics');
    const { getByText } = render(
      <LevelSelector
        label="ストレスレベル"
        value={0}
        onChange={mockOnChange}
        options={DEFAULT_OPTIONS}
      />
    );
    fireEvent.press(getByText('中程度'));
    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });
});
