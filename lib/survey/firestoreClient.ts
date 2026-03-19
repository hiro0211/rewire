import { isExpoGo } from '@/lib/nativeGuard';
import { logger } from '@/lib/logger';
import type { SurveyResponse } from '@/types/survey';

let firestore: any = null;
if (!isExpoGo) {
  try {
    firestore = require('@react-native-firebase/firestore').default;
  } catch {
    // Native module not available
  }
}

export const firestoreClient = {
  async submitSurvey(response: SurveyResponse): Promise<void> {
    if (!firestore) return;
    try {
      await firestore().collection('surveys').add(response);
    } catch (error) {
      logger.warn('Firestore', 'submitSurvey failed:', error);
    }
  },
};
