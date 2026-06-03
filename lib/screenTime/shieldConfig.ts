import type { ShieldActions, ShieldConfiguration } from 'react-native-device-activity';
import { PANIC_NOTIFICATION_IDENTIFIER, PANIC_ROUTE } from '@/constants/screenTime/screenTimeConfig';

type Translator = (key: string) => string;

const SHIELD_BACKGROUND = { red: 10, green: 10, blue: 15, alpha: 1 };
const BUTTON_BG = { red: 139, green: 92, blue: 246, alpha: 1 };
const WHITE = { red: 255, green: 255, blue: 255, alpha: 1 };

export function buildRewireShieldConfig(t: Translator): ShieldConfiguration {
  return {
    backgroundColor: SHIELD_BACKGROUND,
    title: t('notification.blockedSiteTitle'),
    titleColor: WHITE,
    subtitle: t('notification.blockedSiteBody'),
    subtitleColor: WHITE,
    primaryButtonLabel: t('screenTime.shieldPrimaryButton'),
    primaryButtonBackgroundColor: BUTTON_BG,
    primaryButtonLabelColor: WHITE,
    secondaryButtonLabel: t('screenTime.shieldSecondaryButton'),
    secondaryButtonLabelColor: WHITE,
  };
}

export function buildShieldActions(): ShieldActions {
  return {
    primary: {
      behavior: 'defer',
      actions: [
        {
          type: 'sendNotification',
          payload: {
            title: 'Rewire',
            body: '衝動に気づきました。今の気持ちを振り返りましょう。',
            sound: 'default',
            categoryIdentifier: PANIC_NOTIFICATION_IDENTIFIER,
            userInfo: { route: PANIC_ROUTE },
          },
        },
      ],
    },
    secondary: {
      behavior: 'close',
    },
  };
}
