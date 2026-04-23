const path = require('path');

jest.mock('expo/metro-config', () => ({
  getDefaultConfig: jest.fn(() => ({
    transformer: {},
    resolver: {
      resolveRequest: undefined,
    },
  })),
}));

describe('metro.config.js', () => {
  let config;

  beforeAll(() => {
    jest.resetModules();
    config = require('../metro.config.js');
  });

  it('experimentalImportSupport と inlineRequires が有効', async () => {
    const options = await config.transformer.getTransformOptions();
    expect(options.transform.experimentalImportSupport).toBe(true);
    expect(options.transform.inlineRequires).toBe(true);
  });

  describe('resolver.resolveRequest: react-native-purchases browser stub', () => {
    const makeContext = () => ({
      resolveRequest: jest.fn((_ctx, name) => ({
        filePath: `/abs/node_modules/${name.replace(/^\.\//, 'react-native-purchases/dist/')}.js`,
        type: 'sourceFile',
      })),
    });

    it('ネイティブビルドで browser/nativeModule を空スタブに差し替える', () => {
      const ctx = makeContext();
      ctx.resolveRequest = jest.fn(() => ({
        filePath:
          '/abs/node_modules/react-native-purchases/dist/browser/nativeModule.js',
        type: 'sourceFile',
      }));
      const result = config.resolver.resolveRequest(
        ctx,
        './browser/nativeModule',
        'ios',
      );
      expect(result.filePath).toBe(
        path.resolve(__dirname, '..', 'metro-stubs/rn-purchases-browser.js'),
      );
      expect(result.type).toBe('sourceFile');
    });

    it('Android でも browser モジュールをスタブに差し替える', () => {
      const ctx = makeContext();
      ctx.resolveRequest = jest.fn(() => ({
        filePath:
          '/abs/node_modules/react-native-purchases/dist/browser/utils.js',
        type: 'sourceFile',
      }));
      const result = config.resolver.resolveRequest(
        ctx,
        './browser/utils',
        'android',
      );
      expect(result.filePath).toContain('metro-stubs/rn-purchases-browser.js');
    });

    it('web ビルドでは差し替えず元の解決結果を返す', () => {
      const ctx = makeContext();
      const original = {
        filePath:
          '/abs/node_modules/react-native-purchases/dist/browser/nativeModule.js',
        type: 'sourceFile',
      };
      ctx.resolveRequest = jest.fn(() => original);
      const result = config.resolver.resolveRequest(
        ctx,
        './browser/nativeModule',
        'web',
      );
      expect(result).toBe(original);
    });

    it('browser 配下以外のモジュールは通常通り解決する', () => {
      const ctx = makeContext();
      const original = {
        filePath: '/abs/node_modules/react-native-purchases/dist/purchases.js',
        type: 'sourceFile',
      };
      ctx.resolveRequest = jest.fn(() => original);
      const result = config.resolver.resolveRequest(
        ctx,
        'react-native-purchases',
        'ios',
      );
      expect(result).toBe(original);
    });
  });
});
