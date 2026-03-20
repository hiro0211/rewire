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
