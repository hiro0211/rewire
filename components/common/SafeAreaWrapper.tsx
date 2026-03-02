import React from 'react';
import { View, StyleSheet, StatusBar, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SafeAreaWrapper({ children, style }: SafeAreaWrapperProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom },
      style
    ]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
