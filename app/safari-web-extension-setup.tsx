import React from 'react';
import { StyleSheet } from 'react-native';
import { SPACING } from '@/constants/theme';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { SafariSetupContent } from '@/components/safari-web-extension/SafariSetupContent';

export default function SafariWebExtensionSetupScreen() {
  return (
    <SafeAreaWrapper style={styles.container}>
      <SafariSetupContent />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.lg },
});
