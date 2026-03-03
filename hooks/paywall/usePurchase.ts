import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { isExpoGo } from '@/lib/nativeGuard';

let Purchases: any = null;
if (!isExpoGo) {
  try {
    Purchases = require('react-native-purchases').default;
  } catch {}
}

const ENTITLEMENT_KEY = 'Rewire Pro';

interface UsePurchaseOptions {
  package: any;
  onPurchaseCompleted: () => void;
  onRestoreCompleted: () => void;
}

export function usePurchase({ package: pkg, onPurchaseCompleted, onRestoreCompleted }: UsePurchaseOptions) {
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = useCallback(async () => {
    if (!Purchases || purchasing) return;
    if (!pkg) {
      Alert.alert('エラー', 'プランの取得に失敗しました。再度お試しください。');
      return;
    }
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active[ENTITLEMENT_KEY]) {
        onPurchaseCompleted();
      }
    } catch (error: any) {
      if (error.userCancelled || error.code === '1' || error.code === 'PURCHASE_CANCELLED') return;
      Alert.alert('購入エラー', 'お支払い処理中にエラーが発生しました。');
    } finally {
      setPurchasing(false);
    }
  }, [pkg, purchasing, onPurchaseCompleted]);

  const handleRestore = useCallback(async () => {
    if (!Purchases) return;
    setPurchasing(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active[ENTITLEMENT_KEY]) {
        onRestoreCompleted();
      } else {
        Alert.alert('復元結果', '有効なサブスクリプションが見つかりませんでした。');
      }
    } catch {
      Alert.alert('復元エラー', '購入の復元中にエラーが発生しました。');
    } finally {
      setPurchasing(false);
    }
  }, [onRestoreCompleted]);

  return { purchasing, handlePurchase, handleRestore };
}
