const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Disables code signing for CocoaPods resource bundle targets.
 * Fixes: "Starting from Xcode 14, resource bundles are signed by default"
 */
function withDisableResourceBundleSigning(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );

      let podfileContent = fs.readFileSync(podfilePath, "utf-8");

      const snippet = `
  # Disable code signing for resource bundles (Xcode 14+ fix)
  # Method 1: target_installation_results API
  installer.target_installation_results.pod_target_installation_results
    .each do |pod_name, target_installation_result|
    target_installation_result.resource_bundle_targets.each do |resource_bundle_target|
      resource_bundle_target.build_configurations.each do |config|
        config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
      end
    end
  end
  # Method 2: pods_project.targets fallback (catches all bundle targets)
  installer.pods_project.targets.each do |target|
    if target.respond_to?(:product_type) && target.product_type == 'com.apple.product-type.bundle'
      target.build_configurations.each do |config|
        config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
      end
    end
  end`;

      // Insert into existing post_install block
      if (podfileContent.includes("post_install do |installer|")) {
        podfileContent = podfileContent.replace(
          "post_install do |installer|",
          `post_install do |installer|${snippet}`
        );
      } else {
        // Add new post_install block
        podfileContent += `\npost_install do |installer|${snippet}\nend\n`;
      }

      fs.writeFileSync(podfilePath, podfileContent);
      return config;
    },
  ]);
}

module.exports = withDisableResourceBundleSigning;
