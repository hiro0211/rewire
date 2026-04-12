import { isExpoGo } from '@/lib/nativeGuard';
import { logger } from '@/lib/logger';

type AnalyticsModule = (() => {
  logEvent: (
    name: string,
    params?: Record<string, unknown>,
  ) => Promise<void>;
  logScreenView: (params: {
    screen_name: string;
    screen_class: string;
  }) => Promise<void>;
  setUserId: (id: string | null) => Promise<void>;
  setUserProperties: (props: Record<string, string | null>) => Promise<void>;
}) | null;

let analyticsModule: AnalyticsModule = null;
if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    analyticsModule = require('@react-native-firebase/analytics').default;
  } catch {
    analyticsModule = null;
  }
}

export const analyticsClient = {
  async logEvent(
    name: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<void> {
    if (!analyticsModule) {
      if (__DEV__) logger.debug('Analytics', 'logEvent (no-op):', name, params);
      return;
    }
    try {
      await analyticsModule().logEvent(name, params);
    } catch (error) {
      logger.warn('Analytics', 'logEvent failed:', error);
    }
  },

  async logScreenView(screenName: string): Promise<void> {
    if (!analyticsModule) {
      if (__DEV__) logger.debug('Analytics', 'logScreenView (no-op):', screenName);
      return;
    }
    try {
      await analyticsModule().logScreenView({
        screen_name: screenName,
        screen_class: screenName,
      });
    } catch (error) {
      logger.warn('Analytics', 'logScreenView failed:', error);
    }
  },

  async setUserId(id: string | null): Promise<void> {
    if (!analyticsModule) {
      if (__DEV__) logger.debug('Analytics', 'setUserId (no-op):', id);
      return;
    }
    try {
      await analyticsModule().setUserId(id);
    } catch (error) {
      logger.warn('Analytics', 'setUserId failed:', error);
    }
  },

  async setUserProperty(name: string, value: string | null): Promise<void> {
    if (!analyticsModule) {
      if (__DEV__) logger.debug('Analytics', 'setUserProperty (no-op):', name, value);
      return;
    }
    try {
      await analyticsModule().setUserProperties({ [name]: value });
    } catch (error) {
      logger.warn('Analytics', 'setUserProperty failed:', error);
    }
  },
};
