import { Platform } from 'react-native';
import { createWidgetPayload, type WidgetDataInput } from './widgetPayload';

function getNativeModule(): {
  syncData: (json: string) => Promise<void>;
  reloadTimelines: () => Promise<void>;
} | null {
  try {
    const mod = require('../../modules/expo-widget-sync/src').default;
    return mod ?? null;
  } catch {
    return null;
  }
}

export async function syncWidgetData(input: WidgetDataInput): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    const mod = getNativeModule();
    if (!mod) return;
    const payload = createWidgetPayload(input);
    await mod.syncData(JSON.stringify(payload));
    await mod.reloadTimelines();
  } catch (error) {
    console.error('[WidgetSync] syncWidgetData failed:', error);
  }
}

export async function clearWidgetData(): Promise<void> {
  await syncWidgetData({
    streakStartDate: null,
    goalDays: 0,
    relapseCount: 0,
  });
}
