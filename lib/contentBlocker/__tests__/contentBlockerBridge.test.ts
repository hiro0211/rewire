/**
 * contentBlockerBridge のテスト
 *
 * 要件: Safari の機能拡張で Rewire のトグルが ON なら
 *       アプリ側で isEnabled=true（「有効」表示）が返ること
 */

const mockGetBlockerStatus = jest.fn();
const mockReloadBlockerRules = jest.fn();
const mockEnableBlocker = jest.fn();
const mockDisableBlocker = jest.fn();

jest.mock('../../../modules/expo-content-blocker/src', () => ({
  default: {
    enableBlocker: mockEnableBlocker,
    disableBlocker: mockDisableBlocker,
    getBlockerStatus: mockGetBlockerStatus,
    reloadBlockerRules: mockReloadBlockerRules,
  },
}));

// react-native は jest-expo の preset でモックされているが
// Platform.OS を 'ios' に設定するため上書きする
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Platform.OS = 'ios';
  return rn;
});

import { contentBlockerBridge } from '../contentBlockerBridge';

describe('contentBlockerBridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBlockerStatus — 要件検証', () => {
    it('Safari拡張機能がON (isEnabled: true) のとき「有効」相当の値を返す', async () => {
      mockGetBlockerStatus.mockResolvedValue({
        isEnabled: true,
        extensionBundleId: 'com.example.rewire.ContentBlockerExtension',
      });

      const status = await contentBlockerBridge.getBlockerStatus();

      // ネイティブから isEnabled: true が返る
      expect(status.isEnabled).toBe(true);
      // UI の表示ロジック: blockerEnabled ? '有効' : '無効'
      expect(status.isEnabled ? '有効' : '無効').toBe('有効');
    });

    it('Safari拡張機能がOFF (isEnabled: false) のとき「無効」相当の値を返す', async () => {
      mockGetBlockerStatus.mockResolvedValue({
        isEnabled: false,
        extensionBundleId: 'com.example.rewire.ContentBlockerExtension',
      });

      const status = await contentBlockerBridge.getBlockerStatus();

      expect(status.isEnabled).toBe(false);
      expect(status.isEnabled ? '有効' : '無効').toBe('無効');
    });

    it('ネイティブモジュールがエラーを投げた場合は isEnabled: false で安全にフォールバックする', async () => {
      mockGetBlockerStatus.mockRejectedValue(new Error('Native module error'));

      const status = await contentBlockerBridge.getBlockerStatus();

      expect(status.isEnabled).toBe(false);
    });

    it('getBlockerStatus はネイティブモジュールを1回だけ呼ぶ', async () => {
      mockGetBlockerStatus.mockResolvedValue({ isEnabled: true, extensionBundleId: '' });

      await contentBlockerBridge.getBlockerStatus();

      expect(mockGetBlockerStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('reloadBlockerRules', () => {
    it('ルールのリロードが成功したとき true を返す', async () => {
      mockReloadBlockerRules.mockResolvedValue(true);

      const result = await contentBlockerBridge.reloadBlockerRules();

      expect(result).toBe(true);
    });

    it('ルールのリロードが失敗したとき false を返す', async () => {
      mockReloadBlockerRules.mockRejectedValue(new Error('reload failed'));

      const result = await contentBlockerBridge.reloadBlockerRules();

      expect(result).toBe(false);
    });
  });
});
