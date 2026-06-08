jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { executionEnvironment: 'standalone' },
}));

describe('skiaPlanetInit', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('ExpoGo 環境ではすべて null を返す', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: { executionEnvironment: 'storeClient' },
    }));
    const { skiaPlanetInit } = require('../skiaPlanetInit');
    const result = skiaPlanetInit();
    expect(result.SkiaCanvas).toBeNull();
    expect(result.SkiaFill).toBeNull();
    expect(result.SkiaShader).toBeNull();
    expect(result.SkiaImageShader).toBeNull();
    expect(result.runtimeEffect).toBeNull();
  });

  it('Skia が利用可能な環境ではコンポーネントを返す', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: { executionEnvironment: 'standalone' },
    }));
    const MockCanvas = () => null;
    const MockFill = () => null;
    const MockShader = () => null;
    const MockImageShader = () => null;
    jest.doMock('@shopify/react-native-skia', () => ({
      Canvas: MockCanvas,
      Fill: MockFill,
      Shader: MockShader,
      ImageShader: MockImageShader,
      Skia: { RuntimeEffect: { Make: () => ({}) } },
    }));
    const { skiaPlanetInit } = require('../skiaPlanetInit');
    const result = skiaPlanetInit();
    expect(result.SkiaCanvas).toBe(MockCanvas);
    expect(result.SkiaFill).toBe(MockFill);
    expect(result.SkiaShader).toBe(MockShader);
    expect(result.SkiaImageShader).toBe(MockImageShader);
    expect(result.runtimeEffect).toBeDefined();
  });

  it('Skia require が失敗した場合はすべて null を返す', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: { executionEnvironment: 'standalone' },
    }));
    jest.doMock('@shopify/react-native-skia', () => {
      throw new Error('Native module not found');
    });
    const { skiaPlanetInit } = require('../skiaPlanetInit');
    const result = skiaPlanetInit();
    expect(result.SkiaCanvas).toBeNull();
    expect(result.SkiaFill).toBeNull();
    expect(result.SkiaShader).toBeNull();
    expect(result.SkiaImageShader).toBeNull();
    expect(result.runtimeEffect).toBeNull();
  });
});
