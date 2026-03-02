import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

export function SOSButton() {
  const router = useRouter();
  const { colors, gradients, glow } = useTheme();

  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    analyticsClient.logEvent('sos_tapped');
    router.push('/breathing');
  };

  return (
    <TouchableOpacity
      testID="panic-button"
      style={[styles.container, {
        shadowColor: glow.danger,
      }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[...gradients.danger]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="warning" size={20} color={colors.contrastText} />
        </View>
        <Text style={[styles.text, { color: colors.contrastText }]}>ポルノを見たくなったら</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: FONT_SIZE.md,
  },
});
