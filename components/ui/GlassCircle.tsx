import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONT_SIZE } from '@/constants/theme';

interface GlassCircleProps {
  size?: number;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  testID?: string;
}

export function GlassCircle({ size = 80, iconName, label, onPress, testID }: GlassCircleProps) {
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable testID={testID} onPress={handlePress} style={styles.wrapper}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isDark ? colors.surfaceGlass : colors.surfaceGlass,
            borderColor: colors.borderGlass,
          },
        ]}
      >
        <Ionicons name={iconName} size={26} color={colors.text} />
      </View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  circle: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZE.xs,
  },
});
