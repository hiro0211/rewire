import { surveyValidator } from './surveyValidator';
import { firestoreClient } from '@/lib/survey/firestoreClient';
import { promoFirestoreClient } from '@/lib/promo/promoFirestoreClient';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { surveyStorage } from '@/lib/storage/surveyStorage';
import { userStorage } from '@/lib/storage/userStorage';
import type { SurveyResponse } from '@/types/survey';
import { Platform } from 'react-native';

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
      appVersion: '1.0.0',
      platform: Platform.OS as 'ios' | 'android',
    };

    await firestoreClient.submitSurvey(response);
    await surveyStorage.markCompleted();
    await analyticsClient.logEvent('survey_completed', {
      questionCount: answeredCount,
    });
  },

  async submitSurveyWithPromo(
    answers: Record<string, string>,
    promoCode: string,
    promoSource: string,
  ): Promise<void> {
    const validation = surveyValidator.validate(answers);
    if (!validation.ok) {
      throw new Error(validation.error);
    }

    const user = await userStorage.get();
    const userId = user?.id ?? 'unknown';
    const now = new Date().toISOString();
    const answeredCount = Object.keys(answers).filter(
      (key) => answers[key] && answers[key].trim() !== ''
    ).length;

    const response: SurveyResponse = {
      userId,
      responses: answers,
      completedAt: now,
      appVersion: '1.0.0',
      platform: Platform.OS as 'ios' | 'android',
      promoCode,
      promoSource,
    };

    await firestoreClient.submitSurvey(response);
    await surveyStorage.markCompleted();

    await userStorage.update({
      isPro: true,
      promoCode,
      promoRedeemedAt: now,
    });

    await promoFirestoreClient.recordRedemption({
      userId,
      code: promoCode,
      source: promoSource,
      redeemedAt: now,
      platform: Platform.OS as 'ios' | 'android',
      appVersion: '1.0.0',
    });

    await analyticsClient.logEvent('survey_completed', {
      questionCount: answeredCount,
    });
    await analyticsClient.logEvent('promo_redeemed', {
      code: promoCode,
      source: promoSource,
    });
  },
};
