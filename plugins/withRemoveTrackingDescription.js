const { withInfoPlist } = require("expo/config-plugins");

/**
 * Expo config plugin: Info.plistからNSUserTrackingUsageDescriptionを強制削除する。
 *
 * 他のSDK（GoogleAppMeasurement等）がビルド時にこのキーを注入する場合があるため、
 * app.config.tsのpluginsリストの最後に配置して、最終的に確実に削除する。
 */
function withRemoveTrackingDescription(config) {
  return withInfoPlist(config, (config) => {
    if (config.modResults.NSUserTrackingUsageDescription) {
      delete config.modResults.NSUserTrackingUsageDescription;
    }
    return config;
  });
}

module.exports = withRemoveTrackingDescription;
