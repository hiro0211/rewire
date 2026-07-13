import { useCallback, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { useScreenTimeStatus } from '@/hooks/settings/useScreenTimeStatus';
import { screenTimeBridge } from '@/lib/screenTime/screenTimeBridge';
import { useLocale } from '@/hooks/useLocale';
import { logger } from '@/lib/logger';

/**
 * ホーム画面のスクリーンタイム許可アラートカードの表示制御。
 *
 * 許可が未取得（notDetermined / denied）の間だけカードを表示し、
 * 「許可する」でネイティブの許可ダイアログを開く。許可されると
 * useScreenTimeStatus の AppState 監視・refreshStatus で自動的に消える。
 *
 * iOS の許可ダイアログは notDetermined のときにしか表示されないため、
 * すでに拒否済みの端末では「設定を開く」への誘導 Alert を出す。
 */
export function useScreenTimePermissionCard(): {
  visible: boolean;
  isRequesting: boolean;
  requestPermission: () => Promise<void>;
} {
  const { screenTimeStatus, refreshStatus } = useScreenTimeStatus();
  const [isRequesting, setIsRequesting] = useState(false);
  const { t } = useLocale();

  const visible = Platform.OS === 'ios' && screenTimeStatus !== 'approved';

  const requestPermission = useCallback(async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      const statusBefore = screenTimeBridge.getAuthorizationStatus();
      const result = await screenTimeBridge.requestAuthorization();
      refreshStatus();
      if (statusBefore === 'denied' && result.status !== 'approved') {
        Alert.alert(
          t('dashboard.screenTimePermissionCard.deniedTitle'),
          t('dashboard.screenTimePermissionCard.deniedMessage'),
          [
            { text: t('dashboard.screenTimePermissionCard.later'), style: 'cancel' },
            {
              text: t('dashboard.screenTimePermissionCard.openSettings'),
              onPress: () => {
                void Linking.openSettings();
              },
            },
          ],
        );
      }
    } catch (error) {
      logger.error('ScreenTimePermissionCard', 'requestPermission failed:', error);
    } finally {
      setIsRequesting(false);
    }
  }, [isRequesting, refreshStatus, t]);

  return { visible, isRequesting, requestPermission };
}
