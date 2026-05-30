// React 19 + react-test-renderer の cleanup 時に
// window.dispatchEvent が存在しない環境でクラッシュするのを防ぐ
if (typeof window !== 'undefined' && typeof window.dispatchEvent !== 'function') {
  window.dispatchEvent = () => true;
}

// expo-localization mock for i18n (default: Japanese)
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'ja' }],
}));

// AsyncStorage mock for tests that transitively import it via themeStore/useTheme
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// expo-quick-actions: native module — no-op the hook entrypoint by default
jest.mock('expo-quick-actions/hooks', () => ({
  useQuickActionCallback: jest.fn(),
  useQuickAction: jest.fn(() => null),
}));

// expo-device / expo-application: safe defaults so transitive imports don't fail
jest.mock('expo-device', () => ({
  modelId: 'iPhone17,5',
  osVersion: '26.5',
  osBuildId: '23F77',
}));
jest.mock('expo-application', () => ({
  nativeApplicationVersion: '2.1.0',
  nativeBuildVersion: '1',
}));

// expo-notifications safe default mock — individual tests can override
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id'),
  getLastNotificationResponseAsync: jest.fn().mockResolvedValue(null),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));
