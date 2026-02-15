import Constants from 'expo-constants';

/**
 * Expo Go ではネイティブモジュールが使えないため、
 * require() 自体をスキップする必要がある。
 */
export const isExpoGo = Constants.appOwnership === 'expo';
