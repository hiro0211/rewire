const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const FLAG = "$RNFirebaseAnalyticsWithoutAdIdSupport = true";
const COMMENT =
  "# Exclude GoogleAppMeasurementIdentitySupport (no IDFA collection)";

/**
 * Pure function: injects the $RNFirebaseAnalyticsWithoutAdIdSupport flag
 * into a Podfile string. Returns the modified string.
 */
function injectFlag(podfileContent) {
  if (podfileContent.includes(FLAG)) {
    return podfileContent;
  }

  const targetLine = "target 'Rewire' do";
  if (podfileContent.includes(targetLine)) {
    return podfileContent.replace(
      targetLine,
      `${COMMENT}\n${FLAG}\n\n${targetLine}`
    );
  }

  // Fallback: insert after the last require/ENV line
  const lines = podfileContent.split("\n");
  let insertIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("require ") || lines[i].startsWith("ENV[")) {
      insertIndex = i + 1;
    }
  }
  lines.splice(insertIndex, 0, "", COMMENT, FLAG, "");
  return lines.join("\n");
}

/**
 * Expo config plugin that sets $RNFirebaseAnalyticsWithoutAdIdSupport = true
 * in the Podfile, preventing @react-native-firebase/analytics from pulling
 * GoogleAppMeasurementIdentitySupport (IDFA collection).
 */
function withFirebaseAnalyticsNoAdId(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );

      const podfileContent = fs.readFileSync(podfilePath, "utf-8");
      const modified = injectFlag(podfileContent);

      if (modified !== podfileContent) {
        fs.writeFileSync(podfilePath, modified);
      }

      return config;
    },
  ]);
}

withFirebaseAnalyticsNoAdId.injectFlag = injectFlag;
module.exports = withFirebaseAnalyticsNoAdId;
