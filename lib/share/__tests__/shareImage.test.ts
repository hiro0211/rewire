import { Share } from 'react-native';
import { shareWithImage } from '../shareImage';

describe('shareWithImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' } as any);
  });

  it('Share.share に message と url を渡して呼ばれる', async () => {
    await shareWithImage('#Rewire test', '/tmp/test.png');

    expect(Share.share).toHaveBeenCalledWith({
      message: '#Rewire test',
      url: 'file:///tmp/test.png',
    });
  });

  it('file:// プレフィックスなしのパスに file:// を付与する', async () => {
    await shareWithImage('text', '/tmp/test.png');

    expect(Share.share).toHaveBeenCalledWith({
      message: 'text',
      url: 'file:///tmp/test.png',
    });
  });

  it('既に file:// プレフィックスがある URI を二重プレフィックスしない', async () => {
    await shareWithImage('text', 'file:///tmp/test.png');

    expect(Share.share).toHaveBeenCalledWith({
      message: 'text',
      url: 'file:///tmp/test.png',
    });
  });

  it('Share.share のエラーが呼び出し元に伝播する', async () => {
    jest.spyOn(Share, 'share').mockRejectedValue(new Error('share failed'));

    await expect(shareWithImage('text', '/tmp/test.png')).rejects.toThrow('share failed');
  });
});
