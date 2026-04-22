import { render } from '@testing-library/react-native';
import React from 'react';

import { APP_STORE_REVIEWS } from '@/constants/paywall/reviews';
import { ReviewCarousel } from '../ReviewCarousel';

jest.mock('@/hooks/useTheme', () => ({
    useTheme: () => ({
        colors: {
            text: '#fff',
            textSecondary: '#aaa',
            textTertiary: '#666',
            surface: '#1a1a1a',
            border: '#333',
        },
    }),
}));

jest.mock('@/hooks/useLocale', () => ({
    useLocale: () => ({
        t: (key: string) => {
            const map: Record<string, string> = {
                'paywall.reviews.sectionTitle': 'ユーザーの声',
            };
            return map[key] ?? key;
        },
    }),
}));

describe('ReviewCarousel', () => {
    it('クラッシュせずにレンダリングされる', () => {
        expect(() => render(<ReviewCarousel />)).not.toThrow();
    });

    it('セクションタイトル「ユーザーの声」が表示される', () => {
        const { getByText } = render(<ReviewCarousel />);
        expect(getByText('ユーザーの声')).toBeTruthy();
    });

    it('レビュー 2 件の本文がそれぞれ表示される', () => {
        const { getByText } = render(<ReviewCarousel />);
        APP_STORE_REVIEWS.forEach((review) => {
            expect(getByText(review.body)).toBeTruthy();
        });
    });

    it('review-carousel testID が存在する', () => {
        const { getByTestId } = render(<ReviewCarousel />);
        expect(getByTestId('review-carousel')).toBeTruthy();
    });

    it('ドットインジケータが APP_STORE_REVIEWS.length 個描画される', () => {
        const { getByTestId } = render(<ReviewCarousel />);
        APP_STORE_REVIEWS.forEach((_, i) => {
            expect(getByTestId(`dot-${i}`)).toBeTruthy();
        });
    });
});
