import React from 'react';
import { StyleSheet, StatusBar, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom')[];
}

export function SafeAreaWrapper({ children, style, edges }: SafeAreaWrapperProps) {
  const insets = useSafeAreaInsets();
  const { colors, gradients, isDark } = useTheme();

  const gradientColors: [string, string, ...string[]] =
    Array.isArray(gradients?.background) && gradients.background.length >= 2
      ? (gradients.background as [string, string, ...string[]])
      : [colors.background, colors.background];

  return (
    <LinearGradient
      colors={gradientColors}
      style={[
        styles.container,
        {
          paddingTop: !edges || edges.includes('top') ? insets.top : 0,
          paddingBottom: !edges || edges.includes('bottom') ? insets.bottom : 0,
        },
        style,
      ]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
