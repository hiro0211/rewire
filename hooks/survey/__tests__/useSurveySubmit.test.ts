const mockSubmitSurvey = jest.fn();

jest.mock('@/features/survey/surveyService', () => ({
  surveyService: {
    submitSurvey: (...args: any[]) => mockSubmitSurvey(...args),
  },
}));

import { renderHook, act } from '@testing-library/react-native';
import { useSurveySubmit } from '../useSurveySubmit';

describe('useSurveySubmit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態はisSubmitting=false, isComplete=false', () => {
    const { result } = renderHook(() => useSurveySubmit());
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('submit成功でisComplete=trueになる', async () => {
    mockSubmitSurvey.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSurveySubmit());

    await act(async () => {
      await result.current.submit({ age_range: '25-34' });
    });

    expect(result.current.isComplete).toBe(true);
    expect(result.current.isSubmitting).toBe(false);
    expect(mockSubmitSurvey).toHaveBeenCalledWith({ age_range: '25-34' });
  });

  it('submitエラー時にerrorが設定される', async () => {
    mockSubmitSurvey.mockRejectedValue(new Error('送信エラー'));
    const { result } = renderHook(() => useSurveySubmit());

    await act(async () => {
      await result.current.submit({});
    });

    expect(result.current.error).toBe('送信エラー');
    expect(result.current.isComplete).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });
});
