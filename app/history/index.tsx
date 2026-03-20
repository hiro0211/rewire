import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Card } from '@/components/ui/Card';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useCheckinStore } from '@/stores/checkinStore';
import { format, parseISO } from 'date-fns';

export default function HistoryScreen() {
  const { checkins, loadCheckins } = useCheckinStore();
  const { colors } = useTheme();
  const { t } = useLocale();

  useEffect(() => {
    loadCheckins();
  }, []);

  return (
    <SafeAreaWrapper>
      <Stack.Screen options={{ title: t('nav.history'), headerBackTitle: t('common.back') }} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('nav.history')}</Text>
      </View>
      <FlatList
        data={checkins}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={[styles.date, { color: colors.text }]}>{format(parseISO(item.date), 'MM/dd')}</Text>
              <View style={styles.status}>
                {item.watchedPorn ? (
                  <Text style={[styles.fail, { color: colors.danger }]}>⚠️ Reset</Text>
                ) : (
                    <Text style={[styles.success, { color: colors.success }]}>✅ Success</Text>
                )}
              </View>
            </View>
            {item.memo ? <Text style={[styles.memo, { color: colors.textSecondary }]}>{item.memo}</Text> : null}
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
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  status: {
    flexDirection: 'row',
  },
  success: {
    fontWeight: 'bold',
  },
  fail: {
    fontWeight: 'bold',
  },
  memo: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
});
