import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { getLocales } from 'expo-localization';
import { safariWebExtensionBridge } from '@/lib/safariWebExtension/safariWebExtensionBridge';
import { deriveStatus } from '@/lib/safariWebExtension/deriveStatus';
import type { DeletionDebugInfo } from './types';

const UNKNOWN = 'unknown';

/** null/undefined/空文字をフォールバック値に正規化する */
function str(value: string | null | undefined, fallback = UNKNOWN): string {
  return value != null && value !== '' ? value : fallback;
}

/** Safari 拡張の稼働状況を deriveStatus で文字列化する。取得失敗時は never */
async function resolveWebExtensionStatus(): Promise<string> {
  try {
    const status = await safariWebExtensionBridge.getExtensionStatus();
    return deriveStatus({
      lastActiveAt: status.lastActiveAt,
      hasAllUrls: status.hasAllUrls,
      nowSeconds: Date.now() / 1000,
    });
  } catch {
    return 'never';
  }
}

/**
 * 削除前フィードバックメールに同梱するデバッグ情報を収集する。
 * 各ネイティブ API は取得失敗時に unknown へフォールバックする。
 */
export async function collectDeletionDebugInfo(): Promise<DeletionDebugInfo> {
  const appVersion = str(
    Application.nativeApplicationVersion,
    str(Constants.expoConfig?.version),
  );

  return {
    appVersion,
    buildNumber: str(Application.nativeBuildVersion),
    iosVersion: str(Device.osVersion),
    iosBuildId: str(Device.osBuildId),
    deviceModelId: str(Device.modelId),
    languageTag: str(getLocales()[0]?.languageTag),
    timezone: str(Intl.DateTimeFormat().resolvedOptions().timeZone),
    webExtensionStatus: await resolveWebExtensionStatus(),
  };
}
