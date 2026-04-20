const {
  withEntitlementsPlist,
  withDangerousMod,
  withXcodeProject,
  withInfoPlist,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const APP_GROUP_ID = "group.rewire.app.com";
const MAIN_BUNDLE_ID = "rewire.app.com";

// ============================================================
// Swift code generators (exported for testing)
// ============================================================

function generateShieldConfigSwift() {
  return `import ManagedSettingsUI
import ManagedSettings
import UIKit

class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return buildConfig()
    }

    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        return buildConfig()
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        return buildConfig()
    }

    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
        return buildConfig()
    }

    private func buildConfig() -> ShieldConfiguration {
        let backgroundColor = UIColor(red: 10/255, green: 10/255, blue: 15/255, alpha: 1) // #0A0A0F
        let buttonColor = UIColor(red: 139/255, green: 92/255, blue: 246/255, alpha: 1) // #8B5CF6

        return ShieldConfiguration(
            backgroundBlurStyle: .dark,
            backgroundColor: backgroundColor,
            icon: nil,
            title: ShieldConfiguration.Label(
                text: "Rewire",
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: "このサイトはブロックされています",
                color: UIColor.white.withAlphaComponent(0.7)
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Rewireを開く",
                color: .white
            ),
            primaryButtonBackgroundColor: buttonColor,
            secondaryButtonLabel: nil
        )
    }
}
`;
}

function generateShieldActionSwift() {
  return `import ManagedSettingsUI
import ManagedSettings
import UserNotifications

class ShieldActionExtension: ShieldActionDelegate {
    override func handle(
        action: ShieldAction,
        for application: Application,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        handleAction(action: action, completionHandler: completionHandler)
    }

    override func handle(
        action: ShieldAction,
        for webDomain: WebDomain,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        handleAction(action: action, completionHandler: completionHandler)
    }

    private func handleAction(
        action: ShieldAction,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        switch action {
        case .primaryButtonPressed:
            sendNotification {
                completionHandler(.close)
            }
        case .secondaryButtonPressed:
            completionHandler(.close)
        @unknown default:
            completionHandler(.close)
        }
    }

    private func sendNotification(completion: @escaping () -> Void) {
        let content = UNMutableNotificationContent()
        content.title = "Rewire"
        content.body = "衝動に気づきました。今の気持ちを振り返りましょう。"
        content.sound = .default
        content.userInfo = ["route": "/panic"]

        let request = UNNotificationRequest(
            identifier: "rewire-shield-action-\\(UUID().uuidString)",
            content: content,
            trigger: nil
        )

        UNUserNotificationCenter.current().add(request) { _ in
            completion()
        }
    }
}
`;
}

function generateDeviceActivityMonitorSwift() {
  return `import DeviceActivity

class RewireDeviceActivityMonitor: DeviceActivityMonitor {
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
    }

    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
    }
}
`;
}

function generateInfoPlist(extensionName, extensionPointIdentifier) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>NSExtension</key>
\t<dict>
\t\t<key>NSExtensionPointIdentifier</key>
\t\t<string>${extensionPointIdentifier}</string>
\t\t<key>NSExtensionPrincipalClass</key>
\t\t<string>$(PRODUCT_MODULE_NAME).${extensionName}</string>
\t</dict>
\t<key>CFBundleDevelopmentRegion</key>
\t<string>$(DEVELOPMENT_LANGUAGE)</string>
\t<key>CFBundleDisplayName</key>
\t<string>${extensionName}</string>
\t<key>CFBundleExecutable</key>
\t<string>$(EXECUTABLE_NAME)</string>
\t<key>CFBundleIdentifier</key>
\t<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
\t<key>CFBundleInfoDictionaryVersion</key>
\t<string>6.0</string>
\t<key>CFBundleName</key>
\t<string>$(PRODUCT_NAME)</string>
\t<key>CFBundlePackageType</key>
\t<string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
\t<key>CFBundleShortVersionString</key>
\t<string>$(MARKETING_VERSION)</string>
\t<key>CFBundleVersion</key>
\t<string>$(CURRENT_PROJECT_VERSION)</string>
\t<key>MinimumOSVersion</key>
\t<string>16.0</string>
</dict>
</plist>`;
}

function generateEntitlements() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.developer.family-controls</key>
\t<true/>
\t<key>com.apple.security.application-groups</key>
\t<array>
\t\t<string>${APP_GROUP_ID}</string>
\t</array>
</dict>
</plist>`;
}

// ============================================================
// Extension target helper
// ============================================================

function addExtensionTarget(xcodeProject, iosPath, config) {
  const { targetName, bundleId, swiftFileName, swiftCode, plistExtPointId, plistClassName, frameworks } = config;

  const extDir = path.join(iosPath, targetName);
  if (!fs.existsSync(extDir)) {
    fs.mkdirSync(extDir, { recursive: true });
  }

  // Write Swift source
  fs.writeFileSync(path.join(extDir, swiftFileName), swiftCode);

  // Write Info.plist
  fs.writeFileSync(
    path.join(extDir, `${targetName}-Info.plist`),
    generateInfoPlist(plistClassName, plistExtPointId)
  );

  // Write Entitlements
  fs.writeFileSync(
    path.join(extDir, `${targetName}.entitlements`),
    generateEntitlements()
  );

  // Add target to Xcode project
  const targetUuid = xcodeProject.generateUuid();
  const target = xcodeProject.addTarget(
    targetName,
    "app_extension",
    targetName,
    bundleId
  );

  // Add files to target
  const groupKey = xcodeProject.pbxCreateGroup(targetName, targetName);
  const mainGroup = xcodeProject.getFirstProject().firstProject.mainGroup;
  xcodeProject.getPBXGroupByKey(mainGroup).children.push({
    value: groupKey,
    comment: targetName,
  });

  const fileRefs = [
    swiftFileName,
    `${targetName}-Info.plist`,
    `${targetName}.entitlements`,
  ];

  for (const fileName of fileRefs) {
    xcodeProject.addFile(
      `${targetName}/${fileName}`,
      groupKey,
      { target: target.uuid }
    );
  }

  // Set build settings
  const buildConfigs = xcodeProject.pbxXCBuildConfigurationSection();
  for (const key in buildConfigs) {
    const buildConfig = buildConfigs[key];
    if (
      buildConfig.buildSettings &&
      buildConfig.baseConfigurationReference === undefined
    ) {
      continue;
    }
    if (typeof buildConfig === "string") continue;
    if (!buildConfig.buildSettings) continue;

    if (
      buildConfig.buildSettings.PRODUCT_NAME === `"${targetName}"` ||
      buildConfig.buildSettings.PRODUCT_BUNDLE_IDENTIFIER === bundleId
    ) {
      buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = "16.0";
      buildConfig.buildSettings.SWIFT_VERSION = "5.0";
      buildConfig.buildSettings.CODE_SIGN_ENTITLEMENTS = `${targetName}/${targetName}.entitlements`;
      buildConfig.buildSettings.INFOPLIST_FILE = `${targetName}/${targetName}-Info.plist`;
      buildConfig.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = bundleId;
    }
  }

  // Add frameworks
  for (const fw of frameworks) {
    xcodeProject.addFramework(fw, {
      target: target.uuid,
    });
  }

  return target;
}

// ============================================================
// Main plugin
// ============================================================

function withScreenTime(config) {
  // 1. Add main app entitlements
  config = withEntitlementsPlist(config, (cfg) => {
    cfg.modResults["com.apple.developer.family-controls"] = true;
    if (!cfg.modResults["com.apple.security.application-groups"]) {
      cfg.modResults["com.apple.security.application-groups"] = [];
    }
    if (!cfg.modResults["com.apple.security.application-groups"].includes(APP_GROUP_ID)) {
      cfg.modResults["com.apple.security.application-groups"].push(APP_GROUP_ID);
    }
    return cfg;
  });

  // 2. Add NSFamilyControlsUsageDescription to Info.plist
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.NSFamilyControlsUsageDescription =
      "Rewireはあなた自身の意思でアダルトコンテンツをブロックするために使用します";
    return cfg;
  });

  // 3. Write extension files and add Xcode targets
  config = withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const iosPath = path.join(cfg.modRequest.platformProjectRoot);

      // ShieldConfiguration extension
      const shieldConfigDir = path.join(iosPath, "ShieldConfigurationExtension");
      if (!fs.existsSync(shieldConfigDir)) {
        fs.mkdirSync(shieldConfigDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(shieldConfigDir, "ShieldConfigurationExtension.swift"),
        generateShieldConfigSwift()
      );
      fs.writeFileSync(
        path.join(shieldConfigDir, "ShieldConfigurationExtension-Info.plist"),
        generateInfoPlist("ShieldConfigurationExtension", "com.apple.ManagedSettingsUI.shield-configuration")
      );
      fs.writeFileSync(
        path.join(shieldConfigDir, "ShieldConfigurationExtension.entitlements"),
        generateEntitlements()
      );

      // ShieldAction extension
      const shieldActionDir = path.join(iosPath, "ShieldActionExtension");
      if (!fs.existsSync(shieldActionDir)) {
        fs.mkdirSync(shieldActionDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(shieldActionDir, "ShieldActionExtension.swift"),
        generateShieldActionSwift()
      );
      fs.writeFileSync(
        path.join(shieldActionDir, "ShieldActionExtension-Info.plist"),
        generateInfoPlist("ShieldActionExtension", "com.apple.ManagedSettingsUI.shield-action")
      );
      fs.writeFileSync(
        path.join(shieldActionDir, "ShieldActionExtension.entitlements"),
        generateEntitlements()
      );

      // DeviceActivityMonitor extension
      const damDir = path.join(iosPath, "DeviceActivityMonitorExtension");
      if (!fs.existsSync(damDir)) {
        fs.mkdirSync(damDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(damDir, "DeviceActivityMonitorExtension.swift"),
        generateDeviceActivityMonitorSwift()
      );
      fs.writeFileSync(
        path.join(damDir, "DeviceActivityMonitorExtension-Info.plist"),
        generateInfoPlist("RewireDeviceActivityMonitor", "com.apple.DeviceActivityMonitor")
      );
      fs.writeFileSync(
        path.join(damDir, "DeviceActivityMonitorExtension.entitlements"),
        generateEntitlements()
      );

      return cfg;
    },
  ]);

  // 4. Add extension targets to Xcode project
  config = withXcodeProject(config, (cfg) => {
    const xcodeProject = cfg.modResults;

    const extensions = [
      {
        targetName: "ShieldConfigurationExtension",
        bundleId: `${MAIN_BUNDLE_ID}.ShieldConfiguration`,
        swiftFileName: "ShieldConfigurationExtension.swift",
        swiftCode: generateShieldConfigSwift(),
        plistExtPointId: "com.apple.ManagedSettingsUI.shield-configuration",
        plistClassName: "ShieldConfigurationExtension",
        frameworks: ["FamilyControls.framework", "ManagedSettings.framework", "ManagedSettingsUI.framework"],
      },
      {
        targetName: "ShieldActionExtension",
        bundleId: `${MAIN_BUNDLE_ID}.ShieldAction`,
        swiftFileName: "ShieldActionExtension.swift",
        swiftCode: generateShieldActionSwift(),
        plistExtPointId: "com.apple.ManagedSettingsUI.shield-action",
        plistClassName: "ShieldActionExtension",
        frameworks: ["FamilyControls.framework", "ManagedSettings.framework", "ManagedSettingsUI.framework", "UserNotifications.framework"],
      },
      {
        targetName: "DeviceActivityMonitorExtension",
        bundleId: `${MAIN_BUNDLE_ID}.DeviceActivityMonitor`,
        swiftFileName: "DeviceActivityMonitorExtension.swift",
        swiftCode: generateDeviceActivityMonitorSwift(),
        plistExtPointId: "com.apple.DeviceActivityMonitor",
        plistClassName: "RewireDeviceActivityMonitor",
        frameworks: ["FamilyControls.framework", "DeviceActivity.framework"],
      },
    ];

    for (const ext of extensions) {
      addExtensionTarget(xcodeProject, cfg.modRequest.platformProjectRoot, ext);
    }

    return cfg;
  });

  return config;
}

// Export generators for testing
withScreenTime._generateShieldConfigSwift = generateShieldConfigSwift;
withScreenTime._generateShieldActionSwift = generateShieldActionSwift;
withScreenTime._generateDeviceActivityMonitorSwift = generateDeviceActivityMonitorSwift;
withScreenTime._generateInfoPlist = generateInfoPlist;
withScreenTime._generateEntitlements = generateEntitlements;

module.exports = withScreenTime;
