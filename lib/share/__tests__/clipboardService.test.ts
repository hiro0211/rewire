import { copyToClipboard } from '../clipboardService';

const mockSetStringAsync = jest.fn();
jest.mock('expo-clipboard', () => ({
  setStringAsync: (...args: any[]) => mockSetStringAsync(...args),
}));

describe('copyToClipboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('テキストがクリップボードにコピーされ true を返す', async () => {
    mockSetStringAsync.mockResolvedValue(true);

    const result = await copyToClipboard('#Rewire ポルノ禁10日 💪');

    expect(mockSetStringAsync).toHaveBeenCalledWith('#Rewire ポルノ禁10日 💪');
    expect(result).toBe(true);
  });

  it('コピー失敗時に false を返す', async () => {
    mockSetStringAsync.mockRejectedValue(new Error('clipboard error'));

    const result = await copyToClipboard('test');

    expect(result).toBe(false);
  });
});
