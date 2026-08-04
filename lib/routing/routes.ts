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

/**
 * ROUTES の定数（`Href` にキャスト済み）とパス文字列リテラルの両方を受けられる。
 * 実体はどちらも文字列なので、呼び出し側で `as any` を書かせないための受け口。
 */
export function routeWithParams(
  pathname: string | Href,
  params: Record<string, string>,
): Href {
  return { pathname, params } as unknown as Href;
}

export const ROUTES = {
  tabs: route('/(tabs)'),
  profileTab: route('/(tabs)/profile'),
  onboarding: route('/onboarding'),
  onboardingGoal: route('/onboarding/goal'),
  onboardingBenefits: route('/onboarding/benefits'),
  paywall: route('/paywall'),
  postPurchaseOnboarding: route('/post-purchase-onboarding'),
  streak: route('/streak'),
  brand: route('/brand'),
  settings: route('/settings'),
  terms: route('/terms'),
  privacyPolicy: route('/privacy-policy'),
  credits: route('/credits'),
  panic: route('/panic'),
  breathing: route('/breathing'),
  breathingAsk: route('/breathing/ask'),
  breathingSuccess: route('/breathing/success'),
  recovery: route('/recovery'),
  history: route('/history'),
  achievements: route('/achievements'),
  survey: route('/survey'),
} as const;
