import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import {
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  LINE_HEIGHT,
} from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ToastProps {
  visible: boolean;
  message: string;
  testID?: string;
}

const FADE_DURATION = 200;

/**
 * 画面下部に一時表示する軽量トースト。表示制御は呼び出し側（useToast 等）が持つ。
 * visible が false になったらフェードアウト後にアンマウントする。
 */
export function Toast({ visible, message, testID }: ToastProps) {
  const { colors, shadows } = useTheme();
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(() => setRendered(false));
    }
  }, [visible, opacity]);

  // visible の間は即座に描画し、非表示化はフェードアウト完了まで残す
  if (!visible && !rendered) return null;

  return (
    <View style={styles.wrapper} pointerEvents="none" testID={testID}>
      <Animated.View
        style={[
          styles.toast,
          shadows.sheet,
          { backgroundColor: colors.surface, opacity },
        ]}
      >
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: SPACING.xxxl,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  toast: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    maxWidth: '100%',
  },
  message: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    lineHeight: LINE_HEIGHT.body,
    textAlign: 'center',
  },
});
