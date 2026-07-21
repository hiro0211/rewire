const mockSubmitSurvey = jest.fn();
const mockLogEvent = jest.fn();
const mockSetUserProperties = jest.fn();
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
    setUserProperties: (...args: any[]) => mockSetUserProperties(...args),
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

  describe('submitSurvey（3日後プロンプトのフィードバック回答）', () => {
    const validAnswers: Record<string, string> = {
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
        questionCount: 1,
        perceived_change: 'slight',
      });
    });

    it('自由記述(free_text)はAnalyticsに送らずFirestoreにのみ残す', async () => {
      const withText = { ...validAnswers, free_text: 'テストコメント' };
      await surveyService.submitSurvey(withText);

      const submittedData = mockSubmitSurvey.mock.calls[0][0];
      expect(submittedData.responses.free_text).toBe('テストコメント');

      const eventParams = mockLogEvent.mock.calls[0][1];
      expect(eventParams.free_text).toBeUndefined();
      expect(JSON.stringify(eventParams)).not.toContain('テストコメント');
    });

    it('オンボーディング質問が未回答でも送信できる', async () => {
      await expect(surveyService.submitSurvey(validAnswers)).resolves.toBeUndefined();
      expect(mockSubmitSurvey).toHaveBeenCalledTimes(1);
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
  });

  describe('submitOnboardingSurvey（オンボーディング冒頭の回答）', () => {
    const onboardingAnswers: Record<string, string> = {
      age_range: '25-34',
      discovery_channel: 'tiktok',
      motivation: 'self_control',
    };

    it('既存のドキュメント形状のままFirestoreへ書き込む', async () => {
      await surveyService.submitOnboardingSurvey(onboardingAnswers);

      expect(mockSubmitSurvey).toHaveBeenCalledTimes(1);
      const submittedData = mockSubmitSurvey.mock.calls[0][0];
      expect(submittedData.userId).toBe('user-1');
      expect(submittedData.responses).toEqual(onboardingAnswers);
      expect(submittedData.platform).toBe('ios');
      expect(typeof submittedData.completedAt).toBe('string');
      expect(typeof submittedData.appVersion).toBe('string');
    });

    it('回答をイベントパラメータとしてAnalyticsに送る', async () => {
      await surveyService.submitOnboardingSurvey(onboardingAnswers);

      expect(mockLogEvent).toHaveBeenCalledWith('onboarding_survey_completed', {
        discovery_channel: 'tiktok',
        age_range: '25-34',
        motivation: 'self_control',
      });
    });

    it('回答をユーザープロパティとして設定する', async () => {
      await surveyService.submitOnboardingSurvey(onboardingAnswers);

      expect(mockSetUserProperties).toHaveBeenCalledWith({
        discovery_channel: 'tiktok',
        age_range: '25-34',
        motivation: 'self_control',
      });
    });

    it('ユーザープロパティ名はFirebaseの命名規則を満たす', async () => {
      await surveyService.submitOnboardingSurvey(onboardingAnswers);

      const names = Object.keys(mockSetUserProperties.mock.calls[0][0]);
      names.forEach((name) => {
        expect(name.length).toBeLessThanOrEqual(24);
        expect(name).toMatch(/^[a-z][a-z0-9_]*$/);
        expect(name.startsWith('firebase_')).toBe(false);
        expect(name.startsWith('google_')).toBe(false);
        expect(name.startsWith('ga_')).toBe(false);
      });
    });

    it('オンボーディング必須質問が欠けていればthrowし、送信しない', async () => {
      const { motivation, ...incomplete } = onboardingAnswers;
      await expect(surveyService.submitOnboardingSurvey(incomplete)).rejects.toThrow();
      expect(mockSubmitSurvey).not.toHaveBeenCalled();
      expect(mockLogEvent).not.toHaveBeenCalled();
      expect(mockSetUserProperties).not.toHaveBeenCalled();
    });

    it('フィードバック質問が未回答でもthrowしない', async () => {
      await expect(
        surveyService.submitOnboardingSurvey(onboardingAnswers)
      ).resolves.toBeUndefined();
    });

    it('3日後プロンプトの完了フラグは立てない', async () => {
      await surveyService.submitOnboardingSurvey(onboardingAnswers);
      expect(mockMarkCompleted).not.toHaveBeenCalled();
    });

    it('ユーザーが未取得の場合はunknownをuserIdに設定する', async () => {
      mockGet.mockResolvedValue(null);
      await surveyService.submitOnboardingSurvey(onboardingAnswers);

      expect(mockSubmitSurvey.mock.calls[0][0].userId).toBe('unknown');
    });
  });
});
