import { renderHook } from '@testing-library/react-native';
import { useLocale } from '@/hooks/useLocale';
import { useLocaleStore } from '@/stores/localeStore';

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'ja' }],
}));

jest.mock('i18n-js', () => {
  const translations: Record<string, Record<string, unknown>> = {};
  return {
    I18n: jest.fn().mockImplementation(() => ({
      locale: 'ja',
      defaultLocale: 'ja',
      enableFallback: true,
      store: { set: (l: string, t: unknown) => { translations[l] = t as Record<string, unknown>; } },
      t: (key: string) => key,
    })),
  };
});

describe('useLocale', () => {
  beforeEach(() => {
    useLocaleStore.setState({ localePreference: 'system' });
  });

  it('t関数を返す', () => {
    const { result } = renderHook(() => useLocale());
    expect(typeof result.current.t).toBe('function');
  });

  it('locale値を返す', () => {
    const { result } = renderHook(() => useLocale());
    expect(['ja', 'en']).toContain(result.current.locale);
  });

  it('isJapaneseフラグを返す', () => {
    const { result } = renderHook(() => useLocale());
    expect(typeof result.current.isJapanese).toBe('boolean');
  });

  it('preference=jaのときlocaleがjaになる', () => {
    useLocaleStore.setState({ localePreference: 'ja' });
    const { result } = renderHook(() => useLocale());
    expect(result.current.locale).toBe('ja');
    expect(result.current.isJapanese).toBe(true);
  });

  it('preference=enのときlocaleがenになる', () => {
    useLocaleStore.setState({ localePreference: 'en' });
    const { result } = renderHook(() => useLocale());
    expect(result.current.locale).toBe('en');
    expect(result.current.isJapanese).toBe(false);
  });
});
