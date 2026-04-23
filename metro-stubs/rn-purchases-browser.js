// Stub for react-native-purchases/dist/browser/nativeModule on native platforms.
// The browser module pulls ~900KB of web-only code (@revenuecat/purchases-js-hybrid-mappings)
// which is dead code on iOS/Android where NativeModules.RNPurchases is used instead.
// purchases.js line 65: RNPurchases = usingBrowserMode ? browserNativeModuleRNPurchases : NativeModules.RNPurchases
// On native, usingBrowserMode is false so browserNativeModuleRNPurchases is never read.
module.exports = {};
