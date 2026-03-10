import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { getPurchaseErrorMessage } from '@/constants/purchaseErrors';
import { Purchases } from '@/lib/subscription/purchasesModule';
import { logger } from '@/lib/logger';

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
      logger.error('Purchase', 'failed:', {
        code: error?.code,
        readableErrorCode: error?.readableErrorCode ?? error?.userInfo?.readableErrorCode,
        underlyingErrorMessage: error?.underlyingErrorMessage,
        message: error?.message,
      });
      const errorMsg = getPurchaseErrorMessage(error);
      if (errorMsg) {
        Alert.alert(errorMsg.title, errorMsg.message);
      }
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
    } catch (error: any) {
      logger.error('Restore', 'failed:', {
        code: error?.code,
        readableErrorCode: error?.readableErrorCode ?? error?.userInfo?.readableErrorCode,
        underlyingErrorMessage: error?.underlyingErrorMessage,
        message: error?.message,
      });
      const code = error?.code ?? error?.errorCode;
      if (code === '10' || code === 'NETWORK_ERROR') {
        Alert.alert('復元エラー', 'ネットワーク接続を確認して、もう一度お試しください。');
      } else {
        Alert.alert('復元エラー', '購入の復元中にエラーが発生しました。しばらくしてから再度お試しください。');
      }
    } finally {
      setPurchasing(false);
    }
  }, [onRestoreCompleted]);

  return { purchasing, handlePurchase, handleRestore };
}
