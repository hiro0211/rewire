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

const MOCK_QUESTION: AssessmentQuestion = {
  id: 'currentAge',
  question: '現在の年齢は？',
  type: 'picker',
  pickerRange: { min: 11, max: 60, suffix: '歳' },
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
    expect(getByText('現在の年齢は？')).toBeTruthy();
  });

  it('ピッカーが表示される', () => {
    const { getByTestId } = render(<AssessmentPickerStep {...defaultProps} />);
    expect(getByTestId('picker')).toBeTruthy();
  });

  it('クラッシュしない', () => {
    expect(() => render(<AssessmentPickerStep {...defaultProps} />)).not.toThrow();
  });
});
