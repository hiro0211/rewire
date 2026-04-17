import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { useStreak } from '@/hooks/dashboard/useStreak';
import { AnimatedOrb } from '@/components/dashboard/AnimatedOrb';
import { getBadgeByDay } from '@/lib/badges/getBadgeByDay';

export function ProfileHeader() {
  const router = useRouter();
  const { user } = useUserStore();
  const { streak } = useStreak();
  const { colors } = useTheme();
  const { t, isJapanese } = useLocale();

  const badge = getBadgeByDay(streak);

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(isJapanese ? 'ja-JP' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.spacer} />
        <TouchableOpacity
          testID="profile-gear-button"
          style={[
            styles.gearButton,
            { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass },
          ]}
          onPress={() => router.push('/settings')}
          hitSlop={12}
        >
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <AnimatedOrb chapterId={badge.chapter} size={120} />
        </View>
        <Text style={[styles.gradeName, { color: colors.primary }]}>
          {isJapanese ? badge.nameJa : badge.nameEn}
        </Text>
        <Text style={[styles.nickname, { color: colors.text }]}>{user?.nickname || t('profile.defaultName')}</Text>
        {joinDate ? (
          <Text style={[styles.joinDate, { color: colors.textSecondary }]}>{t('profile.joinDate', { date: joinDate })}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  spacer: {
    flex: 1,
  },
  gearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    marginBottom: SPACING.sm,
  },
  gradeName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  nickname: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: FONT_SIZE.sm,
  },
});
