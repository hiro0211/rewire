import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { ARTICLES } from '@/constants/articles';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams();
  const article = ARTICLES.find((a) => a.id === id);
  const { colors } = useTheme();

  if (!article) return null;

  return (
    <SafeAreaWrapper>
        <Stack.Screen options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: '戻る',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
        }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.category, { color: colors.primary }]}>{article.category}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>
        <Text style={[styles.body, { color: colors.text }]}>{article.content}</Text>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
  },
  category: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xl,
  },
  body: {
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
  },
});
