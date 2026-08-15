import { surveyValidator } from './surveyValidator';
import { firestoreClient } from '@/lib/survey/firestoreClient';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { trackEvent } from '@/lib/tracking/trackEvent';
import { surveyStorage } from '@/lib/storage/surveyStorage';
import { userStorage } from '@/lib/storage/userStorage';
import {
  ONBOARDING_SURVEY_QUESTIONS,
  FEEDBACK_SURVEY_QUESTIONS,
} from '@/constants/survey';
import type { SurveyResponse } from '@/types/survey';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

async function buildResponse(answers: Record<string, string>): Promise<SurveyResponse> {
  const user = await userStorage.get();
  return {
    userId: user?.id ?? 'unknown',
    responses: answers,
    completedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    platform: Platform.OS as 'ios' | 'android',
  };
}

export const surveyService = {
  /** Feedback survey, reached from the 3-day-old prompt. */
  async submitSurvey(answers: Record<string, string>): Promise<void> {
    const validation = surveyValidator.validate(answers, FEEDBACK_SURVEY_QUESTIONS);
    if (!validation.ok) {
      throw new Error(validation.error);
    }

    const answeredCount = Object.keys(answers).filter(
      (key) => answers[key] && answers[key].trim() !== ''
    ).length;

    const response = await buildResponse(answers);

    await firestoreClient.submitSurvey(response);
    await surveyStorage.markCompleted();
    // free_text is deliberately excluded: free-form user text stays in
    // Firestore only and must never reach Analytics.
    trackEvent('survey_completed', {
      question_count: answeredCount,
      perceived_change: answers.perceived_change,
    });
  },

  /**
   * Onboarding survey, asked at the very start of onboarding. The answers are
   * mirrored into Analytics (event params + user properties) so acquisition
   * channel is usable as a GA4 reporting dimension, not just a Firestore row.
   */
  async submitOnboardingSurvey(answers: Record<string, string>): Promise<void> {
    const validation = surveyValidator.validate(answers, ONBOARDING_SURVEY_QUESTIONS);
    if (!validation.ok) {
      throw new Error(validation.error);
    }

    const response = await buildResponse(answers);

    await firestoreClient.submitSurvey(response);

    const params = {
      discovery_channel: answers.discovery_channel,
      age_range: answers.age_range,
      motivation: answers.motivation,
    };

    trackEvent('onboarding_survey_completed', params);
    await analyticsClient.setUserProperties(params);
  },
};
