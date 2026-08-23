import { AnimatedOrb } from '@/components/dashboard/AnimatedOrb';
import type { BadgeId } from '@/constants/badges/BadgeId';
import { HERO_ORB_SIZE, HERO_PLANET_FADE_MS } from '@/constants/paywall/heroPlanets';
import { useHeroPlanetCycle } from '@/hooks/paywall/useHeroPlanetCycle';
import { getBadgeById } from '@/lib/paywall/journeyBadge';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

/**
 * 上下から詰める割合（HERO_ORB_SIZE に対する比）。
 * AnimatedOrb の箱は size の2倍で、天体本体の外側に size/2 ずつ透明域がある。
 * 0.15 はその透明域の 30% を詰める控えめな値（120 × 0.15 = 上下 18pt ずつ）。
 */
const HERO_VERTICAL_TRIM = 0.15;

interface CosmicHeroOrbProps {
  /** 指定すると巡回を止めてその天体に固定する */
  badgeId?: BadgeId;
}

/**
 * ペイウォール最上部の主役天体。月から太陽まで、到達順に一定間隔で入れ替わる。
 *
 * なぜ巡回させるか: 静止した1つの天体だと「アプリのロゴ」に見える。
 * 次々と別の惑星が現れることで、下の「星の旅」カードが約束している道のりが
 * 説明を読む前に伝わる。
 *
 * なぜ AnimatedOrb か: 呼吸とグローが動くと生きている対象に見え、続きを読ませる
 * 引きになる。StaticOrb を使わないのはトラック側の天体と testID が衝突して
 * 数が数えられなくなるため。
 */
export function CosmicHeroOrb({ badgeId }: CosmicHeroOrbProps) {
  const cycledBadgeId = useHeroPlanetCycle();
  const badge = getBadgeById(badgeId ?? cycledBadgeId);

  // 切り替えの瞬間をフェードで隠す。素で差し替えるとテクスチャの読み込みが
  // 一瞬フォールバックの単色グラデーションとして見え、ちらつく。
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: HERO_PLANET_FADE_MS });
  }, [badge.id, opacity]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View
      testID="cosmic-hero-orb"
      style={[
        styles.container,
        // AnimatedOrb はグローとパーティクルのために size の2倍（=240pt）の箱を取るが、
        // その外周は大部分が透明。負マージンで透明な縁だけを詰める（描画は切らない）。
        // ⚠️ 係数は実機で目視して決めること。グローが欠けて見えたら小さくする。
        {
          marginTop: -HERO_ORB_SIZE * HERO_VERTICAL_TRIM,
          marginBottom: -HERO_ORB_SIZE * HERO_VERTICAL_TRIM,
        },
      ]}
    >
      <Animated.View style={fadeStyle}>
        {/*
          ⚠️ key を付けて作り直してはいけない。AnimatedOrb は Skia キャンバス・
          パーティクル・SVGグロー・useFrameCallback・AppState 購読を内包する重い木で、
          3秒ごとに丸ごと張り替えると reanimated の共有値とアニメーションが
          その頻度で生成・破棄され続ける（実機でメモリが膨らみ、スタックが
          UpdatesRegistry に張り付く状態を作った）。
          PlanetOrbRenderer は useImage(getPlanetTexture(badgeId)) で badgeId の
          変化に追従するので、載せ替えは prop の更新だけで足りる。
        */}
        <AnimatedOrb
          colors={badge.colors}
          chapterId={badge.chapter}
          badgeId={badge.id}
          size={HERO_ORB_SIZE}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
