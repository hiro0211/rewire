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
    bundleIdentifier: 'rewire.app.com',
    googleServicesFile: './GoogleService-Info.plist',
    infoPlist: {
      NSUserTrackingUsageDescription:
        '広告のパーソナライズのために使用します。許可しない場合でもアプリは通常通りご利用いただけます。',
      CFBundleAllowMixedLocalizations: true,
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  locales: {
    ja: './locales/ja.json',
  },
  android: {
    package: 'rewire.app.com',
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
    [
      'expo-build-properties',
      {
        ios: {
          deploymentTarget: '15.1',
          useFrameworks: 'static',
          forceStaticLinking: ['RNFBApp', 'RNFBAnalytics'],
        },
      },
    ],
    '@react-native-firebase/app',
    './plugins/withContentBlocker',
    './plugins/withDisableResourceBundleSigning',
    '@react-native-community/datetimepicker',
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID ?? 'ca-app-pub-3940256099942544~3347511713',
        iosAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS ?? 'ca-app-pub-3940256099942544~1458002511',
      },
    ],
  ],
  extra: {
    eas: {
      projectId: '3e815c4f-9829-4aea-a68c-45ec5bb1f892',
      build: {
        experimental: {
          ios: {
            appExtensions: [
              {
                targetName: 'ContentBlockerExtension',
                bundleIdentifier: 'rewire.app.com.ContentBlockerExtension',
                entitlements: {
                  'com.apple.security.application-groups': [
                    'group.rewire.app.com',
                  ],
                },
              },
            ],
          },
        },
      },
    },
  },
  owner: 'hiro01150',
  experiments: {
    typedRoutes: true,
  },
});
