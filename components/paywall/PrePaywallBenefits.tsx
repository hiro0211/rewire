import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { GlowDivider } from '@/components/ui/GlowDivider';
import { BenefitTag } from './BenefitTag';
import { BenefitSection } from './BenefitSection';
import { FeatureShowcase } from './FeatureShowcase';
import { calcTargetDate } from './preBenefitsUtils';
import {
  BENEFIT_TAGS,
  BENEFIT_SECTIONS,
  FEATURE_ITEMS,
} from '@/constants/preBenefits';

interface PrePaywallBenefitsProps {
  nickname: string;
  goalDays: number;
  onContinue: () => void;
}

export function PrePaywallBenefits({ nickname, goalDays, onContinue }: PrePaywallBenefitsProps) {
  const { colors } = useTheme();
  const targetDate = calcTargetDate(goalDays);

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── パーソナライズヘッダー ── */}
          <View style={styles.headerSection}>
            <Text style={[styles.checkmark, { color: colors.success }]}>✓</Text>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {nickname}さん、{'\n'}あなた専用のプランを{'\n'}作成しました。
            </Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>目標達成日:</Text>
            <View style={[styles.dateBadge, { backgroundColor: colors.surfaceHighlight }]}>
              <Text style={[styles.dateText, { color: colors.text }]}>{targetDate}</Text>
            </View>
          </View>

          {/* ── ベネフィットタグ群 ── */}
          <Text style={[styles.sectionHeadline, { color: colors.text }]}>
            Rewireで{'\n'}自分を変える。
          </Text>
          <Text style={[styles.sectionSubheadline, { color: colors.textSecondary }]}>
            ポルノを見て後悔するの{'\n'}今日でやめませんか？
          </Text>

          <View style={styles.tagsContainer}>
            {BENEFIT_TAGS.map((tag) => (
              <BenefitTag key={tag.label} label={tag.label} color={tag.color} emoji={tag.emoji} />
            ))}
          </View>

          <GlowDivider />

          {/* ── ベネフィットセクション群 ── */}
          {BENEFIT_SECTIONS.slice(0, 2).map((section) => (
            <BenefitSection key={section.id} section={section} />
          ))}

          <GlowDivider />

          {/* ── 機能紹介 ── */}
          <FeatureShowcase features={FEATURE_ITEMS} />

          {/* ── 目標日付の再表示 ── */}
          <View style={styles.goalReminder}>
            <Text style={[styles.goalReminderSub, { color: colors.textSecondary }]}>目標達成日:</Text>
            <View style={[styles.dateBadge, { backgroundColor: colors.surfaceHighlight }]}>
              <Text style={[styles.dateText, { color: colors.text }]}>{targetDate}</Text>
            </View>
          </View>

          <GlowDivider />

          {/* ── 残りのベネフィットセクション ── */}
          {BENEFIT_SECTIONS.slice(2).map((section) => (
            <BenefitSection key={section.id} section={section} />
          ))}

          {/* ── 下部余白（固定フッターの分） ── */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── 固定フッター ── */}
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Button
            title="Rewireを始める"
            onPress={onContinue}
            variant="gradient"
            size="lg"
            style={styles.ctaButton}
          />
          <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
            いつでもキャンセル可能
          </Text>
        </View>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },

  // ── ヘッダー ──
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  checkmark: {
    fontSize: 40,
    marginBottom: SPACING.md,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: SPACING.lg,
  },
  headerSub: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  dateBadge: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  dateText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },

  // ── ベネフィットタグ ──
  sectionHeadline: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  sectionSubheadline: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },

  // ── 目標リマインダー ──
  goalReminder: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  goalReminderSub: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },

  // ── フッター ──
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
  footerNote: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
  },
});
