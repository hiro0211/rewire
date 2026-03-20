import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import { ja } from './ja';
import { en } from './en';
import type { SupportedLocale } from '@/types/i18n';

const i18n = new I18n({ ja, en });
i18n.defaultLocale = 'ja';
i18n.enableFallback = true;

const deviceLanguage = getLocales()[0]?.languageCode ?? 'ja';
i18n.locale = deviceLanguage === 'en' ? 'en' : 'ja';

export { i18n };

export function setLocale(locale: SupportedLocale): void {
  i18n.locale = locale;
}

export function getDeviceLocale(): SupportedLocale {
  const lang = getLocales()[0]?.languageCode ?? 'ja';
  return lang === 'en' ? 'en' : 'ja';
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
