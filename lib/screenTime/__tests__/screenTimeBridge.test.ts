/**
 * screenTimeBridge のテスト
 *
 * ネイティブモジュールが存在する場合と存在しない場合の両方をカバー。
 * Platform guard (iOS only) と try/catch のフォールバックを検証。
 */

import { Platform } from 'react-native';

const mockRequestAuthorization = jest.fn();
const mockGetAuthorizationStatus = jest.fn();
const mockEnableWebContentFilter = jest.fn();
const mockDisableWebContentFilter = jest.fn();

jest.mock('../../../modules/expo-screen-time/src', () => ({
  default: {
    requestAuthorization: (...args: any[]) => mockRequestAuthorization(...args),
    getAuthorizationStatus: (...args: any[]) => mockGetAuthorizationStatus(...args),
    enableWebContentFilter: (...args: any[]) => mockEnableWebContentFilter(...args),
    disableWebContentFilter: (...args: any[]) => mockDisableWebContentFilter(...args),
  },
}));

jest.mock('../../logger', () => ({
  logger: { error: jest.fn() },
}));

import { screenTimeBridge } from '../screenTimeBridge';

describe('screenTimeBridge', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  afterEach(() => {
    Platform.OS = originalOS;
  });

  describe('requestAuthorization', () => {
    it('iOS でネイティブモジュールを呼び出す', async () => {
      mockRequestAuthorization.mockResolvedValue({ status: 'approved' });
      const result = await screenTimeBridge.requestAuthorization();
      expect(result).toEqual({ status: 'approved' });
      expect(mockRequestAuthorization).toHaveBeenCalledTimes(1);
    });

    it('Android では notDetermined を返す', async () => {
      Platform.OS = 'android';
      const result = await screenTimeBridge.requestAuthorization();
      expect(result).toEqual({ status: 'notDetermined', error: 'Screen Time is only available on iOS' });
      expect(mockRequestAuthorization).not.toHaveBeenCalled();
    });

    it('ネイティブモジュールがエラーを投げた場合は notDetermined を返す', async () => {
      mockRequestAuthorization.mockRejectedValue(new Error('Native error'));
      const result = await screenTimeBridge.requestAuthorization();
      expect(result).toEqual({ status: 'notDetermined', error: 'Native error' });
    });
  });

  describe('getAuthorizationStatus', () => {
    it('iOS でステータスを返す', async () => {
      mockGetAuthorizationStatus.mockResolvedValue('approved');
      const status = await screenTimeBridge.getAuthorizationStatus();
      expect(status).toBe('approved');
    });

    it('Android では notDetermined を返す', async () => {
      Platform.OS = 'android';
      const status = await screenTimeBridge.getAuthorizationStatus();
      expect(status).toBe('notDetermined');
    });

    it('エラー時は notDetermined を返す', async () => {
      mockGetAuthorizationStatus.mockRejectedValue(new Error('fail'));
      const status = await screenTimeBridge.getAuthorizationStatus();
      expect(status).toBe('notDetermined');
    });
  });

  describe('enableWebContentFilter', () => {
    it('iOS で有効化に成功すると true を返す', async () => {
      mockEnableWebContentFilter.mockResolvedValue(true);
      const result = await screenTimeBridge.enableWebContentFilter();
      expect(result).toBe(true);
    });

    it('Android では false を返す', async () => {
      Platform.OS = 'android';
      const result = await screenTimeBridge.enableWebContentFilter();
      expect(result).toBe(false);
    });

    it('エラー時は false を返す', async () => {
      mockEnableWebContentFilter.mockRejectedValue(new Error('fail'));
      const result = await screenTimeBridge.enableWebContentFilter();
      expect(result).toBe(false);
    });
  });

  describe('disableWebContentFilter', () => {
    it('iOS で無効化に成功すると true を返す', async () => {
      mockDisableWebContentFilter.mockResolvedValue(true);
      const result = await screenTimeBridge.disableWebContentFilter();
      expect(result).toBe(true);
    });

    it('Android では false を返す', async () => {
      Platform.OS = 'android';
      const result = await screenTimeBridge.disableWebContentFilter();
      expect(result).toBe(false);
    });

    it('エラー時は false を返す', async () => {
      mockDisableWebContentFilter.mockRejectedValue(new Error('fail'));
      const result = await screenTimeBridge.disableWebContentFilter();
      expect(result).toBe(false);
    });
  });
});
