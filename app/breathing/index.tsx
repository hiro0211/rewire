import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BreathingCircle } from '@/components/breathing/BreathingCircle';
import { BreathingText } from '@/components/breathing/BreathingText';
import { CycleIndicator } from '@/components/breathing/CycleIndicator';
import { useBreathingEngine } from '@/hooks/breathing/useBreathingEngine';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
// import { Ionicons } from '@expo/vector-icons';

export default function BreathingScreen() {
  const router = useRouter();
  const { phase, cycleCount, startSession, stopSession } = useBreathingEngine();

  useEffect(() => {
    analyticsClient.logEvent('breathing_started');
    startSession();
    return () => stopSession();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient
        colors={['#0f172a', '#1e293b']} // Dark gradient
        style={styles.background}
      />
      
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => router.back()}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      <View style={styles.center}>
        <BreathingText phase={phase} />
        <BreathingCircle phase={phase} />
        <CycleIndicator currentCycle={cycleCount} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: SPACING.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  closeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 24,
    lineHeight: 28,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
