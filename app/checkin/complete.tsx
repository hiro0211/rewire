import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

export default function CheckinCompleteScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <Text style={styles.emoji}>👍</Text>
        <Text style={styles.title}>記録完了</Text>
        <Text style={styles.description}>
          今日も一日お疲れ様でした。{'\n'}
          着実に前に進んでいます。
        </Text>
        <Button
          title="ホームに戻る"
          onPress={handleGoHome}
          style={styles.button}
        />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
  button: {
    width: '100%',
  },
});
