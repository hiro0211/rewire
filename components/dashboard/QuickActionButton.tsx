import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { usePressAnimation } from '@/hooks/ui/usePressAnimation';
import { FONT_SIZE, SPACING } from '@/constants/theme';

interface QuickActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  testID?: string;
}

export function QuickActionButton({ icon, label, onPress, testID }: QuickActionButtonProps) {
  const { colors, isDark } = useTheme();
  const { onPressIn, onPressOut, animatedStyle } = usePressAnimation();

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]} testID={testID}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <View style={[styles.circle, { borderColor: colors.borderGlass }]}>
          {isDark ? (
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceGlass }]} />
          <Ionicons name={icon} size={24} color={colors.text} />
        </View>
        <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  touchable: {
    alignItems: 'center',
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
  },
});
