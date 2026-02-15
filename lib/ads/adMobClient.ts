import { isExpoGo } from '@/lib/nativeGuard';

let mobileAds: any = null;
if (!isExpoGo) {
  try {
    mobileAds = require('react-native-google-mobile-ads').default;
  } catch {
    // Native module not available
  }
}

export const adMobClient = {
  initialized: false,

  async initialize(): Promise<void> {
    if (this.initialized || !mobileAds) return;
    try {
      await mobileAds().initialize();
      this.initialized = true;
    } catch (error) {
      console.error('[AdMob] initialization failed:', error);
    }
  },
};
