import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZE, RADIUS, GRADIENTS } from '@/constants/theme';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { GlowDivider } from '@/components/ui/GlowDivider';
import { BenefitTag } from './BenefitTag';
import { BenefitSection } from './BenefitSection';
import { TestimonialCard } from './TestimonialCard';
import { FeatureShowcase } from './FeatureShowcase';
import { calcTargetDate } from './preBenefitsUtils';
import {
  BENEFIT_TAGS,
  BENEFIT_SECTIONS,
  TESTIMONIALS,
  FEATURE_ITEMS,
} from '@/constants/preBenefits';

interface PrePaywallBenefitsProps {
  nickname: string;
  goalDays: number;
  onContinue: () => void;
}

export function PrePaywallBenefits({ nickname, goalDays, onContinue }: PrePaywallBenefitsProps) {
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
            <Text style={styles.checkmark}>✓</Text>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>
              {nickname}さん、{'\n'}あなた専用のプランを{'\n'}作成しました。
            </Text>
            <Text style={styles.headerSub}>目標達成日:</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{targetDate}</Text>
            </View>
          </View>

          {/* ── ベネフィットタグ群 ── */}
          <Text style={styles.sectionHeadline}>
            Rewireで{'\n'}自分を変える。
          </Text>
          <Text style={styles.sectionSubheadline}>
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

          {/* ── 証言① ── */}
          <TestimonialCard
            quote={TESTIMONIALS[0].quote}
            rating={TESTIMONIALS[0].rating}
            author={TESTIMONIALS[0].author}
          />

          <GlowDivider />

          {/* ── 機能紹介 ── */}
          <FeatureShowcase features={FEATURE_ITEMS} />

          {/* ── 目標日付の再表示 ── */}
          <View style={styles.goalReminder}>
            <Text style={styles.goalReminderSub}>目標達成日:</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{targetDate}</Text>
            </View>
          </View>

          <GlowDivider />

          {/* ── 残りのベネフィットセクション ── */}
          {BENEFIT_SECTIONS.slice(2).map((section) => (
            <BenefitSection key={section.id} section={section} />
          ))}

          {/* ── 証言② ── */}
          <TestimonialCard
            quote={TESTIMONIALS[1].quote}
            rating={TESTIMONIALS[1].rating}
            author={TESTIMONIALS[1].author}
          />

          {/* ── 下部余白（固定フッターの分） ── */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── 固定フッター ── */}
        <View style={styles.footer}>
          <Button
            title="Rewireを始める"
            onPress={onContinue}
            variant="gradient"
            size="lg"
            style={styles.ctaButton}
          />
          <Text style={styles.footerNote}>
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
    color: COLORS.success,
    marginBottom: SPACING.md,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: SPACING.lg,
  },
  headerSub: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  dateBadge: {
    backgroundColor: COLORS.surfaceHighlight,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  dateText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },

  // ── ベネフィットタグ ──
  sectionHeadline: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  sectionSubheadline: {
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
  footerNote: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
  },
});
