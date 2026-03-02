import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { ArticleListItem } from '@/components/articles/ArticleListItem';
import { ARTICLES } from '@/constants/articles';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export default function ArticleListScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaWrapper>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>インサイト</Text>
      </View>
      <FlatList
        data={ARTICLES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ArticleListItem
            article={item}
            onPress={() => router.push(`/article/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  listContent: {
    padding: SPACING.lg,
  },
});
