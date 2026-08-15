import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DeviceActivitySelectionSheetView } from 'react-native-device-activity';
import {
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  LINE_HEIGHT,
} from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useScreenTimeStore } from '@/stores/screenTimeStore';
import { screenTimeBridge } from '@/lib/screenTime/screenTimeBridge';
import { useScreenTimeSetup } from '@/hooks/screenTime/useScreenTimeSetup';
import { useShieldActivation } from '@/hooks/screenTime/useShieldActivation';
import { useBlockerAnalytics } from '@/hooks/screenTime/useBlockerAnalytics';
import { useToast } from '@/hooks/ui/useToast';
import { Toast } from '@/components/ui/Toast';
import { BlockerPowerButton } from './BlockerPowerButton';
import { BreathingGateModal } from './BreathingGateModal';

export function ContentBlockerPanel() {
  const { colors } = useTheme();
  const { t } = useLocale();

  const enabled = useScreenTimeStore((s) => s.enabled);
  const selectionToken = useScreenTimeStore((s) => s.selectionToken);
  const selectionApplicationCount = useScreenTimeStore(
    (s) => s.selectionApplicationCount,
  );
  const markCleared = useScreenTimeStore((s) => s.markCleared);

  // オンにする処理（許可フォールバック＋シールド適用＋触覚）は共通フックに委譲する
  const { isBusy: isActivating, activate } = useShieldActivation();
  const analytics = useBlockerAnalytics();
  const toast = useToast();
  // オフにする処理は深呼吸ゲート確認後にこのパネル内で行う
  const [isClearing, setIsClearing] = useState(false);
  const isBusy = isActivating || isClearing;

  // ブラウザ/アプリ選択ピッカーはこのパネル内で完結させる（専用の設定画面は廃止）
  const {
    step,
    pendingSelection,
    startSetup,
    handlePickerChange,
    finalizePicker,
    cancelPicker,
  } = useScreenTimeSetup();

  // オフ操作の前に深呼吸ゲート（3回呼吸→確認）を挟む
  const [gateVisible, setGateVisible] = useState(false);

  // 許可拒否・エラーはネイティブ Alert で通知する
  useEffect(() => {
    if (step === 'denied') {
      Alert.alert(
        t('screenTime.deniedTitle'),
        t('screenTime.deniedDescription'),
      );
    } else if (step === 'error') {
      Alert.alert(t('screenTime.errorTitle'), t('screenTime.errorDescription'));
    }
  }, [step, t]);

  const handlePowerPress = useCallback(async () => {
    if (isBusy) return;
    if (enabled) {
      // 即オフにせず、深呼吸ゲートを通してから確認する
      // ここで送るのは「やめたくなった瞬間」。この後 confirmed / cancelled の
      // どちらに転んだかと突き合わせて、ゲートの引き止め率を出す。
      analytics.trackDisableRequested();
      setGateVisible(true);
      return;
    }
    const ok = await activate();
    if (ok) {
      analytics.trackEnabled('settings');
      toast.show();
    }
  }, [isBusy, enabled, activate, toast, analytics]);

  const handleGateConfirm = useCallback(async () => {
    setGateVisible(false);
    if (isClearing) return;
    setIsClearing(true);
    try {
      const ok = screenTimeBridge.clearAppShield(!!selectionToken);
      if (ok) {
        // markCleared より先に送る。経過時間の元になる lastShieldedAt を
        // 読んでいるため、順序を入れ替えるときは注意すること。
        analytics.trackDisableConfirmed();
        await markCleared();
      }
    } finally {
      setIsClearing(false);
    }
  }, [isClearing, selectionToken, markCleared, analytics]);

  const handleGateCancel = useCallback(() => {
    analytics.trackDisableCancelled();
    setGateVisible(false);
  }, [analytics]);

  const handleBlockApps = useCallback(() => {
    void startSetup();
  }, [startSetup]);

  const powerLabel = enabled
    ? t('contentBlocker.statusActive')
    : t('contentBlocker.statusInactive');
  const powerDescription = enabled
    ? t('contentBlocker.descriptionActive')
    : t('contentBlocker.descriptionInactive');

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface }]}
      testID="content-blocker-panel"
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        {t('contentBlocker.heading')}
      </Text>

      <Text style={[styles.status, { color: colors.textSecondary }]}>
        {powerLabel}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {powerDescription}
      </Text>

      <BlockerPowerButton
        testID="content-blocker-power-button"
        enabled={enabled}
        isBusy={isBusy}
        onPress={handlePowerPress}
      />

      <TouchableOpacity
        style={[styles.actionRow, { borderColor: colors.surfaceHighlight }]}
        onPress={handleBlockApps}
        activeOpacity={0.7}
        testID="content-blocker-block-apps"
      >
        <View
          style={[styles.actionIcon, { backgroundColor: 'rgba(139,92,246,0.15)' }]}
        >
          <Ionicons name="hand-left-outline" size={20} color="#8B5CF6" />
        </View>
        <View style={styles.actionTextArea}>
          <Text style={[styles.actionTitle, { color: colors.text }]}>
            {t('contentBlocker.blockApps')}
          </Text>
          <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
            {selectionApplicationCount > 0
              ? t('contentBlocker.blockAppsCount', {
                  count: selectionApplicationCount,
                })
              : t('contentBlocker.blockAppsNone')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <BreathingGateModal
        visible={gateVisible}
        onConfirm={handleGateConfirm}
        onCancel={handleGateCancel}
      />

      {step === 'picking' && Platform.OS === 'ios' && (
        <Modal
          transparent
          animationType="slide"
          onRequestClose={() => {
            if (pendingSelection) {
              void finalizePicker();
            } else {
              cancelPicker();
            }
          }}
        >
          <View style={styles.pickerOverlay} testID="screen-time-picker-overlay">
            <DeviceActivitySelectionSheetView
              style={styles.pickerSheet}
              familyActivitySelection={
                pendingSelection?.familyActivitySelection ?? null
              }
              onSelectionChange={(event) => {
                const sel = event.nativeEvent.familyActivitySelection ?? '';
                const count =
                  (event.nativeEvent.applicationCount ?? 0) +
                  (event.nativeEvent.categoryCount ?? 0);
                handlePickerChange(sel, count);
              }}
              onDismissRequest={() => {
                if (pendingSelection) {
                  void finalizePicker();
                } else {
                  cancelPicker();
                }
              }}
            />
          </View>
        </Modal>
      )}

      <Toast
        visible={toast.visible}
        message={t('contentBlocker.activatedToast')}
        testID="content-blocker-toast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.screenPadding,
    marginVertical: SPACING.md,
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  heading: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.md,
  },
  status: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    lineHeight: LINE_HEIGHT.body,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextArea: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  actionSubtitle: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerSheet: {
    flex: 1,
    marginTop: 80,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
