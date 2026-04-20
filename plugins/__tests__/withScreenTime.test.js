const withScreenTime = require('../withScreenTime');

describe('withScreenTime plugin', () => {
  it('プラグインが関数としてexportされる', () => {
    expect(typeof withScreenTime).toBe('function');
  });

  describe('generateShieldConfigSwift', () => {
    it('ShieldConfigurationDataSource を含む Swift コードを生成する', () => {
      const swift = withScreenTime._generateShieldConfigSwift();
      expect(swift).toContain('ShieldConfigurationDataSource');
      expect(swift).toContain('ShieldConfiguration');
    });

    it('Rewire ブランドカラーを含む', () => {
      const swift = withScreenTime._generateShieldConfigSwift();
      expect(swift).toContain('0A0A0F');
      expect(swift).toContain('8B5CF6');
    });

    it('日本語の Shield テキストを含む', () => {
      const swift = withScreenTime._generateShieldConfigSwift();
      expect(swift).toContain('Rewire');
      expect(swift).toContain('このサイトはブロックされています');
      expect(swift).toContain('Rewireを開く');
    });
  });

  describe('generateShieldActionSwift', () => {
    it('ShieldActionDelegate を含む Swift コードを生成する', () => {
      const swift = withScreenTime._generateShieldActionSwift();
      expect(swift).toContain('ShieldActionDelegate');
    });

    it('通知ペイロードに /panic ルートを含む', () => {
      const swift = withScreenTime._generateShieldActionSwift();
      expect(swift).toContain('/panic');
      expect(swift).toContain('route');
    });

    it('.close を返す', () => {
      const swift = withScreenTime._generateShieldActionSwift();
      expect(swift).toContain('.close');
    });

    it('通知テキストを含む', () => {
      const swift = withScreenTime._generateShieldActionSwift();
      expect(swift).toContain('衝動に気づきました');
    });
  });

  describe('generateDeviceActivityMonitorSwift', () => {
    it('DeviceActivityMonitorExtension を含む最小実装を生成する', () => {
      const swift = withScreenTime._generateDeviceActivityMonitorSwift();
      expect(swift).toContain('DeviceActivityMonitor');
    });
  });

  describe('generateInfoPlist', () => {
    it('有効な plist 形式を生成する', () => {
      const plist = withScreenTime._generateInfoPlist('ShieldConfiguration', 'com.apple.ManagedSettingsUI.shield-configuration');
      expect(plist).toContain('<?xml');
      expect(plist).toContain('NSExtensionPointIdentifier');
      expect(plist).toContain('com.apple.ManagedSettingsUI.shield-configuration');
    });
  });

  describe('generateEntitlements', () => {
    it('Family Controls と App Group のエンタイトルメントを含む', () => {
      const ent = withScreenTime._generateEntitlements();
      expect(ent).toContain('com.apple.developer.family-controls');
      expect(ent).toContain('group.rewire.app.com');
    });
  });
});
