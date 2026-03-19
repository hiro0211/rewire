import { renderHook, act } from '@testing-library/react-native';
import { useSurveyForm } from '../useSurveyForm';

describe('useSurveyForm', () => {
  it('初期状態は空のanswersを持つ', () => {
    const { result } = renderHook(() => useSurveyForm());
    expect(result.current.answers).toEqual({});
  });

  it('setAnswerで回答を設定できる', () => {
    const { result } = renderHook(() => useSurveyForm());
    act(() => {
      result.current.setAnswer('age_range', '25-34');
    });
    expect(result.current.answers).toEqual({ age_range: '25-34' });
  });

  it('複数の回答を設定できる', () => {
    const { result } = renderHook(() => useSurveyForm());
    act(() => {
      result.current.setAnswer('age_range', '25-34');
    });
    act(() => {
      result.current.setAnswer('motivation', 'self_control');
    });
    expect(result.current.answers).toEqual({
      age_range: '25-34',
      motivation: 'self_control',
    });
  });

  it('同じ質問の回答を上書きできる', () => {
    const { result } = renderHook(() => useSurveyForm());
    act(() => {
      result.current.setAnswer('age_range', '25-34');
    });
    act(() => {
      result.current.setAnswer('age_range', '35-44');
    });
    expect(result.current.answers.age_range).toBe('35-44');
  });
});
