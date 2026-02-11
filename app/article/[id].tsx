import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { ProGate } from '@/components/common/ProGate'; // We'll use this for locked articles
import { ARTICLES } from '@/constants/articles';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams();
  const article = ARTICLES.find((a) => a.id === id);
  const { user } = useUserStore();
  const isPro = user?.isPro || false;

  if (!article) return null;

  return (
    <SafeAreaWrapper>
        <Stack.Screen options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: '戻る',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
        }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.category}>{article.category}</Text>
        <Text style={styles.title}>{article.title}</Text>
        
        {article.isLocked && !isPro ? (
          <View style={styles.lockedContainer}>
             <Text style={styles.blurText}>{article.content.substring(0, 50)}...</Text>
             <ProGate />
          </View>
        ) : (
          <Text style={styles.body}>{article.content}</Text>
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
  },
  category: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xl,
  },
  body: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
  },
  lockedContainer: {
    marginTop: SPACING.md,
  },
  blurText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    opacity: 0.5,
    marginBottom: SPACING.lg,
  },
});
