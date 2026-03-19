import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { reviewPromptStorage } from '@/lib/storage/reviewPromptStorage';
import { userStorage } from '@/lib/storage/userStorage';
import { checkinStorage } from '@/lib/storage/checkinStorage';
import { shouldShowReviewPrompt } from '@/features/review/reviewPromptEligibility';

export function useReviewEligibility() {
  const [shouldShowReview, setShouldShowReview] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const [promptState, user, checkins] = await Promise.all([
        reviewPromptStorage.getState(),
        userStorage.get(),
        checkinStorage.getAll(),
      ]);

      const result = shouldShowReviewPrompt({
        hasLeftPositiveReview: promptState.hasLeftPositiveReview,
        accountCreatedAt: user?.createdAt ?? null,
        checkinCount: checkins.length,
        lastPromptedAt: promptState.lastPromptedAt,
        dismissCount: promptState.dismissCount,
        isIOS: Platform.OS === 'ios',
        now: new Date(),
      });

      if (!cancelled) setShouldShowReview(result);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return { shouldShowReview };
}
