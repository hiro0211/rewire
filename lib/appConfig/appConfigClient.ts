import { isExpoGo } from '@/lib/nativeGuard';
import { logger } from '@/lib/logger';

let firestore: any = null;
if (!isExpoGo) {
  try {
    firestore = require('@react-native-firebase/firestore').default;
  } catch {
    // Native module not available
  }
}

/**
 * Firestore のリモートアプリ設定（appConfig コレクション）を読むクライアント。
 *
 * 強制アップデート判定に使う。取得に失敗した場合は null を返し、
 * 呼び出し側はブロックしない（フェイルオープン）。
 */
export const appConfigClient = {
  async fetchMinSupportedVersion(): Promise<string | null> {
    if (!firestore) return null;
    try {
      const snapshot = await firestore().collection('appConfig').doc('ios').get();
      if (!snapshot.exists) return null;
      const value = snapshot.data()?.minSupportedVersion;
      return typeof value === 'string' ? value : null;
    } catch (error) {
      logger.warn('AppConfig', 'fetchMinSupportedVersion failed:', error);
      return null;
    }
  },
};
