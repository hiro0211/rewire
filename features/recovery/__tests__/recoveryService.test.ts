jest.mock('expo-crypto', () => ({
  randomUUID: () => 'recovery-uuid-123',
}));

const mockSave = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/storage/recoveryStorage', () => ({
  recoveryStorage: {
    save: (...args: any[]) => mockSave(...args),
  },
}));

import { recoveryService } from '../recoveryService';

describe('recoveryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正しいRecoveryオブジェクトを返す', async () => {
    const result = await recoveryService.saveRecovery('user-1', 'ストレス', 'checkin-1');

    expect(result).toMatchObject({
      id: 'recovery-uuid-123',
      userId: 'user-1',
      trigger: 'ストレス',
      checkinId: 'checkin-1',
    });
    expect(result.createdAt).toBeTruthy();
  });

  it('ストレージにsaveが呼ばれる', async () => {
    await recoveryService.saveRecovery('user-1', 'ストレス', 'checkin-1');

    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'recovery-uuid-123',
        userId: 'user-1',
        trigger: 'ストレス',
        checkinId: 'checkin-1',
      }),
    );
  });

  it('空文字のtriggerでもクラッシュしない', async () => {
    const result = await recoveryService.saveRecovery('user-1', '', 'checkin-1');
    expect(result.trigger).toBe('');
  });

  it('ストレージ保存が失敗した場合エラーがthrowされる', async () => {
    mockSave.mockRejectedValueOnce(new Error('Storage error'));

    await expect(
      recoveryService.saveRecovery('user-1', 'test', 'checkin-1'),
    ).rejects.toThrow('Storage error');
  });
});
