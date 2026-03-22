/**
 * Type-safe route constants.
 *
 * Expo Router generates a strict Href union type. Routes not listed
 * in the generated type cause TS errors when passed directly.
 * Using `as const` + `Href` cast here so callers avoid `as any`.
 */
import type { Href } from 'expo-router';

function route<T extends string>(path: T): Href {
  return path as unknown as Href;
}

export function routeWithParams(
  pathname: string,
  params: Record<string, string>,
): Href {
  return { pathname, params } as unknown as Href;
}

export const ROUTES = {
  tabs: route('/(tabs)'),
  onboarding: route('/onboarding'),
  onboardingGoal: route('/onboarding/goal'),
  onboardingBenefits: route('/onboarding/benefits'),
  paywall: route('/paywall'),
  streak: route('/streak'),
  brand: route('/brand'),
  contentBlockerSetup: route('/content-blocker-setup'),
  settings: route('/settings'),
  terms: route('/terms'),
  privacyPolicy: route('/privacy-policy'),
  checkin: route('/checkin'),
  checkinComplete: route('/checkin/complete'),
  breathing: route('/breathing'),
  breathingAsk: route('/breathing/ask'),
  breathingSuccess: route('/breathing/success'),
  recovery: route('/recovery'),
  history: route('/history'),
  achievements: route('/achievements'),
  survey: route('/survey'),
  promo: route('/promo'),
} as const;
