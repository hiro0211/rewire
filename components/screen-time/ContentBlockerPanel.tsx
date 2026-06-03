import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
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
import { screenTimeBridge } from '@/lib/screenTime/screenTimeBridge';

const ACTIVE_COLOR = '#3DD68C';
const INACTIVE_COLOR = '#FF3B3B';

export function ContentBlockerPanel() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();

  const enabled = useScreenTimeStore((s) => s.enabled);
  const selectionToken = useScreenTimeStore((s) => s.selectionToken);
  const selectionApplicationCount = useScreenTimeStore(
    (s) => s.selectionApplicationCount,
  );
  const markShielded = useScreenTimeStore((s) => s.markShielded);
  const markCleared = useScreenTimeStore((s) => s.markCleared);

  const [isBusy, setIsBusy] = useState(false);

  const handlePowerPress = useCallback(async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      const hasSelection = !!selectionToken;
      if (enabled) {
        const ok = screenTimeBridge.clearAppShield(hasSelection);
        if (ok) await markCleared();
      } else {
        const status = screenTimeBridge.getAuthorizationStatus();
        if (status !== 'approved') {
          const result = await screenTimeBridge.requestAuthorization();
          if (result.status !== 'approved') {
            router.push('/screen-time-setup');
            return;
          }
        }
        const ok = screenTimeBridge.applyAppShield(t, hasSelection);
        if (ok) await markShielded();
      }
    } finally {
      setIsBusy(false);
    }
  }, [
    isBusy,
    enabled,
    selectionToken,
    router,
    t,
    markShielded,
    markCleared,
  ]);

  const handleBlockApps = useCallback(() => {
    router.push('/screen-time-setup');
  }, [router]);

  const statusColor = enabled ? ACTIVE_COLOR : INACTIVE_COLOR;
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

      <TouchableOpacity
        testID="content-blocker-power-button"
        style={[
          styles.powerButton,
          {
            backgroundColor: statusColor,
            shadowColor: statusColor,
          },
        ]}
        onPress={handlePowerPress}
        disabled={isBusy}
        activeOpacity={0.8}
      >
        {isBusy ? (
          <ActivityIndicator color="#FFFFFF" size="large" />
        ) : (
          <Ionicons name="power" size={56} color="#FFFFFF" />
        )}
      </TouchableOpacity>

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
  powerButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    marginVertical: SPACING.lg,
    elevation: 8,
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
});
