const mockGetState = jest.fn();
jest.mock('@/stores/localeStore', () => ({
  useLocaleStore: { getState: () => mockGetState() },
}));

const mockGetDeviceLocale = jest.fn();
jest.mock('@/locales/i18n', () => ({
  getDeviceLocale: () => mockGetDeviceLocale(),
}));

import { resolveWidgetLocale } from '../resolveWidgetLocale';

describe('resolveWidgetLocale', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDeviceLocale.mockReturnValue('ja');
  });

  it('preference が en のとき en を返す', () => {
    mockGetState.mockReturnValue({ localePreference: 'en' });
    expect(resolveWidgetLocale()).toBe('en');
  });

  it('preference が ja のとき ja を返す', () => {
    mockGetState.mockReturnValue({ localePreference: 'ja' });
    expect(resolveWidgetLocale()).toBe('ja');
  });

  it('preference が system のとき端末言語(en)にフォールバックする', () => {
    mockGetState.mockReturnValue({ localePreference: 'system' });
    mockGetDeviceLocale.mockReturnValue('en');
    expect(resolveWidgetLocale()).toBe('en');
  });

  it('preference が system のとき端末言語(ja)にフォールバックする', () => {
    mockGetState.mockReturnValue({ localePreference: 'system' });
    mockGetDeviceLocale.mockReturnValue('ja');
    expect(resolveWidgetLocale()).toBe('ja');
  });
});
