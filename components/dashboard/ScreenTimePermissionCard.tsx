import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SPACING, FONT_SIZE, RADIUS, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useScreenTimePermissionCard } from '@/hooks/dashboard/useScreenTimePermissionCard';

const ALERT_RED = '#C0433E';
const ALERT_RED_BG = 'rgba(192, 67, 62, 0.10)';
const ALERT_RED_BORDER = 'rgba(192, 67, 62, 0.45)';
const ICON_BG = 'rgba(192, 67, 62, 0.18)';

/**
 * スクリーンタイム許可が未取得のときだけホーム画面に出すアラートカード。
 * 「許可する」でネイティブの許可ダイアログを開く。
 */
export function ScreenTimePermissionCard() {
  const { visible, isRequesting, requestPermission } = useScreenTimePermissionCard();
  const { colors } = useTheme();
  const { t } = useLocale();

  if (!visible) return null;

  return (
    <View
      style={[styles.card, { backgroundColor: ALERT_RED_BG, borderColor: ALERT_RED_BORDER }]}
      testID="screen-time-permission-card"
    >
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: ICON_BG }]}>
          <Ionicons name="lock-closed" size={22} color={ALERT_RED} />
        </View>
        <View style={styles.textArea}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('dashboard.screenTimePermissionCard.title')}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('dashboard.screenTimePermissionCard.description')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.allowButton, { backgroundColor: ALERT_RED }]}
        onPress={requestPermission}
        disabled={isRequesting}
        activeOpacity={0.8}
        testID="screen-time-permission-allow"
      >
        {isRequesting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="arrow-forward-circle" size={20} color="#FFFFFF" />
            <Text style={styles.allowButtonText}>
              {t('dashboard.screenTimePermissionCard.allow')}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    gap: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    lineHeight: LINE_HEIGHT.sm,
  },
  allowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  allowButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
});
