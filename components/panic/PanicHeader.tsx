import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';

interface PanicHeaderProps {
  onClose: () => void;
}

export function PanicHeader({ onClose }: PanicHeaderProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <Text style={[styles.logo, { color: colors.contrastText }]}>Rewire</Text>
      <Text style={styles.label}>{t('panic.title')}</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  logo: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    letterSpacing: 1,
  },
  label: {
    color: '#EF4444',
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
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
