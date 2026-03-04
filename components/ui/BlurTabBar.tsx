import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export function BlurTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

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
    <View style={[styles.container, { paddingBottom: insets.bottom, backgroundColor: isDark ? 'rgba(13,13,20,0.92)' : 'rgba(245,245,247,0.92)' }]}>
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <View style={styles.tabRow}>
        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const isFocused = state.routes[state.index].key === route.key;
          const color = isFocused ? colors.cyan : colors.textSecondary;
          const label = (options.tabBarLabel as string) ?? options.title ?? route.name;

          return (
            <Pressable
              key={route.key}
              style={styles.tab}
              onPress={() => handlePress(route)}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              {options.tabBarIcon?.({ color, size: 24, focused: isFocused })}
              <Text style={[styles.label, { color }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  separator: {
    height: 0.5,
  },
  tabRow: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
});
