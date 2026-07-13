import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { screenTimeBridge } from '@/lib/screenTime/screenTimeBridge';
import { useScreenTimeStore } from '@/stores/screenTimeStore';
import { useLocale } from '@/hooks/useLocale';

interface UseShieldActivationResult {
  isBusy: boolean;
  activate: () => Promise<boolean>;
}

/**
 * ポルノブロック（App Shield）をオンにする共通ロジック。
 * プロフィールのパワーボタンと購入後オンボーディングのブロック開始ステップで共有する。
 * 触覚フィードバック（押下時 Heavy・成功時 Success）を含む。
 * 未認可の場合は許可ダイアログをフォールバックで起動し、拒否時は Alert を表示する。
 */
export function useShieldActivation(): UseShieldActivationResult {
  const [isBusy, setIsBusy] = useState(false);
  // 同一レンダー内での二重起動を防ぐ即時ガード（setState は再レンダーまで反映されないため）
  const busyRef = useRef(false);
  const selectionToken = useScreenTimeStore((s) => s.selectionToken);
  const markShielded = useScreenTimeStore((s) => s.markShielded);
  const { t } = useLocale();

  const activate = useCallback(async (): Promise<boolean> => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setIsBusy(true);
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const status = screenTimeBridge.getAuthorizationStatus();
      if (status !== 'approved') {
        const result = await screenTimeBridge.requestAuthorization();
        if (result.status !== 'approved') {
          Alert.alert(
            t('screenTime.deniedTitle'),
            t('screenTime.deniedDescription'),
          );
          return false;
        }
      }

      const ok = screenTimeBridge.applyAppShield(t, !!selectionToken);
      if (!ok) return false;

      await markShielded();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    } finally {
      busyRef.current = false;
      setIsBusy(false);
    }
  }, [selectionToken, markShielded, t]);

  return { isBusy, activate };
}
