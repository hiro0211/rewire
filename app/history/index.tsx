import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { useCheckinStore } from '@/stores/checkinStore';
import { format, parseISO } from 'date-fns';

export default function HistoryScreen() {
  const { checkins, loadCheckins } = useCheckinStore();

  useEffect(() => {
    loadCheckins();
  }, []);

  return (
    <SafeAreaWrapper>
      <Stack.Screen options={{ title: '履歴', headerBackTitle: '戻る' }} />
      <View style={styles.header}>
        <Text style={styles.title}>履歴</Text>
      </View>
      <FlatList
        data={checkins}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.date}>{format(parseISO(item.date), 'MM/dd')}</Text>
              <View style={styles.status}>
                {item.watchedPorn ? (
                  <Text style={styles.fail}>⚠️ Reset</Text>
                ) : (
                    <Text style={styles.success}>✅ Success</Text>
                )}
              </View>
            </View>
            {item.memo ? <Text style={styles.memo}>{item.memo}</Text> : null}
          </Card>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  list: {
    padding: SPACING.lg,
  },
  card: {
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  date: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  status: {
    flexDirection: 'row',
  },
  success: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  fail: {
    color: COLORS.danger,
    fontWeight: 'bold',
  },
  memo: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
});
