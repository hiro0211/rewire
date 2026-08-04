/**
 * Single source of truth for feature-usage analytics events + their param shapes.
 *
 * New events MUST be fired through `trackEvent` (lib/tracking/trackEvent.ts) so
 * names and params are type-checked at the call site (no stray string typos).
 *
 * NOTE: when adding an event here, also add its name to `REWIRE_KEY_EVENTS` in
 * `scripts/analytics/firebase_ga4_client.py` so the daily report picks it up.
 * The sync crosses a language boundary, so it is enforced by
 * `scripts/analytics/tests/test_event_registry_sync.py` rather than by hand —
 * that suite fails on an event fired but unlisted, or listed but never fired.
 *
 * Use `undefined` as the param type for events that carry no params.
 */
import type { PaywallSource } from './analytics/paywallSource';

export interface AnalyticsEventParams {
  // --- Lessons ---
  lesson_started: { lesson_id: string };
  lesson_completed: { lesson_id: string };

  // --- Dashboard / achievements ---
  quick_action_tapped: { action: 'breathe' | 'checkin' | 'calendar' };
  achievements_opened: undefined;
  badge_unlocked: { badge_id: string; chapter: string };

  // --- Paywall depth ---
  // source は3イベントで同じ語彙を共有する（constants/analytics/paywallSource.ts）。
  // これがないと BigQuery で「どの導線が購入に繋がったか」を結合できない。
  benefits_screen_viewed: { source: PaywallSource };
  paywall_viewed: { source: PaywallSource; offering: string };
  plan_selected: { plan: string };
  purchase_initiated: { plan: string };
  purchase_failed: { reason: string; cancelled: boolean };
  restore_tapped: undefined;
  restore_completed: { success: boolean };
  paywall_dismissed: { source: PaywallSource };
  pro_purchase_completed: { source: PaywallSource; plan: string; offering: string };

  // --- Notifications ---
  notification_permission: { granted: boolean };
  notification_scheduled: { hour: number };
  notification_opened: { route: string };
}

export type AnalyticsEventName = keyof AnalyticsEventParams;
