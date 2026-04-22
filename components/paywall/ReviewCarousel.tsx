import { APP_STORE_REVIEWS } from '@/constants/paywall/reviews';
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ReviewCard } from './ReviewCard';

function DotIndicator({ count, activeIndex }: { count: number; activeIndex: number }) {
    const { colors } = useTheme();

    return (
        <View testID="dot-indicator" style={styles.dotContainer}>
            {Array.from({ length: count }).map((_, i) => (
                <View
                    key={i}
                    testID={`dot-${i}`}
                    style={[
                        styles.dot,
                        {
                            backgroundColor: i === activeIndex ? colors.text : colors.textSecondary,
                            width: i === activeIndex ? 20 : 8,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

export function ReviewCarousel() {
    const { width } = useWindowDimensions();
    const { t } = useLocale();
    const { colors } = useTheme();
    const cardWidth = width - SPACING.screenPadding * 2;
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <View testID="review-carousel" style={styles.container}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('paywall.reviews.sectionTitle')}
            </Text>
            <FlatList
                data={APP_STORE_REVIEWS}
                horizontal
                pagingEnabled
                snapToInterval={cardWidth + SPACING.md}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onScroll={(e) => {
                    const idx = Math.round(
                        e.nativeEvent.contentOffset.x / (cardWidth + SPACING.md)
                    );
                    if (idx !== activeIndex) setActiveIndex(idx);
                }}
                scrollEventThrottle={16}
                renderItem={({ item }) => <ReviewCard review={item} width={cardWidth} />}
                contentContainerStyle={styles.listContent}
            />
            <DotIndicator count={APP_STORE_REVIEWS.length} activeIndex={activeIndex} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        marginBottom: SPACING.md,
    },
    listContent: {
        paddingRight: SPACING.screenPadding,
    },
    dotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.md,
    },
    dot: {
        height: 8,
        borderRadius: RADIUS.full,
        marginHorizontal: 4,
    },
});
