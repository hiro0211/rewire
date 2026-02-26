import React, { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { DayCard } from './DayCard';
import { SPACING } from '@/constants/theme';
import { BADGES } from '@/constants/badges';

interface DayCardsRowProps {
  streak: number;
}

const CARD_WIDTH = 64;
const GAP = SPACING.sm;

const MILESTONE_DAYS = BADGES.map((b) => b.requiredDays);

export function DayCardsRow({ streak }: DayCardsRowProps) {
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
      {BADGES.map((badge) => {
        const isReached = streak >= badge.requiredDays;
        // "current" = the latest reached milestone
        const nextIndex = MILESTONE_DAYS.findIndex((d) => d > streak);
        const currentMilestoneIndex = nextIndex === -1 ? MILESTONE_DAYS.length - 1 : nextIndex - 1;
        const isCurrent = MILESTONE_DAYS.indexOf(badge.requiredDays) === currentMilestoneIndex;

        return (
          <DayCard
            key={badge.id}
            day={badge.requiredDays}
            label={badge.nameJa}
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
