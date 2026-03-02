import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

const SectionTitle = ({ children, color }: { children: string; color: string }) => (
  <Text style={[styles.sectionTitle, { color }]}>{children}</Text>
);

const Paragraph = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <Text style={[styles.paragraph, { color }]}>{children}</Text>
);

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.updatedDate, { color: colors.textSecondary }]}>最終更新日: 2026年2月26日</Text>

        <SectionTitle color={colors.text}>1. はじめに</SectionTitle>
        <Paragraph color={colors.textSecondary}>
          Rewire（以下「本アプリ」）は、ユーザーの自己管理と習慣改善を支援するアプリケーションです。本プライバシーポリシーでは、本アプリにおける個人情報の取り扱いについて説明します。
        </Paragraph>

        <SectionTitle color={colors.text}>2. 収集するデータ</SectionTitle>
        <Paragraph color={colors.textSecondary}>
          本アプリでは、以下のデータを収集・記録します。{'\n\n'}
          ・性的行動に関する記録{'\n'}
          ・メンタルヘルスに関するデータ{'\n'}
          ・呼吸エクササイズの記録{'\n'}
          ・回復の進捗記録{'\n'}
          ・ニックネーム{'\n'}
          ・アプリ内の設定情報
        </Paragraph>

        <SectionTitle color={colors.text}>3. 利用目的</SectionTitle>
        <Paragraph color={colors.textSecondary}>
          収集したデータは、ユーザーご自身の自己管理支援の目的のみに使用されます。アプリ内での進捗の可視化、振り返り機能の提供、リマインダーの送信等に利用します。
        </Paragraph>

        <SectionTitle color={colors.text}>4. データの保存場所</SectionTitle>
        <Paragraph color={colors.textSecondary}>
          すべてのデータはユーザーのデバイス上にローカルで保存され、暗号化されています。外部サーバーへのデータ送信は行いません。
        </Paragraph>

        <SectionTitle color={colors.text}>5. 課金サービスについて</SectionTitle>
        <Paragraph color={colors.textSecondary}>
          本アプリでは、App Store（アプリ内課金）を利用しています。課金サービスの利用に際しては、Apple Inc.のプライバシーポリシーが適用されます。
        </Paragraph>

        <SectionTitle color={colors.text}>6. 第三者への提供</SectionTitle>
        <Paragraph color={colors.textSecondary}>
          上記の課金サービスを除き、ユーザーのデータを第三者に提供することはありません。
        </Paragraph>

        <SectionTitle color={colors.text}>7. データの削除</SectionTitle>
        <Paragraph color={colors.textSecondary}>
          アプリ内の「設定」→「データをリセット」からすべてのデータを削除できます。また、アプリをアンインストールすることでも、デバイスに保存されたすべてのデータが削除されます。
        </Paragraph>

        <SectionTitle color={colors.text}>8. お問い合わせ</SectionTitle>
        <Paragraph color={colors.textSecondary}>
          本プライバシーポリシーに関するお問い合わせは、以下のメールアドレスまでご連絡ください。{'\n\n'}
          arimurahiroaki40@gmail.com
        </Paragraph>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.screenPadding,
    paddingBottom: SPACING.xxxl,
  },
  updatedDate: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
  },
});
