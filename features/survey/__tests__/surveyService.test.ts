const mockSubmitSurvey = jest.fn();
const mockLogEvent = jest.fn();
const mockMarkCompleted = jest.fn();
const mockGet = jest.fn();

jest.mock('@/lib/survey/firestoreClient', () => ({
  firestoreClient: {
    submitSurvey: (...args: any[]) => mockSubmitSurvey(...args),
  },
}));

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: (...args: any[]) => mockLogEvent(...args),
  },
}));

jest.mock('@/lib/storage/surveyStorage', () => ({
  surveyStorage: {
    markCompleted: (...args: any[]) => mockMarkCompleted(...args),
  },
}));

jest.mock('@/lib/storage/userStorage', () => ({
  userStorage: {
    get: (...args: any[]) => mockGet(...args),
  },
}));

import { surveyService } from '../surveyService';

describe('surveyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ id: 'user-1' });
  });

  describe('submitSurvey', () => {
    const validAnswers: Record<string, string> = {
      age_range: '25-34',
      discovery_channel: 'sns',
      motivation: 'self_control',
      perceived_change: 'slight',
    };

    it('Firestoreに送信し、ローカルに完了記録し、Analyticsイベントを送る', async () => {
      await surveyService.submitSurvey(validAnswers);

      expect(mockSubmitSurvey).toHaveBeenCalledTimes(1);
      const submittedData = mockSubmitSurvey.mock.calls[0][0];
      expect(submittedData.userId).toBe('user-1');
      expect(submittedData.responses).toEqual(validAnswers);
      expect(submittedData.platform).toBe('ios');

      expect(mockMarkCompleted).toHaveBeenCalledTimes(1);
      expect(mockLogEvent).toHaveBeenCalledWith('survey_completed', {
        questionCount: 4,
      });
    });

    it('バリデーションエラー時はエラーをthrowする', async () => {
      await expect(surveyService.submitSurvey({})).rejects.toThrow();
      expect(mockSubmitSurvey).not.toHaveBeenCalled();
      expect(mockMarkCompleted).not.toHaveBeenCalled();
    });

    it('ユーザーが未取得の場合はunknownをuserIdに設定する', async () => {
      mockGet.mockResolvedValue(null);
      await surveyService.submitSurvey(validAnswers);

      const submittedData = mockSubmitSurvey.mock.calls[0][0];
      expect(submittedData.userId).toBe('unknown');
    });

    it('free_textが含まれる場合もresponsesに含める', async () => {
      const withText = { ...validAnswers, free_text: 'テストコメント' };
      await surveyService.submitSurvey(withText);

      const submittedData = mockSubmitSurvey.mock.calls[0][0];
      expect(submittedData.responses.free_text).toBe('テストコメント');
    });
  });
});
