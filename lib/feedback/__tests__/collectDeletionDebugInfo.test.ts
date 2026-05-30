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

jest.mock('@/lib/safariWebExtension/safariWebExtensionBridge', () => ({
  safariWebExtensionBridge: { getExtensionStatus: jest.fn() },
}));

import { collectDeletionDebugInfo } from '../collectDeletionDebugInfo';
import { safariWebExtensionBridge } from '@/lib/safariWebExtension/safariWebExtensionBridge';

const mockGetStatus = safariWebExtensionBridge.getExtensionStatus as jest.Mock;

const activeStatus = (nowSeconds: number) => ({
  isEnabled: true,
  hasAllUrls: true,
  extensionBundleId: 'x',
  lastActiveAt: nowSeconds - 60,
  lastBlockedAt: 0,
});

describe('collectDeletionDebugInfo', () => {
  beforeEach(() => {
    mockState.appVersion = '2.1.0';
    mockState.buildNumber = '42';
    mockState.modelId = 'iPhone17,5';
    mockState.osVersion = '26.5';
    mockState.osBuildId = '23F77';
    mockGetStatus.mockReset();
    mockGetStatus.mockResolvedValue(activeStatus(Date.now() / 1000));
    jest
      .spyOn(Intl, 'DateTimeFormat')
      .mockReturnValue({
        resolvedOptions: () => ({ timeZone: 'Asia/Tokyo' }),
      } as unknown as Intl.DateTimeFormat);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('appVersionがnativeApplicationVersionになる', async () => {
    expect((await collectDeletionDebugInfo()).appVersion).toBe('2.1.0');
  });

  it('buildNumberがnativeBuildVersionになる', async () => {
    expect((await collectDeletionDebugInfo()).buildNumber).toBe('42');
  });

  it('deviceModelIdがDevice.modelIdになる', async () => {
    expect((await collectDeletionDebugInfo()).deviceModelId).toBe('iPhone17,5');
  });

  it('iosVersionがDevice.osVersionになる', async () => {
    expect((await collectDeletionDebugInfo()).iosVersion).toBe('26.5');
  });

  it('iosBuildIdがDevice.osBuildIdになる', async () => {
    expect((await collectDeletionDebugInfo()).iosBuildId).toBe('23F77');
  });

  it('languageTagがgetLocalesの言語タグになる', async () => {
    expect((await collectDeletionDebugInfo()).languageTag).toBe('ja-JP');
  });

  it('timezoneがIntlのresolvedOptionsから取得される', async () => {
    expect((await collectDeletionDebugInfo()).timezone).toBe('Asia/Tokyo');
  });

  it('webExtensionStatusがderiveStatusの結果(active)になる', async () => {
    expect((await collectDeletionDebugInfo()).webExtensionStatus).toBe('active');
  });

  it('Device.modelIdがnullのときunknownになる', async () => {
    mockState.modelId = null;
    expect((await collectDeletionDebugInfo()).deviceModelId).toBe('unknown');
  });

  it('nativeApplicationVersionがnullのときConstantsのversionにフォールバックする', async () => {
    mockState.appVersion = null;
    expect((await collectDeletionDebugInfo()).appVersion).toBe('9.9.9');
  });

  it('getExtensionStatusが例外を投げてもneverを返す', async () => {
    mockGetStatus.mockRejectedValue(new Error('boom'));
    expect((await collectDeletionDebugInfo()).webExtensionStatus).toBe('never');
  });
});
