import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export function BlurTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, glow, isDark } = useTheme();

  // Filter out routes without tabBarIcon (hidden tabs with href: null)
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options.tabBarIcon != null;
  });

  const handlePress = useCallback((route: typeof state.routes[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  }, [navigation]);

  return (
    <View
      style={[
        styles.outerContainer,
        { bottom: insets.bottom + 8 },
      ]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={isDark ? 60 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.pill,
          {
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
            shadowColor: isDark ? glow.cyan : 'rgba(0,0,0,0.15)',
          },
        ]}
      >
        <View style={styles.tabRow}>
          {visibleRoutes.map((route) => {
            const { options } = descriptors[route.key];
            const isFocused = state.routes[state.index].key === route.key;
            const color = isFocused ? colors.cyan : colors.textSecondary;
            const label = (options.tabBarLabel as string) ?? options.title ?? route.name;

            return (
              <Pressable
                key={route.key}
                style={[
                  styles.tab,
                  isFocused && {
                    shadowColor: glow.cyan,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 8,
                  },
                ]}
                onPress={() => handlePress(route)}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
              >
                {options.tabBarIcon?.({ color, size: 22, focused: isFocused })}
                <Text style={[styles.label, { color }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'stretch',
  },
  pill: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  tabRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 2,
    borderRadius: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});
