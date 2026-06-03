import React, { useCallback } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { ja } from 'date-fns/locale/ja';
import { enUS } from 'date-fns/locale/en-US';
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

export function BrowserShieldToggleCard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, isJapanese } = useLocale();

  const enabled = useScreenTimeStore((s) => s.enabled);
  const selectionToken = useScreenTimeStore((s) => s.selectionToken);
  const selectionApplicationCount = useScreenTimeStore(
    (s) => s.selectionApplicationCount,
  );
  const lastShieldedAt = useScreenTimeStore((s) => s.lastShieldedAt);
  const lastClearedAt = useScreenTimeStore((s) => s.lastClearedAt);
  const markShielded = useScreenTimeStore((s) => s.markShielded);
  const markCleared = useScreenTimeStore((s) => s.markCleared);

  const handleToggle = useCallback(
    async (next: boolean) => {
      if (next) {
        if (!selectionToken) {
          router.push('/screen-time-setup');
          return;
        }
        const ok = screenTimeBridge.applyAppShield(t);
        if (ok) await markShielded();
      } else {
        const ok = screenTimeBridge.clearAppShield();
        if (ok) await markCleared();
      }
    },
    [selectionToken, router, t, markShielded, markCleared],
  );

  const handleChangeBrowsers = useCallback(() => {
    router.push('/screen-time-setup');
  }, [router]);

  const locale = isJapanese ? ja : enUS;
  const lastChangedAt = enabled ? lastShieldedAt : lastClearedAt;
  const lastChangedLabel = lastChangedAt
    ? formatDistanceToNow(new Date(lastChangedAt), { addSuffix: true, locale })
    : null;

  const streakDays =
    enabled && lastShieldedAt
      ? Math.floor((Date.now() - lastShieldedAt) / (1000 * 60 * 60 * 24))
      : null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.surfaceHighlight },
      ]}
      testID="browser-shield-toggle-card"
    >
      <View style={styles.row}>
        <View style={styles.titleArea}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('screenTime.toggleTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {selectionApplicationCount > 0
              ? t('screenTime.targetCount', {
                  count: selectionApplicationCount,
                })
              : t('screenTime.targetNone')}
          </Text>
        </View>
        <Switch
          testID="browser-shield-toggle-switch"
          value={enabled}
          onValueChange={handleToggle}
          trackColor={{
            false: colors.surfaceHighlight,
            true: colors.primary,
          }}
          thumbColor={colors.surface}
          ios_backgroundColor={colors.surfaceHighlight}
        />
      </View>

      {lastChangedLabel && (
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {t('screenTime.lastChangedAt', { time: lastChangedLabel })}
        </Text>
      )}

      {streakDays !== null && streakDays > 0 && (
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {t('screenTime.streakDays', { days: streakDays })}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.changeButton, { borderColor: colors.surfaceHighlight }]}
        onPress={handleChangeBrowsers}
        activeOpacity={0.7}
        testID="browser-shield-change-targets"
      >
        <Ionicons name="apps-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.changeButtonLabel, { color: colors.text }]}>
          {t('screenTime.changeTargets')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.screenPadding,
    marginVertical: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleArea: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    lineHeight: LINE_HEIGHT.sm,
  },
  meta: {
    fontSize: FONT_SIZE.sm,
    lineHeight: LINE_HEIGHT.sm,
  },
  changeButton: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    alignSelf: 'flex-start',
  },
  changeButtonLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
});
