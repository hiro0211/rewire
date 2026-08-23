import React from 'react';
import { useRouter } from 'expo-router';

import { SettingSection } from '@/components/settings/SettingSection';
import { SettingItem } from '@/components/settings/SettingItem';
import { DEBUG_MENU_ENABLED } from '@/constants/debug';
import { useLocale } from '@/hooks/useLocale';
import { ROUTES, routeWithParams } from '@/lib/routing/routes';

interface SettingsDebugSectionProps {
  unlockAll: boolean;
  onToggleUnlockAll: (value: boolean) => void;
}

/**
 * 開発用メニュー。`DEBUG_MENU_ENABLED` が false のとき何も描画しない。
 *
 * 設定画面本体から切り出しているのは、開発専用のコードを製品画面に混ぜないため。
 * ここを消しても設定画面の責務は一切変わらない、という関係を保つ。
 *
 * ⚠️ archive / TestFlight / App Store 提出ビルドの前には
 *    `constants/debug.ts` の `DEBUG_MENU_ENABLED` を false に戻すこと。
 */
export function SettingsDebugSection({
  unlockAll,
  onToggleUnlockAll,
}: SettingsDebugSectionProps) {
  const router = useRouter();
  const { t } = useLocale();

  if (!DEBUG_MENU_ENABLED) return null;

  return (
    <SettingSection title={t('settings.sections.debug')}>
      <SettingItem
        label={t('settings.labels.debugUnlockAll')}
        icon="planet-outline"
        type="toggle"
        toggleValue={unlockAll}
        onToggle={onToggleUnlockAll}
      />
      <SettingItem
        label={t('settings.labels.replayOnboarding')}
        icon="refresh-outline"
        onPress={() => router.push(ROUTES.onboarding)}
      />
      <SettingItem
        label={t('settings.labels.replayPostPurchaseOnboarding')}
        icon="sparkles-outline"
        onPress={() => router.push(ROUTES.postPurchaseOnboarding)}
      />
      {/*
        バリアントを明示して開く。指定しないと user.id のハッシュ次第で片方しか
        出ず、目視確認ができない。デバッグ指定で開いた分は paywall_viewed を
        送らない（A/B の母数を汚さない）。

        ⚠️ シミュレーターでは StoreKit 設定ファイルが無いと商品を取得できず
           「いま、つながりません」になる。ios/Rewire.storekit と scheme の
           StoreKitConfigurationFileReference を確認すること。
      */}
      <SettingItem
        label={t('settings.labels.debugPaywallCosmic')}
        icon="planet-outline"
        onPress={() =>
          router.push(routeWithParams(ROUTES.paywall, { debugVariant: 'cosmicJourney' }))
        }
      />
      <SettingItem
        label={t('settings.labels.debugPaywallDefault')}
        icon="card-outline"
        onPress={() =>
          router.push(routeWithParams(ROUTES.paywall, { debugVariant: 'default' }))
        }
        isLast
      />
    </SettingSection>
  );
}
