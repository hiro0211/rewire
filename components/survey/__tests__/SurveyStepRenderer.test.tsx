import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SurveyStepRenderer } from '../SurveyStepRenderer';
import { SURVEY_QUESTIONS } from '@/constants/survey';

describe('SurveyStepRenderer', () => {
  const defaultProps = {
    question: SURVEY_QUESTIONS[0],
    answers: {} as Record<string, string>,
    onSelectAnswer: jest.fn(),
  };

  it('choice タイプの質問でSurveyChoiceStepを描画する', () => {
    const { getByText } = render(<SurveyStepRenderer {...defaultProps} />);
    expect(getByText('あなたの年齢を教えてください')).toBeTruthy();
  });

  it('text_input タイプの質問でSurveyTextStepを描画する', () => {
    const textQuestion = SURVEY_QUESTIONS.find((q) => q.type === 'text_input')!;
    const { getByTestId } = render(
      <SurveyStepRenderer {...defaultProps} question={textQuestion} />
    );
    expect(getByTestId('survey-text-input')).toBeTruthy();
  });

  describe('otherTextId がある質問', () => {
    const motivationQuestion = SURVEY_QUESTIONS.find((q) => q.id === 'motivation')!;

    it('otherが選択されたときテキスト入力欄が表示される', () => {
      const { getByTestId } = render(
        <SurveyStepRenderer
          question={motivationQuestion}
          answers={{ motivation: 'other', motivation_other_text: '' }}
          onSelectAnswer={jest.fn()}
        />
      );
      expect(getByTestId('other-text-input')).toBeTruthy();
    });

    it('テキスト入力するとonSelectAnswerがotherTextIdで呼ばれる', () => {
      const onSelectAnswer = jest.fn();
      const { getByTestId } = render(
        <SurveyStepRenderer
          question={motivationQuestion}
          answers={{ motivation: 'other', motivation_other_text: '' }}
          onSelectAnswer={onSelectAnswer}
        />
      );
      fireEvent.changeText(getByTestId('other-text-input'), 'テスト入力');
      expect(onSelectAnswer).toHaveBeenCalledWith('motivation_other_text', 'テスト入力');
    });
  });
});
