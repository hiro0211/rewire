import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { getPurchaseErrorKeys } from '@/constants/purchaseErrors';
import { t } from '@/locales/i18n';
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
      Alert.alert(t('checkinForm.error'), t('purchaseAlerts.packageFailed'));
      return;
    }
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active[ENTITLEMENT_KEY]) {
        onPurchaseCompleted();
      }
    } catch (error: any) {
      const isCancelled =
        error?.userCancelled ||
        error?.code === '1' ||
        error?.code === 'PURCHASE_CANCELLED';
      if (!isCancelled) {
        logger.error('Purchase', 'failed:', {
          code: error?.code,
          readableErrorCode: error?.readableErrorCode ?? error?.userInfo?.readableErrorCode,
          underlyingErrorMessage: error?.underlyingErrorMessage,
          message: error?.message,
        });
      }
      const errorKeys = getPurchaseErrorKeys(error);
      if (errorKeys) {
        Alert.alert(t(errorKeys.titleKey), t(errorKeys.messageKey));
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
        Alert.alert(t('purchaseAlerts.restoreResult'), t('purchaseAlerts.restoreNoSub'));
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
        Alert.alert(t('purchaseAlerts.restoreError'), t('purchaseAlerts.restoreNetwork'));
      } else {
        Alert.alert(t('purchaseAlerts.restoreError'), t('purchaseAlerts.restoreDefault'));
      }
    } finally {
      setPurchasing(false);
    }
  }, [onRestoreCompleted]);

  return { purchasing, handlePurchase, handleRestore };
}
