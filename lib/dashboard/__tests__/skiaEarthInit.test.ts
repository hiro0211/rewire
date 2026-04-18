jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { executionEnvironment: 'standalone' },
}));

describe('skiaEarthInit', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('ExpoGo環境ではすべてnullを返す', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: { executionEnvironment: 'storeClient' },
    }));
    const { skiaEarthInit } = require('../skiaEarthInit');
    const result = skiaEarthInit();
    expect(result.SkiaCanvas).toBeNull();
    expect(result.SkiaFill).toBeNull();
    expect(result.SkiaShader).toBeNull();
    expect(result.SkiaImageShader).toBeNull();
    expect(result.runtimeEffect).toBeNull();
  });

  it('Skiaが利用可能な環境ではコンポーネントを返す', () => {
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
    const { skiaEarthInit } = require('../skiaEarthInit');
    const result = skiaEarthInit();
    expect(result.SkiaCanvas).toBe(MockCanvas);
    expect(result.SkiaFill).toBe(MockFill);
    expect(result.SkiaShader).toBe(MockShader);
    expect(result.SkiaImageShader).toBe(MockImageShader);
    expect(result.runtimeEffect).toBeDefined();
  });

  it('Skia requireが失敗した場合はすべてnullを返す', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: { executionEnvironment: 'standalone' },
    }));
    jest.doMock('@shopify/react-native-skia', () => {
      throw new Error('Native module not found');
    });
    const { skiaEarthInit } = require('../skiaEarthInit');
    const result = skiaEarthInit();
    expect(result.SkiaCanvas).toBeNull();
    expect(result.SkiaFill).toBeNull();
    expect(result.SkiaShader).toBeNull();
    expect(result.SkiaImageShader).toBeNull();
    expect(result.runtimeEffect).toBeNull();
  });
});
