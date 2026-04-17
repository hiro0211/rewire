import { useTheme } from '@/hooks/useTheme';
import { hexToVec3 } from '@/lib/color/hexToVec3';
import { skiaOrbInit } from '@/lib/dashboard/skiaOrbInit';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

const { SkiaCanvas, SkiaFill, SkiaShader, runtimeEffect } = skiaOrbInit();

interface CoreOrbRendererProps {
    /** Hex 3色 [core, glow, accent] */
    colors: readonly [string, string, string];
    /** オーブの直径 (px) */
    size: number;
    /** シェーダーに渡す経過時間 (SharedValue) */
    time: SharedValue<number>;
    /** タップ時のグローブースト (optional) */
    glowBoost?: SharedValue<number>;
    testID?: string;
}

/**
 * Skia シェーダーによるオーブ描画と LinearGradient フォールバックの
 * 共通ロジックを一か所にまとめたプレゼンテーションコンポーネント。
 */
export function CoreOrbRenderer({
    colors,
    size,
    time,
    glowBoost,
    testID,
}: CoreOrbRendererProps) {
    const { isDark } = useTheme();

    const [c1, c2, c3] = colors;
    const [r1, g1, b1] = hexToVec3(c1);
    const [r2, g2, b2] = hexToVec3(c2);
    const [r3, g3, b3] = hexToVec3(c3);

    const uniforms = useDerivedValue(() => ({
        time: time.value,
        resolution: [size, size],
        color1: [r1, g1, b1],
        color2: [r2, g2, b2],
        color3: [r3, g3, b3],
        ...(glowBoost ? { glowBoost: glowBoost.value } : {}),
    }));

    const useSkia = isDark && runtimeEffect && SkiaCanvas && SkiaFill && SkiaShader;

    if (useSkia) {
        return (
            <SkiaCanvas style={{ width: size, height: size }} testID={testID ?? 'orb-canvas'}>
                <SkiaFill>
                    <SkiaShader source={runtimeEffect} uniforms={uniforms} />
                </SkiaFill>
            </SkiaCanvas>
        );
    }

    return (
        <View
            testID={testID ?? 'orb-fallback'}
            style={[styles.fallbackOrb, { width: size, height: size, borderRadius: size / 2 }]}
        >
            <LinearGradient
                colors={[...colors]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    fallbackOrb: {
        overflow: 'hidden',
    },
});
