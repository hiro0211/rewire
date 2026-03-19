import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SurveyCompletionStep } from '../SurveyCompletionStep';

describe('SurveyCompletionStep', () => {
  it('感謝メッセージが表示される', () => {
    const { getByText } = render(<SurveyCompletionStep onClose={jest.fn()} />);
    expect(getByText('ご協力ありがとうございました')).toBeTruthy();
  });

  it('閉じるボタンが表示される', () => {
    const { getByTestId } = render(<SurveyCompletionStep onClose={jest.fn()} />);
    expect(getByTestId('survey-close-button')).toBeTruthy();
  });

  it('閉じるボタンをタップするとonCloseが呼ばれる', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<SurveyCompletionStep onClose={onClose} />);
    fireEvent.press(getByTestId('survey-close-button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
