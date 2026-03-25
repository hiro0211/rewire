import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { GradientCard } from '@/components/ui/GradientCard';
import { useCheckinStore } from '@/stores/checkinStore';
import { subDays, format } from 'date-fns';

const PAD_X = 12;
const PAD_Y = 16;
const CHART_HEIGHT = 100;

function buildPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
}

interface CheckinTrendCardProps {
  days?: number;
}

export function CheckinTrendCard({ days = 30 }: CheckinTrendCardProps) {
  const { colors, glow } = useTheme();
  const { t } = useLocale();
  const { checkins } = useCheckinStore();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const chartWidth = screenWidth - SPACING.lg * 2 - 32;
  const innerWidth = chartWidth - PAD_X * 2;
  const innerHeight = CHART_HEIGHT - PAD_Y * 2;

  const today = new Date();
  const dateLabels = Array.from({ length: days }, (_, i) =>
    format(subDays(today, days - 1 - i), 'yyyy-MM-dd'),
  );

  const qualityRaw = dateLabels.map((date) => {
    const entry = checkins.find((c) => c.date === date);
    return entry ? entry.qualityOfLife : null;
  });

  const urgencyRaw = dateLabels.map((date) => {
    const entry = checkins.find((c) => c.date === date);
    return entry ? entry.urgeLevel : null;
  });

  const toSvgPoints = (
    values: Array<number | null>,
    minV: number,
    maxV: number,
  ) => {
    const range = maxV - minV || 1;
    const stepX = innerWidth / Math.max(days - 1, 1);
    return values
      .map((v, i) => {
        if (v === null) return null;
        return {
          x: PAD_X + i * stepX,
          y: PAD_Y + (1 - (v - minV) / range) * innerHeight,
          index: i,
        };
      })
      .filter((p): p is { x: number; y: number; index: number } => p !== null);
  };

  const qualityPoints = toSvgPoints(qualityRaw, 1, 5);
  const urgencyPoints = toSvgPoints(urgencyRaw, 0, 4);

  const selected = selectedIndex !== null ? dateLabels[selectedIndex] : null;
  const selectedEntry = selected ? checkins.find((c) => c.date === selected) : null;
  const stepX = innerWidth / Math.max(days - 1, 1);

  const handleTouch = useCallback(
    (evt: { nativeEvent: { locationX: number } }) => {
      const localX = evt.nativeEvent.locationX - PAD_X;
      const idx = Math.round(localX / stepX);
      const clamped = Math.max(0, Math.min(days - 1, idx));
      setSelectedIndex(clamped);
    },
    [stepX, days],
  );

  return (
    <GradientCard>
      <Text style={[styles.title, { color: colors.text }]}>{t('dashboard.trendChart')}</Text>
      <View
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        style={styles.svgContainer}
      >
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          {/* Quality of Life line (green) */}
          <Path
            d={buildPath(qualityPoints)}
            fill="none"
            stroke={colors.success}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
          {/* Urge level line (cyan) */}
          <Path
            d={buildPath(urgencyPoints)}
            fill="none"
            stroke={colors.cyan}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
          {/* Selected date indicator */}
          {selectedIndex !== null && (
            <Line
              x1={PAD_X + selectedIndex * stepX}
              y1={PAD_Y}
              x2={PAD_X + selectedIndex * stepX}
              y2={CHART_HEIGHT - PAD_Y}
              stroke={colors.textSecondary}
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          )}
          {/* Highlight dots on selected */}
          {selectedIndex !== null && (() => {
            const qi = qualityPoints.find((p) => p.index === selectedIndex);
            const ui = urgencyPoints.find((p) => p.index === selectedIndex);
            return (
              <>
                {qi && <Circle cx={qi.x} cy={qi.y} r={4} fill={colors.success} />}
                {ui && <Circle cx={ui.x} cy={ui.y} r={4} fill={colors.cyan} />}
              </>
            );
          })()}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>QOL</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.cyan }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            {t('checkinForm.urgeLevel')}
          </Text>
        </View>
        {selectedEntry && (
          <Text style={[styles.selectedDate, { color: colors.textSecondary }]}>
            {selected}
          </Text>
        )}
      </View>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  svgContainer: {
    alignSelf: 'stretch',
  },
  legend: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: FONT_SIZE.xs,
  },
  selectedDate: {
    fontSize: FONT_SIZE.xs,
    marginLeft: 'auto',
  },
});
