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

interface PurchaseErrorMessage {
  title: string;
  message: string;
}

function getPurchaseErrorMessage(error: any): PurchaseErrorMessage | null {
  const code = error?.code ?? error?.errorCode;

  if (error?.userCancelled || code === '1' || code === 'PURCHASE_CANCELLED') {
    return null;
  }

  switch (code) {
    case '2':
    case 'STORE_PROBLEM':
      return {
        title: '購入エラー',
        message: 'App Storeとの接続に問題が発生しました。しばらくしてから再度お試しください。',
      };
    case '3':
    case 'PURCHASE_NOT_ALLOWED':
      return {
        title: '購入エラー',
        message: 'このデバイスでは購入が許可されていません。「設定」>「スクリーンタイム」の制限を確認してください。',
      };
    case '5':
    case 'PRODUCT_NOT_AVAILABLE':
      return {
        title: '購入エラー',
        message: '現在このプランはご利用いただけません。しばらくしてから再度お試しください。',
      };
    case '10':
    case 'NETWORK_ERROR':
    case '35':
    case 'OFFLINE_CONNECTION_ERROR':
      return {
        title: '購入エラー',
        message: 'ネットワーク接続を確認して、もう一度お試しください。',
      };
    case '15':
    case 'OPERATION_ALREADY_IN_PROGRESS':
      return {
        title: '購入エラー',
        message: '購入処理が進行中です。しばらくお待ちください。',
      };
    case '18':
    case 'INELIGIBLE_ERROR':
      return {
        title: '購入エラー',
        message: '現在このオファーはご利用いただけません。条件をご確認ください。',
      };
    case '20':
    case 'PAYMENT_PENDING':
      return {
        title: '購入保留中',
        message: 'お支払いの承認待ちです。承認後にプレミアム機能が有効になります。',
      };
    case '23':
    case 'CONFIGURATION_ERROR':
      return {
        title: '購入エラー',
        message: 'ストアの設定に問題があります。しばらくしてから再度お試しください。',
      };
    case '32':
    case 'PRODUCT_REQUEST_TIMED_OUT':
      return {
        title: '購入エラー',
        message: 'リクエストがタイムアウトしました。ネットワーク接続を確認して、もう一度お試しください。',
      };
    default:
      return {
        title: '購入エラー',
        message: 'お支払い処理中にエラーが発生しました。しばらくしてから再度お試しください。',
      };
  }
}

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
      console.error('[Purchase] failed:', {
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
      console.error('[Restore] failed:', {
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
