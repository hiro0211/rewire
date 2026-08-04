import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { getPurchaseErrorKeys } from '@/constants/purchaseErrors';
import { t } from '@/locales/i18n';
import { Purchases } from '@/lib/subscription/purchasesModule';
import { logger } from '@/lib/logger';
import { trackEvent } from '@/lib/tracking/trackEvent';
import { PRO_ENTITLEMENT_ID } from '@/constants/subscription';


interface UsePurchaseOptions {
  package: any;
  plan?: string;
  /** 購入完了。どのプランが売れたかを計測に載せるため plan を受け取る。 */
  onPurchaseCompleted: (plan: string) => void;
  onRestoreCompleted: () => void;
}

export function usePurchase({ package: pkg, plan, onPurchaseCompleted, onRestoreCompleted }: UsePurchaseOptions) {
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = useCallback(async () => {
    if (!Purchases || purchasing) return;
    if (!pkg) {
      Alert.alert(t('checkinForm.error'), t('purchaseAlerts.packageFailed'));
      return;
    }
    trackEvent('purchase_initiated', { plan: plan ?? 'unknown' });
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]) {
        onPurchaseCompleted(plan ?? 'unknown');
      } else {
        // 決済は通ったのに権利が付いていない（RevenueCat 側の entitlement 識別子
        // 不一致が典型）。ここで黙って抜けると、支払ったのに何も起きない画面に
        // なり、計測にも何も残らない。
        logger.error('Purchase', 'entitlement missing after successful purchase', {
          expected: PRO_ENTITLEMENT_ID,
          active: Object.keys(customerInfo.entitlements.active ?? {}),
        });
        trackEvent('purchase_failed', { reason: 'entitlement_missing', cancelled: false });
        const keys = getPurchaseErrorKeys({});
        if (keys) {
          Alert.alert(t(keys.titleKey), t(keys.messageKey));
        }
      }
    } catch (error: any) {
      const isCancelled =
        error?.userCancelled ||
        error?.code === '1' ||
        error?.code === 'PURCHASE_CANCELLED';
      trackEvent('purchase_failed', {
        reason: String(error?.code ?? error?.message ?? 'unknown'),
        cancelled: Boolean(isCancelled),
      });
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
  }, [pkg, plan, purchasing, onPurchaseCompleted]);

  const handleRestore = useCallback(async () => {
    if (!Purchases) return;
    trackEvent('restore_tapped');
    setPurchasing(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      const success = !!customerInfo.entitlements.active[PRO_ENTITLEMENT_ID];
      trackEvent('restore_completed', { success });
      if (success) {
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
