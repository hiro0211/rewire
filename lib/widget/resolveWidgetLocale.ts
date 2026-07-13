import { useLocaleStore } from '@/stores/localeStore';
import { getDeviceLocale } from '@/locales/i18n';
import type { SupportedLocale } from '@/types/i18n';

/**
 * ウィジェットへ渡す表示言語を解決する。
 *
 * アプリ内の言語設定（localeStore の localePreference）を尊重し、
 * 'system' の場合のみ端末言語にフォールバックする。useLocale と同じ解決ロジック。
 * ネイティブウィジェットはアプリの i18n を参照できないため、解決済みの言語コードを
 * 同期ペイロードに載せて渡す必要がある。
 */
export function resolveWidgetLocale(): SupportedLocale {
  const preference = useLocaleStore.getState().localePreference;
  return preference === 'system' ? getDeviceLocale() : preference;
}
