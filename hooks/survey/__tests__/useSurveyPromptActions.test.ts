const mockRecordPromptShown = jest.fn();
const mockRecordDismissal = jest.fn();
const mockLogEvent = jest.fn();
const mockPush = jest.fn();

jest.mock('@/lib/storage/surveyPromptStorage', () => ({
  surveyPromptStorage: {
    recordPromptShown: (...args: any[]) => mockRecordPromptShown(...args),
    recordDismissal: (...args: any[]) => mockRecordDismissal(...args),
  },
}));

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: (...args: any[]) => mockLogEvent(...args),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/routing/routes', () => ({
  ROUTES: { survey: '/survey' },
}));

import { renderHook, act } from '@testing-library/react-native';
import { useSurveyPromptActions } from '../useSurveyPromptActions';

describe('useSurveyPromptActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRecordPromptShown.mockResolvedValue(undefined);
    mockRecordDismissal.mockResolvedValue(undefined);
    mockLogEvent.mockResolvedValue(undefined);
  });

  describe('handleAccept', () => {
    it('recordPromptShownを呼ぶ', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useSurveyPromptActions(onHide));

      await act(async () => {
        await result.current.handleAccept();
      });

      expect(mockRecordPromptShown).toHaveBeenCalledTimes(1);
    });

    it('analyticsイベントを送信する', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useSurveyPromptActions(onHide));

      await act(async () => {
        await result.current.handleAccept();
      });

      expect(mockLogEvent).toHaveBeenCalledWith('survey_prompt_accepted');
    });

    it('onHideコールバックを呼ぶ', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useSurveyPromptActions(onHide));

      await act(async () => {
        await result.current.handleAccept();
      });

      expect(onHide).toHaveBeenCalledTimes(1);
    });

    it('/surveyに遷移する', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useSurveyPromptActions(onHide));

      await act(async () => {
        await result.current.handleAccept();
      });

      expect(mockPush).toHaveBeenCalledWith('/survey');
    });
  });

  describe('handleDismiss', () => {
    it('recordDismissalを呼ぶ', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useSurveyPromptActions(onHide));

      await act(async () => {
        await result.current.handleDismiss();
      });

      expect(mockRecordDismissal).toHaveBeenCalledTimes(1);
    });

    it('analyticsイベントを送信する', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useSurveyPromptActions(onHide));

      await act(async () => {
        await result.current.handleDismiss();
      });

      expect(mockLogEvent).toHaveBeenCalledWith('survey_prompt_dismissed');
    });

    it('onHideコールバックを呼ぶ', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useSurveyPromptActions(onHide));

      await act(async () => {
        await result.current.handleDismiss();
      });

      expect(onHide).toHaveBeenCalledTimes(1);
    });

    it('/surveyに遷移しない', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useSurveyPromptActions(onHide));

      await act(async () => {
        await result.current.handleDismiss();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
