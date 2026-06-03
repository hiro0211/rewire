import { Platform } from 'react-native';
import {
  AuthorizationStatus,
  blockSelection,
  unblockSelection,
  isShieldActive as libIsShieldActive,
  getAuthorizationStatus as libGetAuthorizationStatus,
  requestAuthorization as libRequestAuthorization,
  setFamilyActivitySelectionId,
  getFamilyActivitySelectionId,
  setWebContentFilterPolicy,
  clearWebContentFilterPolicy,
  updateShield,
} from 'react-native-device-activity';
import { BROWSER_SELECTION_ID } from '@/constants/screenTime/screenTimeConfig';
import { PRIORITY_BLOCKED_DOMAINS } from '@/constants/screenTime/blockedDomains';
import { logger } from '@/lib/logger';
import { buildRewireShieldConfig, buildShieldActions } from './shieldConfig';

export type AuthorizationStatusString = 'notDetermined' | 'denied' | 'approved';
export type Translator = (key: string) => string;

export interface AuthorizationResult {
  status: AuthorizationStatusString;
  error?: string;
}

function mapStatus(status: number): AuthorizationStatusString {
  if (status === AuthorizationStatus.approved) return 'approved';
  if (status === AuthorizationStatus.denied) return 'denied';
  return 'notDetermined';
}

async function requestAuthorization(): Promise<AuthorizationResult> {
  if (Platform.OS !== 'ios') {
    return {
      status: 'notDetermined',
      error: 'Screen Time is only available on iOS',
    };
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

function persistSelection(familyActivitySelection: string): boolean {
  if (Platform.OS !== 'ios') return false;
  try {
    setFamilyActivitySelectionId({
      id: BROWSER_SELECTION_ID,
      familyActivitySelection,
    });
    return true;
  } catch (error) {
    logger.error('ScreenTime', 'persistSelection failed:', error);
    return false;
  }
}

function getStoredSelection(): string | null {
  if (Platform.OS !== 'ios') return null;
  try {
    return getFamilyActivitySelectionId(BROWSER_SELECTION_ID) ?? null;
  } catch (error) {
    logger.error('ScreenTime', 'getStoredSelection failed:', error);
    return null;
  }
}

function applyAppShield(t: Translator, hasSelection = true): boolean {
  if (Platform.OS !== 'ios') return false;
  try {
    updateShield(buildRewireShieldConfig(t), buildShieldActions());
    // Layer 1: System-wide adult-site URL filter (Safari/Chrome/Firefox via WebKit).
    // Quittr-style: works without user picking specific apps.
    setWebContentFilterPolicy({
      type: 'auto',
      domains: PRIORITY_BLOCKED_DOMAINS,
    });
    // Layer 2: App-level shield for browsers the user explicitly selected
    // via FamilyActivityPicker. Skipped on first run before any selection.
    if (hasSelection) {
      blockSelection({ activitySelectionId: BROWSER_SELECTION_ID });
    }
    return true;
  } catch (error) {
    logger.error('ScreenTime', 'applyAppShield failed:', error);
    return false;
  }
}

function clearAppShield(hasSelection = true): boolean {
  if (Platform.OS !== 'ios') return false;
  try {
    clearWebContentFilterPolicy();
    if (hasSelection) {
      unblockSelection({ activitySelectionId: BROWSER_SELECTION_ID });
    }
    return true;
  } catch (error) {
    logger.error('ScreenTime', 'clearAppShield failed:', error);
    return false;
  }
}

function isShieldActive(): boolean {
  if (Platform.OS !== 'ios') return false;
  try {
    return libIsShieldActive();
  } catch {
    return false;
  }
}

export const screenTimeBridge = {
  requestAuthorization,
  getAuthorizationStatus,
  persistSelection,
  getStoredSelection,
  applyAppShield,
  clearAppShield,
  isShieldActive,
};
