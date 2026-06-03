import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  Linking,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
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
import { appRemovalBridge } from '@/lib/screenTime/appRemovalBridge';

export function UninstallLockCard() {
  const { colors } = useTheme();
  const { t } = useLocale();

  const removalLocked = useScreenTimeStore((s) => s.removalLocked);
  const markRemovalLocked = useScreenTimeStore((s) => s.markRemovalLocked);
  const markRemovalUnlocked = useScreenTimeStore((s) => s.markRemovalUnlocked);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const handleToggle = useCallback(
    async (next: boolean) => {
      if (isBusy) return;
      if (next) {
        setIsBusy(true);
        try {
          const ok = await appRemovalBridge.lock();
          if (ok) await markRemovalLocked();
        } finally {
          setIsBusy(false);
        }
      } else {
        // 設計判断（信頼第一・案A）: 「設定のスクリーンタイムアクセスで Rewire を OFF」
        // が唯一の解除動線であることをユーザーに明示。アプリ内 OFF タップは
        // unlock を呼ばずに情報モーダルを開く。
        setShowInfoModal(true);
      }
    },
    [isBusy, markRemovalLocked],
  );

  const handleOpenSettings = useCallback(async () => {
    setShowInfoModal(false);
    try {
      await Linking.openURL('App-Prefs:SCREEN_TIME');
    } catch {
      // Fallback to general Settings if the Screen Time deep link is unavailable.
      try {
        await Linking.openSettings();
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSyncAfterRevoke = useCallback(async () => {
    setShowInfoModal(false);
    const stillLocked = await appRemovalBridge.isLocked();
    if (!stillLocked) {
      await markRemovalUnlocked();
    }
  }, [markRemovalUnlocked]);

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface }]}
      testID="uninstall-lock-card"
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed" size={20} color="#FF3B3B" />
        </View>
        <View style={styles.titleArea}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('uninstallLock.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {removalLocked
              ? t('uninstallLock.statusOn')
              : t('uninstallLock.statusOff')}
          </Text>
        </View>
        <Switch
          testID="uninstall-lock-switch"
          value={removalLocked}
          onValueChange={handleToggle}
          disabled={isBusy}
          trackColor={{
            false: colors.surfaceHighlight,
            true: '#FF3B3B',
          }}
          thumbColor={colors.surface}
          ios_backgroundColor={colors.surfaceHighlight}
        />
      </View>

      {removalLocked && (
        <Text style={[styles.helper, { color: colors.textSecondary }]}>
          {t('uninstallLock.helperOn')}
        </Text>
      )}

      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[styles.modalCard, { backgroundColor: colors.surface }]}
            testID="uninstall-lock-info-modal"
          >
            <Ionicons name="information-circle" size={36} color="#FF3B3B" />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('uninstallLock.unlockModalTitle')}
            </Text>
            <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
              {t('uninstallLock.unlockModalSteps')}
            </Text>
            <TouchableOpacity
              style={[styles.modalPrimary, { backgroundColor: '#8B5CF6' }]}
              onPress={handleOpenSettings}
              activeOpacity={0.8}
              testID="uninstall-lock-open-settings"
            >
              <Text style={styles.modalPrimaryLabel}>
                {t('uninstallLock.openSettings')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSecondary}
              onPress={handleSyncAfterRevoke}
              activeOpacity={0.7}
              testID="uninstall-lock-sync"
            >
              <Text
                style={[styles.modalSecondaryLabel, { color: colors.text }]}
              >
                {t('uninstallLock.alreadyRevoked')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSecondary}
              onPress={() => setShowInfoModal(false)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.modalSecondaryLabel,
                  { color: colors.textSecondary },
                ]}
              >
                {t('uninstallLock.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.screenPadding,
    marginVertical: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,59,59,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  helper: {
    fontSize: FONT_SIZE.sm,
    lineHeight: LINE_HEIGHT.sm,
    marginTop: SPACING.xs,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: FONT_SIZE.md,
    lineHeight: LINE_HEIGHT.body,
    textAlign: 'center',
  },
  modalPrimary: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  modalPrimaryLabel: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  modalSecondary: {
    paddingVertical: SPACING.sm,
  },
  modalSecondaryLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
});
