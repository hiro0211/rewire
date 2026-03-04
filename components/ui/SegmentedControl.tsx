import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

const PADDING = 2;

export function SegmentedControl({ segments, selectedIndex, onChange }: SegmentedControlProps) {
  const { colors, isDark } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);

  const segmentWidth = containerWidth > 0
    ? (containerWidth - PADDING * 2) / segments.length
    : 0;

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setContainerWidth(width);
    const sw = (width - PADDING * 2) / segments.length;
    translateX.value = selectedIndex * sw;
  }, [segments.length, selectedIndex, translateX]);

  const handlePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    translateX.value = withSpring(index * segmentWidth, {
      damping: 20,
      stiffness: 300,
      overshootClamping: true,
    });
    onChange(index);
  }, [segmentWidth, onChange, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const containerBg = isDark ? '#2C2C2E' : colors.surfaceHighlight;
  const indicatorBg = isDark ? '#48484A' : colors.surface;
  const selectedColor = isDark ? '#FFFFFF' : colors.text;
  const unselectedColor = colors.textSecondary;

  return (
    <View
      style={[styles.container, { backgroundColor: containerBg }]}
      onLayout={handleLayout}
    >
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            { width: segmentWidth, height: '100%', backgroundColor: indicatorBg },
            indicatorStyle,
          ]}
        />
      )}
      {segments.map((segment, index) => (
        <Pressable
          key={segment}
          style={[styles.segment, { width: segmentWidth > 0 ? segmentWidth : undefined, flex: segmentWidth > 0 ? undefined : 1 }]}
          onPress={() => handlePress(index)}
        >
          <Text style={[
            styles.text,
            { color: index === selectedIndex ? selectedColor : unselectedColor },
            index === selectedIndex ? styles.textSelectedWeight : styles.textUnselectedWeight,
          ]}>
            {segment}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    height: 32,
    marginHorizontal: 16,
    padding: PADDING,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
    borderRadius: 7,
  },
  segment: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
  },
  textSelectedWeight: {
    fontWeight: '600',
  },
  textUnselectedWeight: {
    fontWeight: '500',
  },
});
