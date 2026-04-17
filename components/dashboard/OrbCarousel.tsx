import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  View,
  type LayoutChangeEvent,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { OrbCarouselItem } from './OrbCarouselItem';
import {
  BADGE_DEFINITIONS,
  type NeuralBadgeDefinition,
} from '@/constants/badges/BADGE_DEFINITIONS';
import { getBadgeByDay } from '@/lib/badges/getBadgeByDay';

const ACTIVE_SIZE_DEFAULT = 120;
const ITEM_WIDTH_PADDING = 20;

interface OrbCarouselProps {
  currentDays: number;
  onLongPress?: () => void;
  activeOrbSize?: number;
}

export function OrbCarousel({
  currentDays,
  onLongPress,
  activeOrbSize = ACTIVE_SIZE_DEFAULT,
}: OrbCarouselProps) {
  const itemWidth = activeOrbSize + ITEM_WIDTH_PADDING;
  const [listWidth, setListWidth] = useState(0);
  const sidePadding =
    listWidth > 0 ? Math.max(0, (listWidth - itemWidth) / 2) : 0;

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      if (w !== listWidth) setListWidth(w);
    },
    [listWidth]
  );

  const initialIndex = useMemo(() => {
    const safeDays = Math.max(0, currentDays);
    const current = getBadgeByDay(safeDays);
    const idx = BADGE_DEFINITIONS.findIndex((b) => b.id === current.id);
    return idx === -1 ? 0 : idx;
  }, [currentDays]);

  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const listRef = useRef<FlatList<NeuralBadgeDefinition>>(null);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<NeuralBadgeDefinition>) => (
      <OrbCarouselItem
        badge={item}
        itemWidth={itemWidth}
        activeOrbSize={activeOrbSize}
        isActive={index === activeIndex}
        currentDays={currentDays}
        onLongPress={onLongPress}
      />
    ),
    [activeIndex, itemWidth, activeOrbSize, currentDays, onLongPress]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<NeuralBadgeDefinition> | null | undefined, index: number) => ({
      length: itemWidth,
      offset: itemWidth * index,
      index,
    }),
    [itemWidth]
  );

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const next = Math.round(offsetX / itemWidth);
      const clamped = Math.max(0, Math.min(BADGE_DEFINITIONS.length - 1, next));
      if (clamped !== activeIndex) {
        setActiveIndex(clamped);
      }
    },
    [itemWidth, activeIndex]
  );

  const onScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number }) => {
      // Retry scroll on next frame using the exact offset from getItemLayout math
      const offset = info.index * itemWidth;
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset, animated: false });
      });
    },
    [itemWidth]
  );

  return (
    <FlatList
      ref={listRef}
      testID="orb-carousel"
      data={BADGE_DEFINITIONS}
      keyExtractor={(badge) => badge.id}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={itemWidth}
      snapToAlignment="start"
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: 0 }}
      ListHeaderComponent={<View style={{ width: sidePadding }} />}
      ListFooterComponent={<View style={{ width: sidePadding }} />}
      getItemLayout={getItemLayout}
      initialScrollIndex={initialIndex}
      onLayout={onLayout}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onScrollToIndexFailed={onScrollToIndexFailed}
      windowSize={3}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
    />
  );
}
