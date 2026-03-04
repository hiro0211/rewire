import React, { useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface TabItem {
  icon: string;
  label: string;
}

interface IOS18TabBarProps {
  tabs: TabItem[];
  selectedIndex: number;
  onChange: (index: number) => void;
  accentColor?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function TabButton({
  icon,
  label,
  isSelected,
  accentColor,
  onPress,
}: {
  icon: string;
  label: string;
  isSelected: boolean;
  accentColor: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(isSelected ? 1 : 0.8);
  const pillOpacity = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    const springConfig = { damping: 20, stiffness: 300 };
    scale.value = withSpring(isSelected ? 1 : 0.8, springConfig);
    pillOpacity.value = withSpring(isSelected ? 1 : 0, springConfig);
  }, [isSelected, scale, pillOpacity]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: pillOpacity.value,
  }));

  const color = isSelected ? accentColor : '#8E8E93';

  return (
    <Pressable style={styles.tab} onPress={onPress}>
      <Animated.View
        style={[
          styles.pill,
          { backgroundColor: isSelected ? hexToRgba(accentColor, 0.12) : 'transparent' },
          pillStyle,
        ]}
      />
      <View>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function IOS18TabBar({
  tabs,
  selectedIndex,
  onChange,
  accentColor = '#00D4FF',
}: IOS18TabBarProps) {
  const insets = useSafeAreaInsets();

  const handlePress = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(index);
  }, [onChange]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]} testID="ios18-tabbar">
      {tabs.map((tab, index) => (
        <TabButton
          key={tab.label}
          icon={tab.icon}
          label={tab.label}
          isSelected={index === selectedIndex}
          accentColor={accentColor}
          onPress={() => handlePress(index)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    width: '80%',
    height: '90%',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
});
