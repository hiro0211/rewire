import React from 'react';
import { render } from '@testing-library/react-native';
import { AssessmentPickerStep } from '../AssessmentPickerStep';
import type { AssessmentQuestion } from '@/constants/assessment';

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const Picker = ({ children, selectedValue, onValueChange }: any) => (
    <View testID="picker">
      {React.Children.map(children, (child: any) =>
        React.cloneElement(child, {
          onPress: () => onValueChange(child.props.value),
        })
      )}
    </View>
  );
  Picker.Item = ({ label, value, onPress }: any) => (
    <Text onPress={onPress}>{label}</Text>
  );
  return { Picker };
});

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja' as const,
    isJapanese: true,
  }),
}));

const MOCK_QUESTION: AssessmentQuestion = {
  id: 'currentAge',
  questionKey: 'mock.currentAge.question',
  type: 'picker',
  pickerRange: { min: 11, max: 60, suffixKey: 'mock.suffix.years' },
};

describe('AssessmentPickerStep', () => {
  const defaultProps = {
    question: MOCK_QUESTION,
    questionIndex: 1,
    totalQuestions: 9,
    selectedValue: undefined as string | undefined,
    onSelect: jest.fn(),
  };

  it('質問番号が "Question #" フォーマットで表示される', () => {
    const { getByText } = render(<AssessmentPickerStep {...defaultProps} />);
    expect(getByText('Question #2')).toBeTruthy();
  });

  it('testID="question-heading" が存在する', () => {
    const { getByTestId } = render(<AssessmentPickerStep {...defaultProps} />);
    expect(getByTestId('question-heading')).toBeTruthy();
  });

  it('質問テキストが表示される', () => {
    const { getByText } = render(<AssessmentPickerStep {...defaultProps} />);
    expect(getByText('mock.currentAge.question')).toBeTruthy();
  });

  it('ピッカーが表示される', () => {
    const { getByTestId } = render(<AssessmentPickerStep {...defaultProps} />);
    expect(getByTestId('picker')).toBeTruthy();
  });

  it('クラッシュしない', () => {
    expect(() => render(<AssessmentPickerStep {...defaultProps} />)).not.toThrow();
  });

  // Picker は mount 時に onValueChange を発火しないため、表示中のデフォルト値が
  // 回答として登録されず「次へ」が押せなくなる不具合を防ぐ。
  it('マウント時に未回答なら表示中のデフォルト値(25)を onSelect で登録する', () => {
    const onSelect = jest.fn();
    render(
      <AssessmentPickerStep {...defaultProps} selectedValue={undefined} onSelect={onSelect} />,
    );
    expect(onSelect).toHaveBeenCalledWith('25');
  });

  it('既に回答がある場合はマウント時に上書きしない', () => {
    const onSelect = jest.fn();
    render(
      <AssessmentPickerStep {...defaultProps} selectedValue="30" onSelect={onSelect} />,
    );
    expect(onSelect).not.toHaveBeenCalled();
  });
});
