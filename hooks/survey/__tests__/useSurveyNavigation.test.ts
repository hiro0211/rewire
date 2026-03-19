import { renderHook, act } from '@testing-library/react-native';
import { useSurveyNavigation } from '../useSurveyNavigation';
import { SURVEY_QUESTIONS } from '@/constants/survey';

describe('useSurveyNavigation', () => {
  it('初期ステップは0', () => {
    const { result } = renderHook(() => useSurveyNavigation());
    expect(result.current.step).toBe(0);
  });

  it('currentQuestionが最初の質問を返す', () => {
    const { result } = renderHook(() => useSurveyNavigation());
    expect(result.current.currentQuestion).toEqual(SURVEY_QUESTIONS[0]);
  });

  it('goToNextStepでステップが進む', () => {
    const { result } = renderHook(() => useSurveyNavigation());
    act(() => {
      result.current.goToNextStep();
    });
    expect(result.current.step).toBe(1);
    expect(result.current.currentQuestion).toEqual(SURVEY_QUESTIONS[1]);
  });

  it('goToPreviousStepでステップが戻る', () => {
    const { result } = renderHook(() => useSurveyNavigation());
    act(() => {
      result.current.goToNextStep();
    });
    act(() => {
      result.current.goToPreviousStep();
    });
    expect(result.current.step).toBe(0);
  });

  it('最初のステップより前には戻れない', () => {
    const { result } = renderHook(() => useSurveyNavigation());
    act(() => {
      result.current.goToPreviousStep();
    });
    expect(result.current.step).toBe(0);
  });

  it('最後のステップでisLastStepがtrueになる', () => {
    const { result } = renderHook(() => useSurveyNavigation());
    for (let i = 0; i < SURVEY_QUESTIONS.length - 1; i++) {
      act(() => {
        result.current.goToNextStep();
      });
    }
    expect(result.current.isLastStep).toBe(true);
  });

  it('progressが正しく計算される', () => {
    const { result } = renderHook(() => useSurveyNavigation());
    expect(result.current.progress).toBe(0);
    act(() => {
      result.current.goToNextStep();
    });
    const expected = 1 / (SURVEY_QUESTIONS.length - 1);
    expect(result.current.progress).toBeCloseTo(expected);
  });
});
