import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import type { Article } from '@/constants/articles';

interface ArticleListItemProps {
  article: Article;
  onPress: () => void;
}

export function ArticleListItem({ article, onPress }: ArticleListItemProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.category}>{article.category}</Text>
          {article.isLocked && <Text style={styles.lock}>🔒 Pro</Text>}
        </View>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.meta}>読了時間: {article.readTime}分</Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  category: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: 'bold',
  },
  lock: {
    color: COLORS.pro,
    fontSize: FONT_SIZE.xs,
    fontWeight: 'bold',
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
  },
});
