/**
 * Single source of truth for every analytics event the app fires, and the
 * shape of its params.
 *
 * Events MUST be fired through `trackEvent` (lib/tracking/trackEvent.ts) so
 * names and params are type-checked at the call site (no stray string typos).
 * Calling `analyticsClient.logEvent` directly bypasses that check — it exists
 * only as the transport underneath `trackEvent`.
 *
 * Two tests keep this honest, both in `scripts/analytics/tests/`:
 *   - `test_event_registry_sync.py::TestEventCatalogIsSourceOfTruth` fails on
 *     any event fired by the app but missing from this file.
 *   - `TestEventRegistrySync` fails on drift against `REWIRE_KEY_EVENTS` in
 *     `scripts/analytics/firebase_ga4_client.py`.
 * Both read the actual sources, because the sync crosses a language boundary
 * and hand-checking it has already failed in practice.
 *
 * ⚠️ Param names are snake_case, always. BigQuery's `event_params` can only be
 *    queried by exact key match, so one camelCase key forces a second spelling
 *    into every query that touches it. `questionCount` and `fromStep` were
 *    renamed on 2026-08-08 for exactly this reason.
 *
 * Use `undefined` as the param type for events that carry no params.
 */
// These are all `import type`, so they are erased at compile time — no runtime
// import and therefore no dependency cycle, even though `trackEvent` is used
// inside some of the modules below.
import type { OnboardingStep } from './onboarding';
import type { PostPurchaseStep } from './postPurchaseOnboarding';
import type { PaywallSource } from './analytics/paywallSource';
import type { ReflectionOpenSource } from '@/hooks/reflection/useReflectionSheet';
import type { ActivationPath } from '@/lib/tracking/activation';

export interface AnalyticsEventParams {
  // --- Lifecycle ---
  // `days_since_install` is also derivable in BigQuery from
  // `user_first_touch_timestamp`, which is on 100% of exported rows and is
  // retroactive. Prefer the BigQuery value: measured 2026-08-08, the app-sent
  // number disagreed with it (sent 0 on a device 52 days past install) because
  // the local install date is seeded at first launch of a new version.
  app_open: { days_since_install: number };
  /** First time the user reaches the core loop. Fires at most once per user. */
  activation_reached: { path: ActivationPath; days_since_install?: number };

  // --- Onboarding ---
  // Onboarding is one Expo Router route driving 27 internal steps, so
  // screen_view cannot see per-step drop-off. These two params are the funnel.
  onboarding_step_viewed: { step_index: number; step_type: OnboardingStep['type'] };
  onboarding_complete: { goal_days: number };
  onboarding_survey_completed: {
    discovery_channel: string;
    age_range: string;
    motivation: string;
  };

  // --- Lessons ---
  lesson_started: { lesson_id: string };
  lesson_completed: { lesson_id: string };

  // --- Core loop: breathing / reflection / panic / recovery ---
  breathing_started: undefined;
  breathing_completed: { urge_resolved: boolean };
  reflection_opened: { source: ReflectionOpenSource };
  reflection_completed: { streak_day: number; urge_level: number };
  relapse_recorded: { previous_streak: number };
  panic_button_tapped: undefined;
  panic_screen_viewed: undefined;
  recovery_trigger_selected: { trigger: string };

  // --- Dashboard / achievements ---
  quick_action_tapped: { action: 'breathe' | 'checkin' | 'calendar' };
  achievements_opened: undefined;
  badge_unlocked: { badge_id: string; chapter: string };
  share_tapped: undefined;

  // --- Paywall depth ---
  // source は3イベントで同じ語彙を共有する（constants/analytics/paywallSource.ts）。
  // これがないと BigQuery で「どの導線が購入に繋がったか」を結合できない。
  benefits_screen_viewed: { source: PaywallSource };
  benefits_cta_tapped: undefined;
  paywall_viewed: { source: PaywallSource; offering: string };
  plan_selected: { plan: string };
  purchase_initiated: { plan: string };
  purchase_failed: { reason: string; cancelled: boolean };
  restore_tapped: undefined;
  restore_completed: { success: boolean };
  paywall_dismissed: { source: PaywallSource };
  pro_purchase_completed: { source: PaywallSource; plan: string; offering: string };

  // --- Post-purchase onboarding ---
  post_purchase_step_viewed: { step: PostPurchaseStep };
  post_purchase_onboarding_skipped: { from_step: number };
  post_purchase_blocker_activated: undefined;

  // --- Review / survey prompts ---
  review_prompt_shown: undefined;
  review_prompt_rated: { stars: number };
  review_prompt_feedback_tapped: undefined;
  review_prompt_dismissed: undefined;
  survey_prompt_accepted: undefined;
  survey_prompt_dismissed: undefined;
  // free_text は意図的に含めない。自由記述は Firestore にのみ残し、
  // Analytics には送らない（features/survey/surveyService.ts 参照）。
  survey_completed: { question_count: number; perceived_change: string };

  // --- Notifications ---
  notification_permission: { granted: boolean };
  notification_scheduled: { hour: number };
  notification_opened: { route: string };
}

export type AnalyticsEventName = keyof AnalyticsEventParams;
