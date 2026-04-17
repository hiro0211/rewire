import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_SIZE, SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface AchievementsHeaderProps {
  onClose: () => void;
}

/**
 * Achievements 画面のカスタムヘッダー。
 * 左に X ボタン、中央に "Achievements" タイトル。
 */
export function AchievementsHeader({ onClose }: AchievementsHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID="achievements-header-close"
        onPress={onClose}
        activeOpacity={0.7}
        style={[
          styles.closeButton,
          { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass },
        ]}
        hitSlop={8}
      >
        <Ionicons name="close" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.text }]}>Achievements</Text>

      <View style={styles.rightSpacer} />
    </View>
  );
}

const BUTTON_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.sm,
  },
  closeButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  rightSpacer: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
});
