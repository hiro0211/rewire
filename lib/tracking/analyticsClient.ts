import { logger } from '@/lib/logger';

export const analyticsClient = {
  async logEvent(
    name: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<void> {
    if (__DEV__) {
      logger.debug('Analytics', 'logEvent:', name, params);
    }
  },

  async logScreenView(screenName: string): Promise<void> {
    if (__DEV__) {
      logger.debug('Analytics', 'logScreenView:', screenName);
    }
  },

  async setUserId(id: string | null): Promise<void> {
    if (__DEV__) {
      logger.debug('Analytics', 'setUserId:', id);
    }
  },

  async setUserProperty(name: string, value: string | null): Promise<void> {
    if (__DEV__) {
      logger.debug('Analytics', 'setUserProperty:', name, value);
    }
  },
};
