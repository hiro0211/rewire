import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { BADGE_DEFINITIONS } from '@/constants/badges/BADGE_DEFINITIONS';
import { CHAPTERS, CHAPTER_IDS } from '@/constants/badges/BadgeChapter';
import { ORB_CHAPTERS } from '@/constants/orbConfig';
import { getBadgeByDay } from '@/lib/badges/getBadgeByDay';
import type { AchievementStatus } from '@/features/achievements/achievementCalculator';

interface CosmosProgressTimelineProps {
  streak: number;
  achievements: AchievementStatus[];
}

export function CosmosProgressTimeline({ streak, achievements }: CosmosProgressTimelineProps) {
  const { colors } = useTheme();
  const { isJapanese } = useLocale();

  const achievementMap = new Map(
    achievements.map((a) => [a.badge.id, a.isUnlocked]),
  );

  const currentBadge = getBadgeByDay(streak);
  const currentChapter = currentBadge.chapter;
  const currentChapterIndex = CHAPTER_IDS.indexOf(currentChapter);

  return (
    <View style={styles.container}>
      {CHAPTERS.map((chapter, chapterIndex) => {
        const chapterBadges = BADGE_DEFINITIONS.filter((b) => b.chapter === chapter.id);
        const orbConfig = ORB_CHAPTERS[chapter.id];
        const isCurrentChapter = chapter.id === currentChapter;
        const isPastChapter = chapterIndex < currentChapterIndex;

        return (
          <View
            key={chapter.id}
            testID={`chapter-section-${chapter.id}`}
            style={styles.chapterSection}
          >
            <View style={styles.chapterHeader}>
              <View
                style={[
                  styles.chapterCircle,
                  {
                    backgroundColor: isCurrentChapter || isPastChapter
                      ? orbConfig.colors[0]
                      : colors.surface,
                    borderColor: isCurrentChapter ? orbConfig.glowColor : 'transparent',
                    borderWidth: isCurrentChapter ? 2 : 0,
                  },
                ]}
              />
              <Text
                style={[
                  styles.chapterName,
                  {
                    color: isCurrentChapter || isPastChapter ? colors.text : colors.textSecondary,
                    fontWeight: isCurrentChapter ? '700' : '500',
                  },
                ]}
              >
                {isJapanese ? chapter.nameJa : chapter.nameEn}
              </Text>
            </View>

            {chapterBadges.map((badge, badgeIndex) => {
              const isUnlocked = achievementMap.get(badge.id) ?? false;
              const isLast =
                badgeIndex === chapterBadges.length - 1 &&
                chapterIndex === CHAPTERS.length - 1;

              return (
                <View
                  key={badge.id}
                  testID={`milestone-${badge.id}${isUnlocked ? '-unlocked' : ''}`}
                  style={styles.milestoneRow}
                >
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineLine,
                        { backgroundColor: isUnlocked ? orbConfig.colors[0] : colors.surface },
                      ]}
                    />
                  )}

                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isUnlocked ? orbConfig.colors[0] : colors.surface,
                      },
                    ]}
                  />

                  <View style={styles.milestoneContent}>
                    <Text
                      style={[
                        styles.milestoneName,
                        { color: isUnlocked ? colors.text : colors.textSecondary },
                      ]}
                    >
                      {isJapanese ? badge.nameJa : badge.nameEn}
                    </Text>
                    <Text
                      style={[
                        styles.milestoneDays,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {badge.day}d
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.screenPadding,
  },
  chapterSection: {
    marginBottom: SPACING.md,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  chapterCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: SPACING.sm,
  },
  chapterName: {
    fontSize: FONT_SIZE.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 11,
    minHeight: 36,
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 18,
    bottom: -18,
    width: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.md,
  },
  milestoneContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestoneName: {
    fontSize: FONT_SIZE.sm,
  },
  milestoneDays: {
    fontSize: FONT_SIZE.xs,
  },
});
