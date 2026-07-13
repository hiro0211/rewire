import { useUserStore } from '@/stores/userStore';
import { useCheckinStore } from '@/stores/checkinStore';
import { calculateRelapseCount } from '@/lib/stats/statsCalculator';
import { syncWidgetData } from './widgetDataSync';

/**
 * 現在のストア状態からウィジェットを再同期する。
 *
 * 言語切り替えのように、ウィジェット表示に影響するがユーザー/チェックインの
 * 変更を伴わない操作の後に呼び出す。同期時に現在の言語（localePreference）が
 * ペイロードへ載るため、ウィジェットの文言が即座に切り替わる。
 */
export async function resyncWidgetFromStores(): Promise<void> {
  const user = useUserStore.getState().user;
  if (!user) return;
  await syncWidgetData({
    streakStartDate: user.streakStartDate,
    goalDays: user.goalDays,
    relapseCount: calculateRelapseCount(useCheckinStore.getState().checkins),
  });
}
