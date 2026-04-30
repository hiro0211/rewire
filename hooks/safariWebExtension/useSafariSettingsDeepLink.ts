import { useCallback } from 'react';
import { Linking } from 'react-native';

const SAFARI_PREFS_URL = 'App-Prefs:com.apple.mobilesafari';

export function useSafariSettingsDeepLink() {
  return useCallback(async () => {
    try {
      const canOpen = await Linking.canOpenURL(SAFARI_PREFS_URL);
      if (canOpen) {
        await Linking.openURL(SAFARI_PREFS_URL);
        return;
      }
    } catch {
      // fall through to openSettings
    }
    await Linking.openSettings();
  }, []);
}
