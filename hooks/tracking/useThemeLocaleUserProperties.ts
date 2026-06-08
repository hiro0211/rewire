import { useEffect } from 'react';

import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { useLocaleStore } from '@/stores/localeStore';
import { useThemeStore } from '@/stores/themeStore';

/**
 * Mirrors the user's theme + locale preference into GA4 user properties so
 * retention/usage cohorts can be segmented by them. Reactive: re-fires when the
 * preference changes (e.g. the user switches theme in settings).
 */
export function useThemeLocaleUserProperties(): void {
  const themePreference = useThemeStore((s) => s.themePreference);
  const localePreference = useLocaleStore((s) => s.localePreference);

  useEffect(() => {
    analyticsClient.setUserProperty('theme_preference', themePreference);
  }, [themePreference]);

  useEffect(() => {
    analyticsClient.setUserProperty('locale_preference', localePreference);
  }, [localePreference]);
}
