import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafariSetupContent } from '@/components/safari-web-extension/SafariSetupContent';

interface SafariSetupStepProps {
  onComplete: () => void;
}

export function SafariSetupStep({ onComplete }: SafariSetupStepProps) {
  return (
    <View style={styles.container}>
      <SafariSetupContent showHeader={false} onComplete={onComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
