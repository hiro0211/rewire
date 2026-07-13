import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SPACING, FONT_SIZE, FONT_WEIGHT } from '@/constants/theme';

interface PermissionArrowProps {
  /** ガイド文言（例: 「続ける」をタップ） */
  hint: string;
  color?: string;
}

/**
 * ネイティブのスクリーンタイム許可ダイアログの「続ける」ボタンへ向かって上下に
 * バウンスする誘導矢印。ネイティブダイアログはアプリ View の上に別ウィンドウで
 * 表示されるため矢印を重ねられない。Focusity 同様、ダイアログ下の余白に描画して
 * 上方向（左ボタン側）を指す。位置はデバイス依存で厳密一致は不可能なため、
 * ARROW_LEFT_RATIO / ARROW_BOTTOM のオフセットで近似配置している（実機で微調整可）。
 */

// iOS 標準2ボタンアラートの左「続ける」ボタンは画面中央よりやや左に来る。
const ARROW_LEFT_RATIO = 0.22; // 画面幅に対する左からの位置
const ARROW_BOTTOM = 160; // ダイアログ下端の余白に収まる高さ

export function PermissionArrow({ hint, color = '#8B5CF6' }: PermissionArrowProps) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-14, { duration: 650, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [translateY]);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View testID="permission-arrow" pointerEvents="none" style={styles.wrapper}>
      <Animated.View style={bounceStyle}>
        <Ionicons name="chevron-up" size={56} color={color} />
      </Animated.View>
      <Text style={[styles.hint, { color }]}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: ARROW_BOTTOM,
    left: `${ARROW_LEFT_RATIO * 100}%`,
    alignItems: 'center',
  },
  hint: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
