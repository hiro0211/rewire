const mockIsCompleted = jest.fn();

jest.mock('@/lib/storage/surveyStorage', () => ({
  surveyStorage: {
    isCompleted: (...args: any[]) => mockIsCompleted(...args),
  },
}));

import { renderHook, waitFor } from '@testing-library/react-native';
import { useSurveyCompleted } from '../useSurveyCompleted';

describe('useSurveyCompleted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('アンケート未回答 → false', async () => {
    mockIsCompleted.mockResolvedValue(false);

    const { result } = renderHook(() => useSurveyCompleted());

    await waitFor(() => {
      expect(result.current.isSurveyCompleted).toBe(false);
    });
  });

  it('アンケート回答済み → true', async () => {
    mockIsCompleted.mockResolvedValue(true);

    const { result } = renderHook(() => useSurveyCompleted());

    await waitFor(() => {
      expect(result.current.isSurveyCompleted).toBe(true);
    });
  });
});
