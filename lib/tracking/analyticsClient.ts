import { isExpoGo } from '@/lib/nativeGuard';
import { logger } from '@/lib/logger';

let analytics: any = null;
if (!isExpoGo) {
  try {
    analytics = require('@react-native-firebase/analytics').default;
  } catch {
    // Native module not available
  }
}

export const analyticsClient = {
  async logEvent(
    name: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<void> {
    if (!analytics) return;
    try {
      await analytics().logEvent(name, params);
    } catch (error) {
      logger.warn('Analytics', 'logEvent failed:', error);
    }
  },

  async logScreenView(screenName: string): Promise<void> {
    if (!analytics) return;
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenName,
      });
    } catch (error) {
      logger.warn('Analytics', 'logScreenView failed:', error);
    }
  },

  async setUserId(id: string | null): Promise<void> {
    if (!analytics) return;
    try {
      await analytics().setUserId(id);
    } catch (error) {
      logger.warn('Analytics', 'setUserId failed:', error);
    }
  },

  async setUserProperty(name: string, value: string | null): Promise<void> {
    if (!analytics) return;
    try {
      await analytics().setUserProperties({ [name]: value });
    } catch (error) {
      logger.warn('Analytics', 'setUserProperty failed:', error);
    }
  },
};
