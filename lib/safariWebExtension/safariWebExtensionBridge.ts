import { Platform } from 'react-native';
import type {
  SafariWebExtensionBridge,
  SafariWebExtensionStatus,
} from './types';
import { logger } from '@/lib/logger';

const STUB_STATUS: SafariWebExtensionStatus = {
  isEnabled: false,
  hasAllUrls: false,
  extensionBundleId: '',
  lastActiveAt: 0,
};

function getNativeModule(): {
  getExtensionStatus: () => Promise<SafariWebExtensionStatus>;
} | null {
  try {
    const mod = require('../../modules/expo-safari-web-extension/src').default;
    return mod ?? null;
  } catch {
    return null;
  }
}

export const safariWebExtensionBridge: SafariWebExtensionBridge = {
  async getExtensionStatus(): Promise<SafariWebExtensionStatus> {
    if (Platform.OS !== 'ios') return STUB_STATUS;
    try {
      const mod = getNativeModule();
      if (!mod) {
        logger.warn('SafariWebExtension', 'Native module not available');
        return STUB_STATUS;
      }
      const raw = await mod.getExtensionStatus();
      const status: SafariWebExtensionStatus = {
        isEnabled: Boolean(raw?.isEnabled),
        hasAllUrls: Boolean(raw?.hasAllUrls),
        extensionBundleId: String(raw?.extensionBundleId ?? ''),
        lastActiveAt: Number(raw?.lastActiveAt ?? 0),
      };
      logger.debug('SafariWebExtension', 'Status:', JSON.stringify(status));
      return status;
    } catch (error) {
      logger.error('SafariWebExtension', 'getExtensionStatus failed:', error);
      return { ...STUB_STATUS, error: String(error) };
    }
  },
};
