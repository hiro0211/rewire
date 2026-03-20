import { useLocaleStore } from '@/stores/localeStore';
import { i18n, t, getDeviceLocale, setLocale } from '@/locales/i18n';
import type { SupportedLocale } from '@/types/i18n';

interface UseLocaleReturn {
  t: typeof t;
  locale: SupportedLocale;
  isJapanese: boolean;
}

export function useLocale(): UseLocaleReturn {
  const preference = useLocaleStore((s) => s.localePreference);

  const resolvedLocale: SupportedLocale =
    preference === 'system' ? getDeviceLocale() : preference;

  if (i18n.locale !== resolvedLocale) {
    setLocale(resolvedLocale);
  }

  return {
    t,
    locale: resolvedLocale,
    isJapanese: resolvedLocale === 'ja',
  };
}
