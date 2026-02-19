import { Platform } from 'react-native';
import type {
  ContentBlockerBridge,
  ContentBlockerStatus,
} from './contentBlockerTypes';

const STUB_STATUS: ContentBlockerStatus = {
  isEnabled: false,
  extensionBundleId: '',
};

/**
 * Lazily loads the native Expo Content Blocker module.
 * Returns null when the native binary is unavailable (Expo Go / Android / Web).
 */
function getNativeModule(): ContentBlockerBridge | null {
  try {
    const mod = require('../../modules/expo-content-blocker/src').default;
    return mod ?? null;
  } catch {
    return null;
  }
}

export const contentBlockerBridge: ContentBlockerBridge = {
  async enableBlocker(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    try {
      const mod = getNativeModule();
      if (!mod) return false;
      return await mod.enableBlocker();
    } catch (error) {
      console.error('[ContentBlocker] enableBlocker failed:', error);
      return false;
    }
  },

  async disableBlocker(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    try {
      const mod = getNativeModule();
      if (!mod) return false;
      return await mod.disableBlocker();
    } catch (error) {
      console.error('[ContentBlocker] disableBlocker failed:', error);
      return false;
    }
  },

  async getBlockerStatus(): Promise<ContentBlockerStatus> {
    if (Platform.OS !== 'ios') return STUB_STATUS;
    try {
      const mod = getNativeModule();
      if (!mod) return STUB_STATUS;
      return await mod.getBlockerStatus();
    } catch (error) {
      console.error('[ContentBlocker] getBlockerStatus failed:', error);
      return STUB_STATUS;
    }
  },

  async reloadBlockerRules(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    try {
      const mod = getNativeModule();
      if (!mod) return false;
      return await mod.reloadBlockerRules();
    } catch (error) {
      console.error('[ContentBlocker] reloadBlockerRules failed:', error);
      return false;
    }
  },

  async addCustomDomain(domain: string): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    try {
      const mod = getNativeModule();
      if (!mod) return false;
      return await mod.addCustomDomain(domain);
    } catch (error) {
      console.error('[ContentBlocker] addCustomDomain failed:', error);
      return false;
    }
  },

  async removeCustomDomain(domain: string): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    try {
      const mod = getNativeModule();
      if (!mod) return false;
      return await mod.removeCustomDomain(domain);
    } catch (error) {
      console.error('[ContentBlocker] removeCustomDomain failed:', error);
      return false;
    }
  },

  async getCustomDomains(): Promise<string[]> {
    if (Platform.OS !== 'ios') return [];
    try {
      const mod = getNativeModule();
      if (!mod) return [];
      return await mod.getCustomDomains();
    } catch (error) {
      console.error('[ContentBlocker] getCustomDomains failed:', error);
      return [];
    }
  },
};
