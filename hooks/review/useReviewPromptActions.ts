import { useState, useCallback } from 'react';
import { Linking } from 'react-native';
import { reviewPromptStorage } from '@/lib/storage/reviewPromptStorage';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { isExpoGo } from '@/lib/nativeGuard';

const FEEDBACK_EMAIL = 'arimurahiroaki40@gmail.com';
const FEEDBACK_SUBJECT = 'Rewire フィードバック';

export function useReviewPromptActions(onHide: () => void) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleRate = useCallback(async (stars: number) => {
    setSelectedRating(stars);
    await analyticsClient.logEvent('review_prompt_rated', { stars });

    if (stars >= 4) {
      await reviewPromptStorage.recordPositiveReview();

      if (!isExpoGo) {
        try {
          const StoreReview = require('expo-store-review');
          if (await StoreReview.isAvailableAsync()) {
            await StoreReview.requestReview();
          }
        } catch {
          // Native module unavailable
        }
      }

      onHide();
    } else {
      await reviewPromptStorage.recordPromptShown();
      setShowFeedback(true);
    }
  }, [onHide]);

  const handleFeedbackTap = useCallback(async () => {
    await analyticsClient.logEvent('review_prompt_feedback_tapped');
    const subject = encodeURIComponent(FEEDBACK_SUBJECT);
    await Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=${subject}`);
    onHide();
  }, [onHide]);

  const handleDismiss = useCallback(async () => {
    await reviewPromptStorage.recordDismissal();
    await analyticsClient.logEvent('review_prompt_dismissed');
    onHide();
  }, [onHide]);

  return {
    selectedRating,
    showFeedback,
    handleRate,
    handleFeedbackTap,
    handleDismiss,
  };
}
