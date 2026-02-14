import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const banner = process.env.EXPO_PUBLIC_ADMOB_BANNER ?? TestIds.BANNER;
const interstitial = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL ?? TestIds.INTERSTITIAL;
const rewarded = process.env.EXPO_PUBLIC_ADMOB_REWARDED ?? TestIds.REWARDED;

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
