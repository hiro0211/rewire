import { isExpoGo } from '@/lib/nativeGuard';

let _Purchases: typeof import('react-native-purchases').default | null = null;
if (!isExpoGo) {
  try { _Purchases = require('react-native-purchases').default; } catch {}
}
export const Purchases = _Purchases;

let _RevenueCatUI: typeof import('react-native-purchases-ui').default | null = null;
if (!isExpoGo) {
  try { _RevenueCatUI = require('react-native-purchases-ui').default; } catch {}
}
export const RevenueCatUI = _RevenueCatUI;
