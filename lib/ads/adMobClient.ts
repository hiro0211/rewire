import mobileAds from 'react-native-google-mobile-ads';

export const adMobClient = {
  initialized: false,

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      await mobileAds().initialize();
      this.initialized = true;
    } catch (error) {
      console.error('[AdMob] initialization failed:', error);
    }
  },
};
