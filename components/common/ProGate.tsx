import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { useRouter } from 'expo-router'; // Will use later
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

interface ProGateProps {
  children: React.ReactNode;
  isPro?: boolean; // In MVP, this will come from store
  fallback?: React.ReactNode;
}

export function ProGate({ children, isPro = false, fallback }: ProGateProps) {
  if (isPro) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Rewire Pro</Text>
      <Text style={styles.description}>
        この機能を利用するには Pro へのアップグレードが必要です。
      </Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>詳細を見る</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.surfaceHighlight,
  },
  title: {
    color: COLORS.pro,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  description: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  button: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 999,
  },
  buttonText: {
    color: COLORS.pro,
    fontWeight: '600',
  },
});
