import { Platform } from 'react-native';
import type { AuthorizationResult, AuthorizationStatus, ScreenTimeBridge } from './screenTimeTypes';
import { logger } from '../logger';

function getNativeModule(): {
  requestAuthorization: () => Promise<AuthorizationResult>;
  getAuthorizationStatus: () => Promise<AuthorizationStatus>;
  enableWebContentFilter: () => Promise<boolean>;
  disableWebContentFilter: () => Promise<boolean>;
} | null {
  try {
    const mod = require('../../modules/expo-screen-time/src').default;
    return mod ?? null;
  } catch {
    return null;
  }
}

export const screenTimeBridge: ScreenTimeBridge = {
  async requestAuthorization(): Promise<AuthorizationResult> {
    if (Platform.OS !== 'ios') {
      return { status: 'notDetermined', error: 'Screen Time is only available on iOS' };
    }
    try {
      const mod = getNativeModule();
      if (!mod) return { status: 'notDetermined', error: 'Native module not available' };
      return await mod.requestAuthorization();
    } catch (error) {
      logger.error('ScreenTime', 'requestAuthorization failed:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { status: 'notDetermined', error: message };
    }
  },

  async getAuthorizationStatus(): Promise<AuthorizationStatus> {
    if (Platform.OS !== 'ios') return 'notDetermined';
    try {
      const mod = getNativeModule();
      if (!mod) return 'notDetermined';
      return await mod.getAuthorizationStatus();
    } catch (error) {
      logger.error('ScreenTime', 'getAuthorizationStatus failed:', error);
      return 'notDetermined';
    }
  },

  async enableWebContentFilter(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    try {
      const mod = getNativeModule();
      if (!mod) return false;
      return await mod.enableWebContentFilter();
    } catch (error) {
      logger.error('ScreenTime', 'enableWebContentFilter failed:', error);
      return false;
    }
  },

  async disableWebContentFilter(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    try {
      const mod = getNativeModule();
      if (!mod) return false;
      return await mod.disableWebContentFilter();
    } catch (error) {
      logger.error('ScreenTime', 'disableWebContentFilter failed:', error);
      return false;
    }
  },
};
