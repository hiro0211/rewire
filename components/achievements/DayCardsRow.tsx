import React, { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { DayCard } from './DayCard';
import { SPACING } from '@/constants/theme';

interface DayCardsRowProps {
  streak: number;
}

const CARD_WIDTH = 64;
const GAP = SPACING.sm;

export function DayCardsRow({ streak }: DayCardsRowProps) {
  const scrollRef = useRef<ScrollView>(null);
  const maxDay = streak + 5;

  useEffect(() => {
    // Auto-scroll to current day position
    const offset = Math.max(0, streak * (CARD_WIDTH + GAP) - CARD_WIDTH);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: offset, animated: false });
    }, 100);
  }, [streak]);

  const days = Array.from({ length: maxDay + 1 }, (_, i) => i);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {days.map((day) => (
        <DayCard
          key={day}
          day={day}
          isReached={day <= streak}
          isCurrent={day === streak}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.screenPadding,
    gap: GAP,
  },
});
