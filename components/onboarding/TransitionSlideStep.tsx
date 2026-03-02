import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export const TransitionSlideStep = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View
        testID="icon-container"
        style={[styles.iconContainer, {
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          shadowColor: 'rgba(139, 92, 246, 0.3)',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 20,
          elevation: 8,
        }]}
      >
        <Ionicons
          testID="warning-icon"
          name="warning-outline"
          size={56}
          color={colors.warning}
        />
      </View>

      <Text style={[styles.mainText, { color: colors.text }]}>
        {'ではポルノに毒されると、\n何が起きるのか？'}
      </Text>

      <Text style={[styles.hookText, { color: colors.textSecondary }]}>
        具体的にみてみましょう。
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  mainText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: SPACING.lg,
  },
  hookText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
  },
});
