const {
  withEntitlementsPlist,
  withDangerousMod,
  withXcodeProject,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const DEFAULT_APP_GROUP = 'group.rewire.app.com';

// ============================================================
// Domain source: constants/screenTime/blockedDomains.ts
// Single source of truth; plugin parses the TS file at prebuild time
// to avoid duplicating the ~700 domain list.
// ============================================================
function loadBlockedDomains(projectRoot) {
  const tsPath = path.join(
    projectRoot,
    'constants',
    'screenTime',
    'blockedDomains.ts'
  );
  const source = fs.readFileSync(tsPath, 'utf8');

  const arrayMatch = source.match(
    /export const ALL_BLOCKED_DOMAINS:[^=]*=\s*\[([\s\S]*?)\];/
  );
  if (!arrayMatch) {
    throw new Error(
      '[withContentBlocker] Could not locate ALL_BLOCKED_DOMAINS in constants/screenTime/blockedDomains.ts'
    );
  }

  const domains = [];
  const stringLiteralRe = /'([^'\n]+)'|"([^"\n]+)"/g;
  let m;
  while ((m = stringLiteralRe.exec(arrayMatch[1])) !== null) {
    domains.push(m[1] || m[2]);
  }

  if (domains.length === 0) {
    throw new Error('[withContentBlocker] Parsed domain list is empty');
  }

  return Array.from(new Set(domains));
}

function generateBlockerRules(domains) {
  return domains.map((domain) => ({
    trigger: {
      'url-filter': '.*',
      'if-domain': ['*' + domain],
    },
    action: { type: 'block' },
  }));
}

function generateSwiftHandler() {
  return `import UIKit

class ContentBlockerRequestHandler: NSObject, NSExtensionRequestHandling {

    func beginRequest(with context: NSExtensionContext) {
        guard let url = Bundle(for: ContentBlockerRequestHandler.self).url(forResource: "blockerList", withExtension: "json") else {
            context.completeRequest(returningItems: [], completionHandler: nil)
            return
        }

        guard let attachment = NSItemProvider(contentsOf: url) else {
             context.cancelRequest(withError: NSError(domain: "ContentBlockerExtension", code: 1, userInfo: nil))
             return
        }

        let item = NSExtensionItem()
        item.attachments = [attachment]

        context.completeRequest(returningItems: [item], completionHandler: nil)
    }
}
`;
}

// ============================================================
// Sub-plugin 1: App Groups entitlement
// ============================================================
function withAppGroupsEntitlement(config, { appGroup }) {
  return withEntitlementsPlist(config, (config) => {
    const groups =
      config.modResults['com.apple.security.application-groups'] || [];
    if (!groups.includes(appGroup)) {
      groups.push(appGroup);
    }
    config.modResults['com.apple.security.application-groups'] = groups;
    return config;
  });
}

// ============================================================
// Sub-plugin 2: Extension files written at prebuild time
// ============================================================
function withExtensionFiles(config, { appGroup }) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const iosPath = config.modRequest.platformProjectRoot;
      const projectRoot = config.modRequest.projectRoot;
      const extDir = path.join(iosPath, 'ContentBlockerExtension');

      fs.mkdirSync(extDir, { recursive: true });

      const domains = loadBlockedDomains(projectRoot);
      const rules = generateBlockerRules(domains);
      console.log(
        `[ContentBlocker] Writing ${rules.length} rules to blockerList.json`
      );
      fs.writeFileSync(
        path.join(extDir, 'blockerList.json'),
        JSON.stringify(rules)
      );

      fs.writeFileSync(
        path.join(extDir, 'ContentBlockerRequestHandler.swift'),
        generateSwiftHandler()
      );

      const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>CFBundleDevelopmentRegion</key>
\t<string>$(DEVELOPMENT_LANGUAGE)</string>
\t<key>CFBundleDisplayName</key>
\t<string>Rewire Content Blocker</string>
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
\t<string>1.0</string>
\t<key>CFBundleVersion</key>
\t<string>1</string>
\t<key>NSExtension</key>
\t<dict>
\t\t<key>NSExtensionPointIdentifier</key>
\t\t<string>com.apple.Safari.content-blocker</string>
\t\t<key>NSExtensionPrincipalClass</key>
\t\t<string>$(PRODUCT_MODULE_NAME).ContentBlockerRequestHandler</string>
\t</dict>
</dict>
</plist>
`;
      fs.writeFileSync(
        path.join(extDir, 'ContentBlockerExtension-Info.plist'),
        infoPlist
      );

      const entitlementsPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.security.application-groups</key>
\t<array>
\t\t<string>${appGroup}</string>
\t</array>
</dict>
</plist>
`;
      fs.writeFileSync(
        path.join(extDir, 'ContentBlockerExtension.entitlements'),
        entitlementsPlist
      );

      return config;
    },
  ]);
}

// ============================================================
// Sub-plugin 3: Xcode target
// ============================================================
function withExtensionTarget(config, { appleTeamId }) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const EXTENSION_NAME = 'ContentBlockerExtension';
    const bundleId = `${config.ios.bundleIdentifier}.${EXTENSION_NAME}`;

    const target = project.addTarget(
      EXTENSION_NAME,
      'app_extension',
      EXTENSION_NAME,
      bundleId
    );

    const configListUuid = target.pbxNativeTarget.buildConfigurationList;
    const configList = project.pbxXCConfigurationList()[configListUuid];

    if (configList && configList.buildConfigurations) {
      for (const buildConfig of configList.buildConfigurations) {
        const configUuid = buildConfig.value;
        const xcBuildConfig =
          project.pbxXCBuildConfigurationSection()[configUuid];
        if (xcBuildConfig) {
          xcBuildConfig.buildSettings = xcBuildConfig.buildSettings || {};
          Object.assign(xcBuildConfig.buildSettings, {
            SWIFT_VERSION: '5.0',
            IPHONEOS_DEPLOYMENT_TARGET: '15.1',
            PRODUCT_BUNDLE_IDENTIFIER: `"${bundleId}"`,
            INFOPLIST_FILE: `"${EXTENSION_NAME}/${EXTENSION_NAME}-Info.plist"`,
            CODE_SIGN_STYLE: 'Automatic',
            DEVELOPMENT_TEAM: appleTeamId,
            TARGETED_DEVICE_FAMILY: `"1,2"`,
            GENERATE_INFOPLIST_FILE: 'NO',
            MARKETING_VERSION: '1.0',
            CURRENT_PROJECT_VERSION: '1',
            SWIFT_EMIT_LOC_STRINGS: 'YES',
            CODE_SIGN_ENTITLEMENTS: `"${EXTENSION_NAME}/${EXTENSION_NAME}.entitlements"`,
          });
        }
      }
    }

    const groupName = EXTENSION_NAME;
    const extGroup = project.addPbxGroup(
      [
        'ContentBlockerRequestHandler.swift',
        'ContentBlockerExtension-Info.plist',
        'ContentBlockerExtension.entitlements',
        'blockerList.json',
      ],
      groupName,
      groupName
    );

    const mainGroup = project.getFirstProject().firstProject.mainGroup;
    project.addToPbxGroup(extGroup.uuid, mainGroup);

    project.addBuildPhase(
      [`${EXTENSION_NAME}/ContentBlockerRequestHandler.swift`],
      'PBXSourcesBuildPhase',
      'Sources',
      target.uuid
    );
    project.addBuildPhase(
      [`${EXTENSION_NAME}/blockerList.json`],
      'PBXResourcesBuildPhase',
      'Resources',
      target.uuid
    );

    return config;
  });
}

function withContentBlocker(config, props = {}) {
  const options = {
    appleTeamId: props.appleTeamId || 'KV6CYPA7JK',
    appGroup: props.appGroup || DEFAULT_APP_GROUP,
  };

  if (!options.appleTeamId) {
    throw new Error(
      '[withContentBlocker] appleTeamId option is required in app.config.ts'
    );
  }

  config = withAppGroupsEntitlement(config, options);
  config = withExtensionFiles(config, options);
  config = withExtensionTarget(config, options);
  return config;
}

withContentBlocker.generateSwiftHandler = generateSwiftHandler;
withContentBlocker.loadBlockedDomains = loadBlockedDomains;
withContentBlocker.generateBlockerRules = generateBlockerRules;
module.exports = withContentBlocker;
