import { surveyValidator } from './surveyValidator';
import { firestoreClient } from '@/lib/survey/firestoreClient';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { surveyStorage } from '@/lib/storage/surveyStorage';
import { userStorage } from '@/lib/storage/userStorage';
import type { SurveyResponse } from '@/types/survey';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export const surveyService = {
  async submitSurvey(answers: Record<string, string>): Promise<void> {
    const validation = surveyValidator.validate(answers);
    if (!validation.ok) {
      throw new Error(validation.error);
    }

    const user = await userStorage.get();
    const answeredCount = Object.keys(answers).filter(
      (key) => answers[key] && answers[key].trim() !== ''
    ).length;

    const response: SurveyResponse = {
      userId: user?.id ?? 'unknown',
      responses: answers,
      completedAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      platform: Platform.OS as 'ios' | 'android',
    };

    await firestoreClient.submitSurvey(response);
    await surveyStorage.markCompleted();
    await analyticsClient.logEvent('survey_completed', {
      questionCount: answeredCount,
    });
  },
};
