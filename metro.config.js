// Learn more https://docs.expo.dev/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: true,
    inlineRequires: true,
  },
});

// Redirect react-native-purchases' browser module to an empty stub on native
// platforms. purchases.js unconditionally requires "./browser/nativeModule",
// dragging in ~900KB of web-only code (@revenuecat/purchases-js-hybrid-mappings
// and the simulated-store helpers) that is dead code when
// NativeModules.RNPurchases is used on iOS/Android.
const rnPurchasesBrowserStub = path.resolve(
  __dirname,
  'metro-stubs/rn-purchases-browser.js',
);

const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolved = upstreamResolveRequest
    ? upstreamResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);

  if (
    platform !== 'web' &&
    resolved &&
    resolved.type === 'sourceFile' &&
    resolved.filePath &&
    resolved.filePath
      .replace(/\\/g, '/')
      .includes('/react-native-purchases/dist/browser/')
  ) {
    return { filePath: rnPurchasesBrowserStub, type: 'sourceFile' };
  }
  return resolved;
};

module.exports = config;
