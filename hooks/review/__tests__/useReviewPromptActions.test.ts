const mockRecordPromptShown = jest.fn();
const mockRecordDismissal = jest.fn();
const mockRecordPositiveReview = jest.fn();
const mockLogEvent = jest.fn();
const mockOpenURL = jest.fn();

jest.mock('@/lib/storage/reviewPromptStorage', () => ({
  reviewPromptStorage: {
    recordPromptShown: (...args: any[]) => mockRecordPromptShown(...args),
    recordDismissal: (...args: any[]) => mockRecordDismissal(...args),
    recordPositiveReview: (...args: any[]) => mockRecordPositiveReview(...args),
  },
}));

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: (...args: any[]) => mockLogEvent(...args),
  },
}));

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Linking.openURL = (...args: any[]) => mockOpenURL(...args);
  return rn;
});

import { renderHook, act } from '@testing-library/react-native';
import { useReviewPromptActions } from '../useReviewPromptActions';

describe('useReviewPromptActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRecordPromptShown.mockResolvedValue(undefined);
    mockRecordDismissal.mockResolvedValue(undefined);
    mockRecordPositiveReview.mockResolvedValue(undefined);
    mockLogEvent.mockResolvedValue(undefined);
    mockOpenURL.mockResolvedValue(undefined);
  });

  describe('handleRate — 高評価（4〜5星）', () => {
    it('review_prompt_rated イベントを送信する', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useReviewPromptActions(onHide));

      await act(async () => {
        await result.current.handleRate(5);
      });

      expect(mockLogEvent).toHaveBeenCalledWith('review_prompt_rated', { stars: 5 });
    });

    it('recordPositiveReviewを呼ぶ', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useReviewPromptActions(onHide));

      await act(async () => {
        await result.current.handleRate(4);
      });

      expect(mockRecordPositiveReview).toHaveBeenCalledTimes(1);
    });

    it('onHideコールバックを呼ぶ', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useReviewPromptActions(onHide));

      await act(async () => {
        await result.current.handleRate(5);
      });

      expect(onHide).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleRate — 低評価（1〜3星）', () => {
    it('review_prompt_rated イベントを送信する', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useReviewPromptActions(onHide));

      await act(async () => {
        await result.current.handleRate(2);
      });

      expect(mockLogEvent).toHaveBeenCalledWith('review_prompt_rated', { stars: 2 });
    });

    it('recordPromptShownを呼ぶ', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useReviewPromptActions(onHide));

      await act(async () => {
        await result.current.handleRate(2);
      });

      expect(mockRecordPromptShown).toHaveBeenCalledTimes(1);
    });

    it('showFeedbackがtrueになる', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useReviewPromptActions(onHide));

      await act(async () => {
        await result.current.handleRate(2);
      });

      expect(result.current.showFeedback).toBe(true);
    });

    it('onHideを呼ばない', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useReviewPromptActions(onHide));

      await act(async () => {
        await result.current.handleRate(2);
      });

      expect(onHide).not.toHaveBeenCalled();
    });
  });

  describe('handleFeedbackTap', () => {
    it('review_prompt_feedback_tapped イベントを送信する', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useReviewPromptActions(onHide));

      await act(async () => {
        await result.current.handleFeedbackTap();
      });

      expect(mockLogEvent).toHaveBeenCalledWith('review_prompt_feedback_tapped');
    });

    it('mailto URLを開く', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useReviewPromptActions(onHide));

      await act(async () => {
        await result.current.handleFeedbackTap();
      });

      expect(mockOpenURL).toHaveBeenCalledWith(
        expect.stringContaining('mailto:arimurahiroaki40@gmail.com')
      );
    });

    it('onHideコールバックを呼ぶ', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useReviewPromptActions(onHide));

      await act(async () => {
        await result.current.handleFeedbackTap();
      });

      expect(onHide).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleDismiss', () => {
    it('recordDismissalを呼ぶ', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useReviewPromptActions(onHide));

      await act(async () => {
        await result.current.handleDismiss();
      });

      expect(mockRecordDismissal).toHaveBeenCalledTimes(1);
    });

    it('review_prompt_dismissed イベントを送信する', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useReviewPromptActions(onHide));

      await act(async () => {
        await result.current.handleDismiss();
      });

      expect(mockLogEvent).toHaveBeenCalledWith('review_prompt_dismissed');
    });

    it('onHideコールバックを呼ぶ', async () => {
      const onHide = jest.fn();
      const { result } = renderHook(() => useReviewPromptActions(onHide));

      await act(async () => {
        await result.current.handleDismiss();
      });

      expect(onHide).toHaveBeenCalledTimes(1);
    });
  });
});
