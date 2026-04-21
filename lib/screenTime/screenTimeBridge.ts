import { Platform } from 'react-native';
import {
  AuthorizationStatus,
  clearWebContentFilterPolicy,
  getAuthorizationStatus as libGetAuthorizationStatus,
  requestAuthorization as libRequestAuthorization,
  setWebContentFilterPolicy,
  updateShieldWithId,
} from 'react-native-device-activity';
import { PRIORITY_BLOCKED_DOMAINS } from '@/constants/screenTime/blockedDomains';
import { SHIELD_ID } from '@/constants/screenTime/screenTimeConfig';
import { logger } from '@/lib/logger';
import { buildRewireShieldConfig, buildShieldActions } from './shieldConfig';

export type AuthorizationStatusString = 'notDetermined' | 'denied' | 'approved';

export interface AuthorizationResult {
  status: AuthorizationStatusString;
  error?: string;
}

type Translator = (key: string) => string;

function mapStatus(status: number): AuthorizationStatusString {
  if (status === AuthorizationStatus.approved) return 'approved';
  if (status === AuthorizationStatus.denied) return 'denied';
  return 'notDetermined';
}

async function requestAuthorization(): Promise<AuthorizationResult> {
  if (Platform.OS !== 'ios') {
    return { status: 'notDetermined', error: 'Screen Time is only available on iOS' };
  }
  try {
    await libRequestAuthorization('individual');
    return { status: mapStatus(libGetAuthorizationStatus()) };
  } catch (error) {
    logger.error('ScreenTime', 'requestAuthorization failed:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { status: 'denied', error: message };
  }
}

function getAuthorizationStatus(): AuthorizationStatusString {
  if (Platform.OS !== 'ios') return 'notDetermined';
  try {
    return mapStatus(libGetAuthorizationStatus());
  } catch (error) {
    logger.error('ScreenTime', 'getAuthorizationStatus failed:', error);
    return 'notDetermined';
  }
}

async function enableAdultSiteBlocking(t: Translator): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    setWebContentFilterPolicy({
      type: 'auto',
      domains: PRIORITY_BLOCKED_DOMAINS,
    });
    updateShieldWithId(buildRewireShieldConfig(t), buildShieldActions(), SHIELD_ID);
    return true;
  } catch (error) {
    logger.error('ScreenTime', 'enableAdultSiteBlocking failed:', error);
    return false;
  }
}

async function disableAdultSiteBlocking(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    clearWebContentFilterPolicy();
    return true;
  } catch (error) {
    logger.error('ScreenTime', 'disableAdultSiteBlocking failed:', error);
    return false;
  }
}

export const screenTimeBridge = {
  requestAuthorization,
  getAuthorizationStatus,
  enableAdultSiteBlocking,
  disableAdultSiteBlocking,
};
