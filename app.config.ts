import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Rewire',
  slug: 'rewire',
  version: '1.1.0',
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
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: 'rewire.app.com',
    appleTeamId: 'KV6CYPA7JK',
    googleServicesFile: './GoogleService-Info.plist',
    infoPlist: {
      ...config.ios?.infoPlist,
      CFBundleAllowMixedLocalizations: true,
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription:
        'パニックボタン画面で自分の顔を映し、衝動に対して自分自身と向き合うために使用します。映像は端末内でのみ表示され、保存・送信されません。',
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
    'expo-secure-store',
    [
      'expo-camera',
      {
        cameraPermission:
          'パニックボタン画面で自分の顔を映し、衝動に対して自分自身と向き合うために使用します。映像は端末内でのみ表示され、保存・送信されません。',
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-build-properties',
      {
        ios: {
          deploymentTarget: '15.1',
          useFrameworks: 'static',
          forceStaticLinking: ['RNFBApp', 'RNFBAnalytics', 'RNFBFirestore'],
        },
      },
    ],
    './plugins/withFirebaseAnalyticsNoAdId',
    '@react-native-firebase/app',
    [
      './plugins/withSafariWebExtension',
      {
        appleTeamId: 'KV6CYPA7JK',
        appGroup: 'group.rewire.app.com',
      },
    ],
    './plugins/withWidget',
    './plugins/withDisableResourceBundleSigning',
    '@react-native-community/datetimepicker',
    './plugins/withRemoveTrackingDescription',
  ],
  extra: {
    eas: {
      projectId: '3e815c4f-9829-4aea-a68c-45ec5bb1f892',
      build: {
        experimental: {
          ios: {
            appExtensions: [
              {
                targetName: 'RewireWidget',
                bundleIdentifier: 'rewire.app.com.RewireWidget',
                entitlements: {
                  'com.apple.security.application-groups': [
                    'group.rewire.app.com',
                  ],
                },
              },
              {
                targetName: 'SafariWebExtension',
                bundleIdentifier: 'rewire.app.com.SafariWebExtension',
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
