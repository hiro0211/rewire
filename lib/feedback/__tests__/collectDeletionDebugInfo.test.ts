// 可変ホルダ。各テストで beforeEach に初期化し、ゲッター経由でネイティブ値を差し替える
const mockState = {
  appVersion: '2.1.0' as string | null,
  buildNumber: '42' as string | null,
  modelId: 'iPhone17,5' as string | null,
  osVersion: '26.5' as string | null,
  osBuildId: '23F77' as string | null,
};

jest.mock('expo-application', () => ({
  get nativeApplicationVersion() {
    return mockState.appVersion;
  },
  get nativeBuildVersion() {
    return mockState.buildNumber;
  },
}));

jest.mock('expo-device', () => ({
  get modelId() {
    return mockState.modelId;
  },
  get osVersion() {
    return mockState.osVersion;
  },
  get osBuildId() {
    return mockState.osBuildId;
  },
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'ja', languageTag: 'ja-JP' }],
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '9.9.9' } },
}));

import { collectDeletionDebugInfo } from '../collectDeletionDebugInfo';

describe('collectDeletionDebugInfo', () => {
  beforeEach(() => {
    mockState.appVersion = '2.1.0';
    mockState.buildNumber = '42';
    mockState.modelId = 'iPhone17,5';
    mockState.osVersion = '26.5';
    mockState.osBuildId = '23F77';
    jest
      .spyOn(Intl, 'DateTimeFormat')
      .mockReturnValue({
        resolvedOptions: () => ({ timeZone: 'Asia/Tokyo' }),
      } as unknown as Intl.DateTimeFormat);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('appVersion が nativeApplicationVersion になる', async () => {
    expect((await collectDeletionDebugInfo()).appVersion).toBe('2.1.0');
  });

  it('buildNumber が nativeBuildVersion になる', async () => {
    expect((await collectDeletionDebugInfo()).buildNumber).toBe('42');
  });

  it('deviceModelId が Device.modelId になる', async () => {
    expect((await collectDeletionDebugInfo()).deviceModelId).toBe('iPhone17,5');
  });

  it('iosVersion が Device.osVersion になる', async () => {
    expect((await collectDeletionDebugInfo()).iosVersion).toBe('26.5');
  });

  it('iosBuildId が Device.osBuildId になる', async () => {
    expect((await collectDeletionDebugInfo()).iosBuildId).toBe('23F77');
  });

  it('languageTag が getLocales の言語タグになる', async () => {
    expect((await collectDeletionDebugInfo()).languageTag).toBe('ja-JP');
  });

  it('timezone が Intl の resolvedOptions から取得される', async () => {
    expect((await collectDeletionDebugInfo()).timezone).toBe('Asia/Tokyo');
  });

  it('Device.modelId が null のとき unknown になる', async () => {
    mockState.modelId = null;
    expect((await collectDeletionDebugInfo()).deviceModelId).toBe('unknown');
  });

  it('nativeApplicationVersion が null のとき Constants の version にフォールバックする', async () => {
    mockState.appVersion = null;
    expect((await collectDeletionDebugInfo()).appVersion).toBe('9.9.9');
  });
});
