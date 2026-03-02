import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useCheckinStore } from '@/stores/checkinStore';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import type { DailyCheckin } from '@/types/models';

export const HistoryList = () => {
  const checkins = useCheckinStore((state) => state.checkins);
  const { colors, shadows } = useTheme();

  const sortedCheckins = [...checkins].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const renderItem = ({ item }: { item: DailyCheckin }) => {
    const isRelapse = item.watchedPorn;

    return (
      <View style={[styles.itemContainer, { backgroundColor: colors.surface }, shadows.small]}>
        <View style={[styles.statusIndicator, { backgroundColor: colors.textSecondary }, isRelapse ? { backgroundColor: colors.error } : { backgroundColor: colors.success }]} />

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.dateText, { color: colors.text }]}>
              {format(new Date(item.date), 'yyyy年MM月dd日 (EEE)', { locale: ja })}
            </Text>
            <View style={[styles.badge, isRelapse ? { backgroundColor: colors.error + '20' } : { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.badgeText, isRelapse ? { color: colors.error } : { color: colors.success }]}>
                    {isRelapse ? 'リセット' : '達成'}
                </Text>
            </View>
          </View>

          {item.watchedPorn && (
             <View style={styles.tagsRow}>
                <Text style={[styles.tag, { color: colors.textSecondary, backgroundColor: colors.background, borderColor: colors.border }]}>ポルノ視聴</Text>
             </View>
          )}

          {item.memo ? (
            <Text style={[styles.memoText, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.memo}
            </Text>
          ) : null}
        </View>

        <Ionicons
            name={isRelapse ? "alert-circle-outline" : "checkmark-circle-outline"}
            size={24}
            color={isRelapse ? colors.error : colors.success}
        />
      </View>
    );
  };

  if (checkins.length === 0) {
      return (
          <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>まだ記録がありません</Text>
          </View>
      );
  }

  return (
    <FlatList
      data={sortedCheckins}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: SPACING.xl,
  },
  itemContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  tag: {
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  memoText: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyContainer: {
      padding: SPACING.xl,
      alignItems: 'center',
  },
  emptyText: {
      fontSize: 16,
  }
});
