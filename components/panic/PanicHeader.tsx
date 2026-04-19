import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';


interface PanicHeaderProps {
  onClose: () => void;
}

export function PanicHeader({ onClose }: PanicHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <Pressable
        testID="panic-header-close"
        onPress={onClose}
        style={styles.closeButton}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <Ionicons name="close" size={22} color={colors.contrastText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  spacer: {
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
});
