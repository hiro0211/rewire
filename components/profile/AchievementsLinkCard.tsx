import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_SIZE, RADIUS, SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface AchievementsLinkCardProps {
  unlocked: number;
  total: number;
  onPress: () => void;
}

/**
 * プロフィール画面の主要アクション「Achievements」リンクカード。
 * 画面背景（紫系グラデーション）と明確に分離させるため、
 * solid surface + cyan アクセントボーダー + cyan glow で「押せる」ことを伝える。
 */
export function AchievementsLinkCard({ unlocked, total, onPress }: AchievementsLinkCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      testID="achievements-link-card"
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: 'rgba(0, 212, 255, 0.45)',
          shadowColor: colors.cyan,
        },
      ]}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Achievements</Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {unlocked}/{total} Unlocked
        </Text>
      </View>
      <Ionicons
        testID="achievements-link-chevron"
        name="chevron-forward"
        size={20}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  count: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
});
