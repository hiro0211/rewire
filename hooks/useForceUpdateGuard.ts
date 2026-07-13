import { useEffect, useState } from 'react';
import * as Application from 'expo-application';
import { appConfigClient } from '@/lib/appConfig/appConfigClient';
import { isVersionLessThan } from '@/lib/version/compareVersions';

/**
 * 強制アップデート判定。
 *
 * 起動時に Firestore の最低サポートバージョン（appConfig/ios の
 * minSupportedVersion）を取得し、インストール中のバージョンが古ければ
 * isUpdateRequired=true を返す。取得失敗・オフライン時はブロックしない
 * （フェイルオープン）。
 */
export function useForceUpdateGuard(): { isUpdateRequired: boolean } {
  const [isUpdateRequired, setIsUpdateRequired] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const minVersion = await appConfigClient.fetchMinSupportedVersion();
        if (cancelled || !minVersion) return;
        const currentVersion = Application.nativeApplicationVersion;
        if (!currentVersion) return;
        if (isVersionLessThan(currentVersion, minVersion)) {
          setIsUpdateRequired(true);
        }
      } catch {
        // フェイルオープン: 判定不能時はブロックしない
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { isUpdateRequired };
}
