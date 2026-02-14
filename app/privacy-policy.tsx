import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Text } from '@/components/Themed';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const Paragraph = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.paragraph}>{children}</Text>
);

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>プライバシーポリシー</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updatedDate}>最終更新日: 2025年1月1日</Text>

        <SectionTitle>1. はじめに</SectionTitle>
        <Paragraph>
          Rewire（以下「本アプリ」）は、ユーザーの自己管理と習慣改善を支援するアプリケーションです。本プライバシーポリシーでは、本アプリにおける個人情報の取り扱いについて説明します。
        </Paragraph>

        <SectionTitle>2. 収集するデータ</SectionTitle>
        <Paragraph>
          本アプリでは、以下のデータを収集・記録します。{'\n\n'}
          ・性的行動に関する記録{'\n'}
          ・メンタルヘルスに関するデータ{'\n'}
          ・呼吸エクササイズの記録{'\n'}
          ・回復の進捗記録{'\n'}
          ・ニックネーム{'\n'}
          ・アプリ内の設定情報
        </Paragraph>

        <SectionTitle>3. 利用目的</SectionTitle>
        <Paragraph>
          収集したデータは、ユーザーご自身の自己管理支援の目的のみに使用されます。アプリ内での進捗の可視化、振り返り機能の提供、リマインダーの送信等に利用します。
        </Paragraph>

        <SectionTitle>4. データの保存場所</SectionTitle>
        <Paragraph>
          すべてのデータはユーザーのデバイス上にローカルで保存され、暗号化されています。外部サーバーへのデータ送信は行いません。
        </Paragraph>

        <SectionTitle>5. 広告・課金サービスについて</SectionTitle>
        <Paragraph>
          本アプリでは、将来的にGoogle AdMob（広告配信）およびApp Store・Google Play（アプリ内課金）を利用する予定です。これらのサービスの利用に際しては、Apple Inc.およびGoogle LLC.のプライバシーポリシーが適用されます。広告のパーソナライズのため、iOSではApp Tracking Transparency (ATT)の許可を求める場合があります。
        </Paragraph>

        <SectionTitle>6. 第三者への提供</SectionTitle>
        <Paragraph>
          上記の広告配信サービスおよび課金サービスを除き、ユーザーのデータを第三者に提供することはありません。
        </Paragraph>

        <SectionTitle>7. データの削除</SectionTitle>
        <Paragraph>
          アプリ内の「設定」→「データをリセット」からすべてのデータを削除できます。また、アプリをアンインストールすることでも、デバイスに保存されたすべてのデータが削除されます。
        </Paragraph>

        <SectionTitle>8. お問い合わせ</SectionTitle>
        <Paragraph>
          本プライバシーポリシーに関するお問い合わせは、以下のメールアドレスまでご連絡ください。{'\n\n'}
          arimurahiroaki40@gmail.com
        </Paragraph>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceHighlight,
  },
  backButton: {
    marginRight: SPACING.md,
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    padding: SPACING.screenPadding,
    paddingBottom: SPACING.xxxl,
  },
  updatedDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
});
