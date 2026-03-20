import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import type { Article } from '@/constants/articles';

interface ArticleListItemProps {
  article: Article;
  onPress: () => void;
}

export function ArticleListItem({ article, onPress }: ArticleListItemProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.category, { color: colors.primary }]}>{t(article.categoryKey)}</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{t(article.titleKey)}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{t('articles.readTime', { minutes: article.readTime })}</Text>
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
    fontSize: FONT_SIZE.xs,
    fontWeight: 'bold',
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  meta: {
    fontSize: FONT_SIZE.xs,
  },
});
