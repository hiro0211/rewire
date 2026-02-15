import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '@/constants/theme';
import { useCheckinStore } from '@/stores/checkinStore';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import type { DailyCheckin } from '@/types/models';

export const HistoryList = () => {
  const checkins = useCheckinStore((state) => state.checkins);

  const sortedCheckins = [...checkins].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const renderItem = ({ item }: { item: DailyCheckin }) => {
    const isRelapse = item.watchedPorn;
    
    return (
      <View style={styles.itemContainer}>
        <View style={[styles.statusIndicator, isRelapse ? styles.relapse : styles.clean]} />
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.dateText}>
              {format(new Date(item.date), 'yyyy年MM月dd日 (EEE)', { locale: ja })}
            </Text>
            <View style={[styles.badge, isRelapse ? styles.relapseBadge : styles.cleanBadge]}>
                <Text style={[styles.badgeText, isRelapse ? styles.relapseText : styles.cleanText]}>
                    {isRelapse ? 'リセット' : '達成'}
                </Text>
            </View>
          </View>
          
          {item.watchedPorn && (
             <View style={styles.tagsRow}>
                <Text style={styles.tag}>ポルノ視聴</Text>
             </View>
          )}

          {item.memo ? (
            <Text style={styles.memoText} numberOfLines={2}>
              {item.memo}
            </Text>
          ) : null}
        </View>
        
        <Ionicons 
            name={isRelapse ? "alert-circle-outline" : "checkmark-circle-outline"} 
            size={24} 
            color={isRelapse ? COLORS.error : COLORS.success} 
        />
      </View>
    );
  };

  if (checkins.length === 0) {
      return (
          <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>まだ記録がありません</Text>
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
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.small,
  },
  statusIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    backgroundColor: COLORS.textSecondary,
  },
  clean: {
    backgroundColor: COLORS.success,
  },
  relapse: {
    backgroundColor: COLORS.error,
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
    color: COLORS.text,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cleanBadge: {
    backgroundColor: COLORS.success + '20', // 20% opacity
  },
  relapseBadge: {
    backgroundColor: COLORS.error + '20',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cleanText: {
    color: COLORS.success,
  },
  relapseText: {
    color: COLORS.error,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  tag: {
    fontSize: 12,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  memoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emptyContainer: {
      padding: SPACING.xl,
      alignItems: 'center',
  },
  emptyText: {
      color: COLORS.textSecondary,
      fontSize: 16,
  }
});
