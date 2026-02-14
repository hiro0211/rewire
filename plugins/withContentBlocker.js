const {
  withEntitlementsPlist,
  withDangerousMod,
  withXcodeProject,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

// ============================================================
// Domain Blocklist (self-contained for config plugin usage)
// ============================================================
const BLOCKED_DOMAINS = [
  // Major adult content sites
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
  "xhamster.com",
  "redtube.com",
  "youporn.com",
  "tube8.com",
  "spankbang.com",
  "beeg.com",
  "txxx.com",
  "hclips.com",
  "pornone.com",
  "eporner.com",
  "drtuber.com",
  "porntrex.com",
  "thumbzilla.com",
  "alohatube.com",
  "tnaflix.com",
  "porndig.com",
  "fuq.com",
  "4tube.com",
  "fapcat.com",
  "sleazyneasy.com",
  "empflix.com",
  "sunporno.com",
  "proporn.com",
  "nuvid.com",
  "viptube.com",
  "pornpics.com",
  "porn.com",
  "youjizz.com",
  "motherless.com",
  "ixxx.com",
  "lobstertube.com",
  "pornmd.com",
  "ashemaletube.com",
  "keezmovies.com",
  "extremetube.com",
  "porntube.com",
  "brazzers.com",
  "realitykings.com",
  "bangbros.com",
  "naughtyamerica.com",
  "mofos.com",
  "digitalplayground.com",
  "wicked.com",
  "julesjordan.com",
  "evilangel.com",
  "blacked.com",
  "tushy.com",
  "vixen.com",
  "deeper.com",
  "onlyfans.com",
  "fansly.com",
  "chaturbate.com",
  "stripchat.com",
  "myfreecams.com",
  "bongacams.com",
  "cam4.com",
  "livejasmin.com",
  "camsoda.com",
  "flirt4free.com",
  "streamate.com",
  "imlive.com",
  "xlovecam.com",
  "literotica.com",
  "sexstories.com",
  "hentaihaven.xxx",
  "hanime.tv",
  "nhentai.net",
  "rule34.xxx",
  "e-hentai.org",
  "gelbooru.com",
  "danbooru.donmai.us",
  "sankakucomplex.com",
  "fakku.net",
  "hitomi.la",
  "8muses.com",
  "simply-hentai.com",
  "tsumino.com",
  "pururin.to",
  "hentai2read.com",
  "imagefap.com",
  "erome.com",
  "scrolller.com",
  "sex.com",
  "heavy-r.com",
  "efukt.com",
  "bestgore.fun",
  "theync.com",
  "crazyshit.com",
  "kaotic.com",
  "hoodsite.com",
  "documenting.io",
  "sexyflanders.com",
  "fapello.com",
  "coomer.su",
  "simpcity.su",
  "leakedbb.com",
  "forums.socialmediagirls.com",
];

/**
 * Generate Safari Content Blocker rules from the domain list.
 * Each domain gets a "block" rule with an if-domain trigger.
 */
function generateBlockerRules(domains) {
  return domains.map((domain) => ({
    trigger: {
      "url-filter": ".*",
      "if-domain": ["*" + domain],
    },
    action: {
      type: "block",
    },
  }));
}

// ============================================================
// Sub-plugin 1: Add App Groups entitlement to main app
// ============================================================
function withAppGroupsEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    const APP_GROUP = "group.com.rewire.app";
    const groups = config.modResults["com.apple.security.application-groups"] || [];
    if (!groups.includes(APP_GROUP)) {
      groups.push(APP_GROUP);
    }
    config.modResults["com.apple.security.application-groups"] = groups;
    return config;
  });
}

// ============================================================
// Sub-plugin 2: Write extension files to disk during prebuild
// ============================================================
function withExtensionFiles(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const iosPath = path.join(config.modRequest.platformProjectRoot);
      const extDir = path.join(iosPath, "ContentBlockerExtension");

      // Create extension directory
      fs.mkdirSync(extDir, { recursive: true });

      // Generate blockerList.json
      const rules = generateBlockerRules(BLOCKED_DOMAINS);
      fs.writeFileSync(
        path.join(extDir, "blockerList.json"),
        JSON.stringify(rules, null, 2)
      );

      // Write ContentBlockerRequestHandler.swift
      const handlerSwift = `import UIKit
import MobileCoreServices

class ContentBlockerRequestHandler: NSObject, NSExtensionRequestHandling {
    func beginRequest(with context: NSExtensionContext) {
        guard let attachment = NSItemProvider(
            contentsOf: Bundle.main.url(forResource: "blockerList", withExtension: "json")
        ) else {
            context.cancelRequest(withError: NSError(domain: "ContentBlockerExtension", code: 1, userInfo: nil))
            return
        }
        let item = NSExtensionItem()
        item.attachments = [attachment]
        context.completeRequest(returningItems: [item], completionHandler: nil)
    }
}
`;
      fs.writeFileSync(
        path.join(extDir, "ContentBlockerRequestHandler.swift"),
        handlerSwift
      );

      // Write Info.plist
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
\t\t<string>ContentBlockerRequestHandler</string>
\t</dict>
</dict>
</plist>
`;
      fs.writeFileSync(path.join(extDir, "Info.plist"), infoPlist);

      // Write entitlements
      const entitlements = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.security.application-groups</key>
\t<array>
\t\t<string>group.com.rewire.app</string>
\t</array>
</dict>
</plist>
`;
      fs.writeFileSync(
        path.join(extDir, "ContentBlockerExtension.entitlements"),
        entitlements
      );

      return config;
    },
  ]);
}

// ============================================================
// Sub-plugin 3: Add extension target to Xcode project
// ============================================================
function withExtensionTarget(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const EXTENSION_NAME = "ContentBlockerExtension";
    const EXTENSION_BUNDLE_ID = "com.rewire.app.ContentBlockerExtension";

    // Add the app extension target
    const target = project.addTarget(
      EXTENSION_NAME,
      "app_extension",
      EXTENSION_NAME,
      EXTENSION_BUNDLE_ID
    );

    // Add build configuration settings for the extension target
    const configurations = project.pbxXCConfigurationList();
    const targetKey = target.uuid;

    // Find the target's build configuration list
    for (const configKey in configurations) {
      const configList = configurations[configKey];
      if (
        configList &&
        configList.buildConfigurations &&
        configList.comment &&
        configList.comment.includes(EXTENSION_NAME)
      ) {
        const buildConfigs = configList.buildConfigurations;
        for (const buildConfig of buildConfigs) {
          const configUuid = buildConfig.value;
          const xcBuildConfig = project.pbxXCBuildConfigurationSection()[configUuid];
          if (xcBuildConfig) {
            xcBuildConfig.buildSettings = xcBuildConfig.buildSettings || {};
            Object.assign(xcBuildConfig.buildSettings, {
              SWIFT_VERSION: "5.0",
              IPHONEOS_DEPLOYMENT_TARGET: "15.0",
              PRODUCT_BUNDLE_IDENTIFIER: `"${EXTENSION_BUNDLE_ID}"`,
              INFOPLIST_FILE: `"${EXTENSION_NAME}/Info.plist"`,
              CODE_SIGN_ENTITLEMENTS: `"${EXTENSION_NAME}/${EXTENSION_NAME}.entitlements"`,
              CODE_SIGN_STYLE: "Automatic",
              TARGETED_DEVICE_FAMILY: `"1,2"`,
              GENERATE_INFOPLIST_FILE: "NO",
              MARKETING_VERSION: "1.0",
              CURRENT_PROJECT_VERSION: "1",
              SWIFT_EMIT_LOC_STRINGS: "YES",
            });
          }
        }
      }
    }

    // Add source files and resources to the extension target
    const groupName = EXTENSION_NAME;
    const extGroup = project.addPbxGroup(
      [
        "ContentBlockerRequestHandler.swift",
        "Info.plist",
        "ContentBlockerExtension.entitlements",
        "blockerList.json",
      ],
      groupName,
      groupName
    );

    // Add group to main project group
    const mainGroup = project.getFirstProject().firstProject.mainGroup;
    project.addToPbxGroup(extGroup.uuid, mainGroup);

    // Add source file to extension target's compile sources
    project.addSourceFile(
      `${EXTENSION_NAME}/ContentBlockerRequestHandler.swift`,
      { target: target.uuid },
      extGroup.uuid
    );

    // Add blockerList.json as a resource
    project.addResourceFile(
      `${EXTENSION_NAME}/blockerList.json`,
      { target: target.uuid },
      extGroup.uuid
    );

    return config;
  });
}

// ============================================================
// Main plugin: chain all sub-plugins
// ============================================================
function withContentBlocker(config) {
  config = withAppGroupsEntitlement(config);
  config = withExtensionFiles(config);
  config = withExtensionTarget(config);
  return config;
}

module.exports = withContentBlocker;
