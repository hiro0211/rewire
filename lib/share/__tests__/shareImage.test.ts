import { shareImageFile } from '../shareImage';

const mockIsAvailableAsync = jest.fn();
const mockShareAsync = jest.fn();
jest.mock('expo-sharing', () => ({
  isAvailableAsync: (...args: any[]) => mockIsAvailableAsync(...args),
  shareAsync: (...args: any[]) => mockShareAsync(...args),
}));

describe('shareImageFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAvailableAsync.mockResolvedValue(true);
    mockShareAsync.mockResolvedValue(undefined);
  });

  it('file:// プレフィックスなしのパスに file:// を付与して shareAsync を呼ぶ', async () => {
    await shareImageFile('/tmp/test.png');

    expect(mockShareAsync).toHaveBeenCalledWith('file:///tmp/test.png', {
      mimeType: 'image/png',
      UTI: 'public.png',
    });
  });

  it('既に file:// プレフィックスがある URI を二重プレフィックスしない', async () => {
    await shareImageFile('file:///tmp/test.png');

    expect(mockShareAsync).toHaveBeenCalledWith('file:///tmp/test.png', {
      mimeType: 'image/png',
      UTI: 'public.png',
    });
  });

  it('共有が利用不可の場合にエラーをスローする', async () => {
    mockIsAvailableAsync.mockResolvedValue(false);

    await expect(shareImageFile('/tmp/test.png')).rejects.toThrow(
      'Sharing is not available on this device',
    );
    expect(mockShareAsync).not.toHaveBeenCalled();
  });
});
