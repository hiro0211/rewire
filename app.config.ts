import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'rewire',
  slug: 'rewire',
  version: '1.0.0',
  icon: './assets/images/icon.png',
  orientation: 'portrait',
  scheme: 'rewire',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    resizeMode: 'contain',
    backgroundColor: '#0A0A0F',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.rewire.app',
    infoPlist: {
      NSUserTrackingUsageDescription:
        'This is used to personalize ads. The app works normally even without permission.',
      CFBundleAllowMixedLocalizations: true,
    },
  },
  locales: {
    ja: './locales/ja.json',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#0A0A0F',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: 'metro',
    output: 'static' as const,
  },
  plugins: [
    'expo-router',
    'expo-tracking-transparency',
    'expo-secure-store',
    './plugins/withContentBlocker',
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID ?? '',
        iosAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS ?? '',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
