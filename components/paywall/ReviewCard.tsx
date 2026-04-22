import type { AppStoreReview } from '@/constants/paywall/reviews';
import { FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, RADIUS, SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const STAR_COLOR = '#FFB800';

interface ReviewCardProps {
    review: AppStoreReview;
    width: number;
}

export function ReviewCard({ review, width }: ReviewCardProps) {
    const { colors } = useTheme();

    return (
        <View testID="review-card" style={[styles.card, { width, backgroundColor: colors.surface }]}>
            <Text testID="review-stars" style={styles.stars}>
                {'★'.repeat(review.stars)}
            </Text>
            <Text style={[styles.body, { color: colors.text }]}>{review.body}</Text>
            <Text style={[styles.author, { color: colors.textSecondary }]}>{review.author}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginRight: SPACING.md,
    },
    stars: {
        fontSize: FONT_SIZE.md,
        color: STAR_COLOR,
        marginBottom: SPACING.sm,
    },
    body: {
        fontSize: FONT_SIZE.sm,
        lineHeight: LINE_HEIGHT.sm,
        marginBottom: SPACING.sm,
    },
    author: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.regular,
    },
});
