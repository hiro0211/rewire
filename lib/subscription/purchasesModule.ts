import { isExpoGo } from '@/lib/nativeGuard';

let _purchases: any = null;
if (!isExpoGo) {
  try {
    _purchases = require('react-native-purchases').default;
  } catch {}
}

export const Purchases = _purchases;
