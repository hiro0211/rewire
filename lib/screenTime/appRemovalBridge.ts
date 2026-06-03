import { Platform } from 'react-native';
import AppRemovalGuard from '@/modules/expo-app-removal-guard/src';
import { logger } from '@/lib/logger';

async function lock(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  if (!AppRemovalGuard) return false;
  try {
    return await AppRemovalGuard.setDenyAppRemoval(true);
  } catch (error) {
    logger.error('AppRemovalGuard', 'lock failed:', error);
    return false;
  }
}

async function unlock(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  if (!AppRemovalGuard) return false;
  try {
    return await AppRemovalGuard.setDenyAppRemoval(false);
  } catch (error) {
    logger.error('AppRemovalGuard', 'unlock failed:', error);
    return false;
  }
}

async function isLocked(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  if (!AppRemovalGuard) return false;
  try {
    return await AppRemovalGuard.getDenyAppRemoval();
  } catch {
    return false;
  }
}

export const appRemovalBridge = {
  lock,
  unlock,
  isLocked,
};
