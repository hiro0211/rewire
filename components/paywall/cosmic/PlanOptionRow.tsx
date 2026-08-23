import Ionicons from '@expo/vector-icons/Ionicons';
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RADIO_SIZE = 24;

interface PlanOptionRowProps {
  testID: string;
  /** 「年額」「月額」など */
  label: string;
  /**
   * 主表示。**実際に請求される総額**を渡すこと。
   *
   * Apple の Auto-renewable Subscriptions ページ:
   * "the amount that will be billed must be the most prominent pricing element
   * in the layout" — 月換算をここに入れてはいけない。
   */
  priceMain: string;
  /**
   * 従属表示。月換算など、総額から計算した値を小さく添える。
   * 同ページ: "these additional elements should be displayed in a subordinate
   * position and size to the annual price"
   */
  priceSub?: string;
  /** 「34%お得」。無いときは出さない */
  badge?: string;
  selected: boolean;
  onPress: () => void;
}

/**
 * プラン1つ分の横長の行。左にラジオとプラン名、右に金額。
 *
 * 横並びカードではなく縦積みの行にしたのは、金額を右端で桁揃えできるから。
 * カードだと年額と月額の数字が別々の場所に出て、いくら違うのかが読み取れない。
 */
export function PlanOptionRow({
  testID,
  label,
  priceMain,
  priceSub,
  badge,
  selected,
  onPress,
}: PlanOptionRowProps) {
  const { colors, glow } = useTheme();

  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.row,
        selected
          ? { borderColor: glow.cyan, backgroundColor: colors.surfaceGlass }
          : { borderColor: colors.border, backgroundColor: 'transparent' },
      ]}
    >
      <Ionicons
        testID={selected ? `${testID}-checked` : `${testID}-unchecked`}
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={RADIO_SIZE}
        color={selected ? colors.cyan : colors.textSecondary}
      />
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>

      <View style={styles.priceBlock}>
        <Text
          testID={`${testID}-price-main`}
          style={[styles.priceMain, { color: colors.text }]}
        >
          {priceMain}
        </Text>
        {priceSub ? (
          <Text
            testID={`${testID}-price-sub`}
            style={[styles.priceSub, { color: colors.textSecondary }]}
          >
            {priceSub}
          </Text>
        ) : null}
      </View>

      {badge ? (
        <View style={[styles.badge, { backgroundColor: colors.cyan }]}>
          <Text style={[styles.badgeText, { color: colors.background }]}>{badge}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  label: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceMain: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.extrabold,
  },
  priceSub: {
    fontSize: FONT_SIZE.xs,
  },
  // 枠線にまたがせて「この行に付いた札」に見せる
  badge: {
    position: 'absolute',
    top: -10,
    right: SPACING.md,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
});
