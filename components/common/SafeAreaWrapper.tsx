import React from 'react';
import { View, StyleSheet, StatusBar, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SafeAreaWrapper({ children, style }: SafeAreaWrapperProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top, paddingBottom: insets.bottom },
      style
    ]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
