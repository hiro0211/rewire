jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { executionEnvironment: 'standalone' },
}));

describe('skiaOrbInit', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('ExpoGo環境ではすべてnullを返す', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: { executionEnvironment: 'storeClient' },
    }));
    const { skiaOrbInit } = require('../skiaOrbInit');
    const result = skiaOrbInit();
    expect(result.SkiaCanvas).toBeNull();
    expect(result.SkiaFill).toBeNull();
    expect(result.SkiaShader).toBeNull();
    expect(result.runtimeEffect).toBeNull();
  });

  it('Skiaが利用可能な環境ではコンポーネントを返す', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: { executionEnvironment: 'standalone' },
    }));
    // jest.setup already mocks @shopify/react-native-skia
    const { skiaOrbInit } = require('../skiaOrbInit');
    const result = skiaOrbInit();
    expect(result.SkiaCanvas).toBeDefined();
    expect(result.SkiaFill).toBeDefined();
    expect(result.SkiaShader).toBeDefined();
  });

  it('Skia requireが失敗した場合はすべてnullを返す', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: { executionEnvironment: 'standalone' },
    }));
    jest.doMock('@shopify/react-native-skia', () => {
      throw new Error('Native module not found');
    });
    const { skiaOrbInit } = require('../skiaOrbInit');
    const result = skiaOrbInit();
    expect(result.SkiaCanvas).toBeNull();
    expect(result.SkiaFill).toBeNull();
    expect(result.SkiaShader).toBeNull();
    expect(result.runtimeEffect).toBeNull();
  });
});
