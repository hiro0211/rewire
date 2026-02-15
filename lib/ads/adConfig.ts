import { Platform } from 'react-native';

// Google AdMob test IDs (hardcoded to avoid importing react-native-google-mobile-ads at module level)
// https://developers.google.com/admob/ios/test-ads
const TEST_BANNER = Platform.select({
  ios: 'ca-app-pub-3940256099942544/2934735716',
  android: 'ca-app-pub-3940256099942544/6300978111',
}) ?? '';
const TEST_INTERSTITIAL = Platform.select({
  ios: 'ca-app-pub-3940256099942544/4411468910',
  android: 'ca-app-pub-3940256099942544/1033173712',
}) ?? '';
const TEST_REWARDED = Platform.select({
  ios: 'ca-app-pub-3940256099942544/1712485313',
  android: 'ca-app-pub-3940256099942544/5224354917',
}) ?? '';

const banner = process.env.EXPO_PUBLIC_ADMOB_BANNER ?? TEST_BANNER;
const interstitial = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL ?? TEST_INTERSTITIAL;
const rewarded = process.env.EXPO_PUBLIC_ADMOB_REWARDED ?? TEST_REWARDED;

export const AD_UNIT_IDS = {
  BANNER_DASHBOARD: banner,
  BANNER_ARTICLES: banner,
  BANNER_ARTICLE_DETAIL: banner,
  BANNER_HISTORY: banner,
  BANNER_RECOVERY: banner,
  INTERSTITIAL_CHECKIN_COMPLETE: interstitial,
  REWARDED_ARTICLE_UNLOCK: rewarded,
} as const;

export const ADMOB_APP_ID = Platform.select({
  ios: process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS ?? '',
  android: process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID ?? '',
}) ?? '';
