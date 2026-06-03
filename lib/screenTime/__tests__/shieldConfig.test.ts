import { buildRewireShieldConfig, buildShieldActions } from '../shieldConfig';
import { PANIC_NOTIFICATION_IDENTIFIER, PANIC_ROUTE } from '@/constants/screenTime/screenTimeConfig';

describe('shieldConfig', () => {
  describe('buildRewireShieldConfig', () => {
    const t = (key: string) => {
      const map: Record<string, string> = {
        'notification.blockedSiteTitle': 'Rewire',
        'notification.blockedSiteBody': '衝動に気づきました。今の気持ちを振り返りましょう。',
        'screenTime.shieldPrimaryButton': 'Rewireを開く',
        'screenTime.shieldSecondaryButton': '閉じる',
      };
      return map[key] ?? key;
    };

    it('i18nのtitle/subtitleを設定に含める', () => {
      const config = buildRewireShieldConfig(t);
      expect(config.title).toBe('Rewire');
      expect(config.subtitle).toBe('衝動に気づきました。今の気持ちを振り返りましょう。');
    });

    it('primary/secondaryボタンのラベルをi18nで設定する', () => {
      const config = buildRewireShieldConfig(t);
      expect(config.primaryButtonLabel).toBe('Rewireを開く');
      expect(config.secondaryButtonLabel).toBe('閉じる');
    });

    it('DARKパレットの背景色を使用する', () => {
      const config = buildRewireShieldConfig(t);
      expect(config.backgroundColor).toEqual({ red: 10, green: 10, blue: 15, alpha: 1 });
    });
  });

  describe('buildShieldActions', () => {
    it('primary actionがbehavior="defer"でsendNotificationを実行する', () => {
      const actions = buildShieldActions();
      expect(actions.primary.behavior).toBe('defer');
      expect(actions.primary.actions).toHaveLength(1);
      expect(actions.primary.actions?.[0].type).toBe('sendNotification');
    });

    it('sendNotificationのpayloadにroute=/panicのuserInfoが含まれる', () => {
      const actions = buildShieldActions();
      const action = actions.primary.actions?.[0];
      expect(action?.type).toBe('sendNotification');
      if (action?.type === 'sendNotification') {
        expect(action.payload.userInfo).toEqual({ route: PANIC_ROUTE });
      }
    });

    it('sendNotificationのcategoryIdentifierがフォールバック用に設定される', () => {
      const actions = buildShieldActions();
      const action = actions.primary.actions?.[0];
      if (action?.type === 'sendNotification') {
        expect(action.payload.categoryIdentifier).toBe(PANIC_NOTIFICATION_IDENTIFIER);
      }
    });

    it('secondary actionはShieldをcloseするだけ', () => {
      const actions = buildShieldActions();
      expect(actions.secondary?.behavior).toBe('close');
      expect(actions.secondary?.actions).toBeUndefined();
    });
  });
});
