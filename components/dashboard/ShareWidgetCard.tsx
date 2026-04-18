import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_WEIGHT } from '@/constants/theme';

interface ShareWidgetCardProps {
  elapsed: string;
  relapseCount: number;
  goalDays: number;
  testID?: string;
}

export function ShareWidgetCard({ elapsed, relapseCount, goalDays, testID }: ShareWidgetCardProps) {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.leftColumn}>
        <Text style={styles.label}>経過時間</Text>
        <Text
          style={styles.elapsedTime}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {elapsed}
        </Text>
      </View>
      <View style={styles.rightColumn}>
        <View style={styles.statRow}>
          <Ionicons name="reload-outline" size={11} color="rgba(255,255,255,0.8)" />
          <Text style={styles.statText}>{`リセット ${relapseCount}回`}</Text>
        </View>
        <View style={styles.statRow}>
          <Ionicons name="flag" size={11} color="#8B5CF6" />
          <Text style={styles.goalText}>{`目標 ${goalDays}日`}</Text>
        </View>
      </View>
    </View>
  );
}

const MONO_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: {
    width: 340,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    padding: 16,
    borderRadius: 16,
  },
  leftColumn: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.medium,
    color: 'rgba(255,255,255,0.6)',
  },
  elapsedTime: {
    fontSize: 24,
    fontWeight: FONT_WEIGHT.bold,
    fontFamily: MONO_FONT,
    color: '#FFFFFF',
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: 8,
    marginLeft: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  goalText: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.medium,
    color: '#8B5CF6',
  },
});
