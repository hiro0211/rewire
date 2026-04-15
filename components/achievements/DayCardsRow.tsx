import React, { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { DayCard } from './DayCard';
import { SPACING } from '@/constants/theme';
import { BADGE_DEFINITIONS } from '@/constants/badges/BADGE_DEFINITIONS';
import { useLocale } from '@/hooks/useLocale';

interface DayCardsRowProps {
  streak: number;
}

const CARD_WIDTH = 64;
const GAP = SPACING.sm;

const MILESTONE_DAYS = BADGE_DEFINITIONS.map((b) => b.day);

export function DayCardsRow({ streak }: DayCardsRowProps) {
  const { isJapanese } = useLocale();
  const scrollRef = useRef<ScrollView>(null);

  // Find the index of the current (or nearest next) milestone for auto-scroll
  const currentIndex = MILESTONE_DAYS.findIndex((d) => d > streak);
  const scrollToIndex = currentIndex === -1 ? MILESTONE_DAYS.length - 1 : Math.max(0, currentIndex - 1);

  useEffect(() => {
    const offset = Math.max(0, scrollToIndex * (CARD_WIDTH + GAP) - CARD_WIDTH);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: offset, animated: false });
    }, 100);
  }, [scrollToIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {BADGE_DEFINITIONS.map((badge) => {
        const isReached = streak >= badge.day;
        // "current" = the latest reached milestone
        const nextIndex = MILESTONE_DAYS.findIndex((d) => d > streak);
        const currentMilestoneIndex = nextIndex === -1 ? MILESTONE_DAYS.length - 1 : nextIndex - 1;
        const isCurrent = MILESTONE_DAYS.indexOf(badge.day) === currentMilestoneIndex;

        return (
          <DayCard
            key={badge.id}
            day={badge.day}
            label={isJapanese ? badge.nameJa : badge.nameEn}
            isReached={isReached}
            isCurrent={isCurrent}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.screenPadding,
    gap: GAP,
  },
});
