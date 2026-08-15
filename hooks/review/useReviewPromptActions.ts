import { useState, useCallback } from 'react';
import { Linking } from 'react-native';
import { reviewPromptStorage } from '@/lib/storage/reviewPromptStorage';
import { trackEvent } from '@/lib/tracking/trackEvent';
import { isExpoGo } from '@/lib/nativeGuard';
import { t } from '@/locales/i18n';
import { SUPPORT_EMAIL } from '@/constants/support';

export function useReviewPromptActions(onHide: () => void) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleRate = useCallback(async (stars: number) => {
    setSelectedRating(stars);
    trackEvent('review_prompt_rated', { stars });

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
    trackEvent('review_prompt_feedback_tapped');
    await reviewPromptStorage.recordFeedbackSent();
    const subject = encodeURIComponent(t('review.feedbackSubject'));
    await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}`);
    onHide();
  }, [onHide]);

  const handleDismiss = useCallback(async () => {
    await reviewPromptStorage.recordDismissal();
    trackEvent('review_prompt_dismissed');
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
