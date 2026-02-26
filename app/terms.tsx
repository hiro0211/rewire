import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/components/Themed';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const Paragraph = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.paragraph}>{children}</Text>
);

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updatedDate}>最終更新日: 2026年2月26日</Text>

        <SectionTitle>1. 利用規約の適用</SectionTitle>
        <Paragraph>
          本利用規約（以下「本規約」）は、Rewire（以下「本アプリ」）の利用に関する条件を定めるものです。本アプリをダウンロードまたは使用することにより、ユーザーは本規約に同意したものとみなされます。
        </Paragraph>

        <SectionTitle>2. 利用条件</SectionTitle>
        <Paragraph>
          本アプリはポルノ習慣からの回復を支援する目的で提供されています。本アプリをご利用いただくことで、ユーザーは本規約に同意したものとみなします。
        </Paragraph>

        <SectionTitle>3. 免責事項</SectionTitle>
        <Paragraph>
          本アプリは自己管理の支援を目的としたものであり、医療行為やカウンセリングの代替となるものではありません。心身の健康に関する問題については、医師やカウンセラー等の専門家にご相談ください。本アプリの利用により生じたいかなる損害についても、開発者は一切の責任を負いません。
        </Paragraph>

        <SectionTitle>4. 禁止事項</SectionTitle>
        <Paragraph>
          ユーザーは以下の行為を行ってはなりません。{'\n\n'}
          ・本アプリの不正利用またはリバースエンジニアリング{'\n'}
          ・本アプリの機能を利用した違法行為{'\n'}
          ・他のユーザーへの迷惑行為{'\n'}
          ・本アプリのセキュリティを侵害する行為
        </Paragraph>

        <SectionTitle>5. データの取り扱い</SectionTitle>
        <Paragraph>
          ユーザーのデータの取り扱いについては、プライバシーポリシーをご確認ください。本アプリはデータをデバイス上にローカルで保存し、外部サーバーへの送信は行いません。
        </Paragraph>

        <SectionTitle>6. アプリ内課金について</SectionTitle>
        <Paragraph>
          本アプリでは、以下のサブスクリプションプランを提供しています。{'\n\n'}
          ・月額プラン（Rewire Pro Monthly）：¥580/月{'\n'}
          ・年額プラン（Rewire Pro Annual）：¥4,200/年{'\n\n'}
          いずれのプランにも7日間の無料トライアル期間があります。無料トライアル終了後、サブスクリプション料金がApple IDに請求されます。{'\n\n'}
          サブスクリプションは有効期間終了の24時間前までにキャンセルしない限り自動更新されます。解約はiPhoneの「設定」→「Apple ID」→「サブスクリプション」から行うことができます。
        </Paragraph>

        <SectionTitle>7. 規約の変更</SectionTitle>
        <Paragraph>
          開発者は、必要に応じて本規約を変更することがあります。重要な変更がある場合は、アプリ内で通知します。変更後も本アプリの利用を継続することにより、変更後の規約に同意したものとみなされます。
        </Paragraph>

        <SectionTitle>8. 準拠法</SectionTitle>
        <Paragraph>
          本規約は日本法に準拠し、日本法に従って解釈されるものとします。本規約に関する紛争については、日本国の裁判所を専属的合意管轄裁判所とします。
        </Paragraph>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
