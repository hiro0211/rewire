import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

export function SOSButton() {
  const router = useRouter();

  const handlePress = () => {
    analyticsClient.logEvent('sos_tapped');
    router.push('/breathing');
  };

  return (
    <TouchableOpacity
      testID="panic-button"
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="warning" size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.text}>ポルノを見たくなったら</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.lg,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
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
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: FONT_SIZE.md,
  },
});
