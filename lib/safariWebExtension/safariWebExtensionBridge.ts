import { Platform } from 'react-native';
import type {
  ExtensionAliveListener,
  ExtensionStateNative,
  SafariWebExtensionBridge,
  SafariWebExtensionStatus,
} from './types';
import { logger } from '@/lib/logger';

const STUB_STATUS: SafariWebExtensionStatus = {
  isEnabled: false,
  hasAllUrls: false,
  extensionBundleId: '',
  lastActiveAt: 0,
  lastBlockedAt: 0,
};

const STUB_STATE: ExtensionStateNative = {
  available: false,
  isEnabled: false,
};

interface NativeModule {
  getExtensionStatus: () => Promise<SafariWebExtensionStatus>;
  getExtensionState?: (
    bundleId?: string,
  ) => Promise<{ available: boolean; isEnabled: boolean; error?: string }>;
  addListener?: (
    event: 'onExtensionAlive',
    listener: ExtensionAliveListener,
  ) => { remove: () => void };
}

function getNativeModule(): NativeModule | null {
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
        lastBlockedAt: Number(raw?.lastBlockedAt ?? 0),
      };
      logger.debug('SafariWebExtension', 'Status:', JSON.stringify(status));
      return status;
    } catch (error) {
      logger.error('SafariWebExtension', 'getExtensionStatus failed:', error);
      return { ...STUB_STATUS, error: String(error) };
    }
  },

  async getExtensionState(): Promise<ExtensionStateNative> {
    if (Platform.OS !== 'ios') return STUB_STATE;
    try {
      const mod = getNativeModule();
      if (!mod || typeof mod.getExtensionState !== 'function') return STUB_STATE;
      const raw = await mod.getExtensionState();
      const state: ExtensionStateNative = {
        available: Boolean(raw?.available),
        isEnabled: Boolean(raw?.isEnabled),
      };
      if (raw?.error) state.error = String(raw.error);
      return state;
    } catch (error) {
      logger.error('SafariWebExtension', 'getExtensionState failed:', error);
      return { ...STUB_STATE, error: String(error) };
    }
  },

  subscribeAlive(listener: ExtensionAliveListener): () => void {
    if (Platform.OS !== 'ios') return () => {};
    let remove: (() => void) | null = null;
    try {
      const mod = getNativeModule();
      if (!mod || typeof mod.addListener !== 'function') return () => {};
      const subscription = mod.addListener('onExtensionAlive', listener);
      remove = subscription?.remove ?? null;
    } catch (error) {
      logger.error('SafariWebExtension', 'subscribeAlive failed:', error);
      return () => {};
    }
    return () => {
      try {
        remove?.();
      } catch {
        // noop
      }
    };
  },
};
