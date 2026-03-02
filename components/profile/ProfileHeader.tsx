import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { BadgeOrb } from '@/components/achievements/BadgeOrb';
import { useAchievements } from '@/hooks/achievements/useAchievements';

export function ProfileHeader() {
  const router = useRouter();
  const { user } = useUserStore();
  const { unlocked } = useAchievements();
  const { colors } = useTheme();

  const latestBadge = unlocked.length > 0 ? unlocked[unlocked.length - 1] : null;

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('ja-JP', {
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
          style={styles.gearButton}
          onPress={() => router.push('/settings')}
          hitSlop={12}
        >
          <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          {latestBadge ? (
            <BadgeOrb badge={latestBadge} isUnlocked size="large" />
          ) : (
            <Ionicons name="person-circle-outline" size={96} color={colors.textSecondary} />
          )}
        </View>
        <Text style={[styles.nickname, { color: colors.text }]}>{user?.nickname || 'ユーザー'}</Text>
        {joinDate ? (
          <Text style={[styles.joinDate, { color: colors.textSecondary }]}>Rewire参加: {joinDate}</Text>
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
    padding: SPACING.xs,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    marginBottom: SPACING.sm,
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
