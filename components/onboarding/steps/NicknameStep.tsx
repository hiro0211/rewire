import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface NicknameStepProps {
  nickname: string;
  onChangeNickname: (text: string) => void;
}

export function NicknameStep({ nickname, onChangeNickname }: NicknameStepProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>あなたの名前は？</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {'アプリ内で呼びかけるニックネームを教えてください。\n（匿名で構いません）'}
      </Text>
      <TextInput
        style={[styles.input, { borderBottomColor: colors.primary, color: colors.text }]}
        placeholder="ニックネーム"
        placeholderTextColor={colors.textSecondary}
        value={nickname}
        onChangeText={onChangeNickname}
        autoFocus
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  input: {
    width: '100%',
    height: 50,
    borderBottomWidth: 1,
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
  },
});
