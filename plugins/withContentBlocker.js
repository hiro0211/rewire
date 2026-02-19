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
  // MissAV and related domains
  "missav.com",
  "missav.ws",
  "missav.ai",
  "missav.live",
  "missav.fun",
  "missav.tv",
  "missav.net",
  "missav.org",
  "missav.to",
  "missav123.com",
  "thisav.com",
  "supjav.com",
  "jable.tv",
  "netflav.com",
  "avgle.com",
  "javmost.com",
  "javbangers.com",
  "javdoe.com",
  "javfinder.la",
  "javhd.com",
  "javlibrary.com",
  "javmenu.com",
  "javrave.club",
  "javtrailers.com",
  "highporn.net",
  "bestjavporn.com",
];

// Safari Content Blocker limit: 150,000 rules per extension
const MAX_RULES = 150000;

// StevenBlack hosts file (porn category)
const BLOCKLIST_URL =
  "https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn/hosts";

// Domains to skip when parsing hosts file
const SKIP_DOMAINS = new Set([
  "localhost",
  "localhost.localdomain",
  "local",
  "broadcasthost",
  "0.0.0.0",
  "ip6-localhost",
  "ip6-loopback",
  "ip6-localnet",
  "ip6-mcastprefix",
  "ip6-allnodes",
  "ip6-allrouters",
  "ip6-allhosts",
]);

/**
 * Fetch and parse the StevenBlack hosts file at build time.
 * Falls back to BLOCKED_DOMAINS on network error.
 */
async function fetchBlockList() {
  const https = require("https");

  return new Promise((resolve) => {
    console.log("[ContentBlocker] Fetching StevenBlack blocklist...");
    const req = https.get(BLOCKLIST_URL, { timeout: 30000 }, (res) => {
      if (res.statusCode !== 200) {
        console.warn(
          `[ContentBlocker] HTTP ${res.statusCode}, using fallback list`
        );
        resolve(BLOCKED_DOMAINS);
        return;
      }

      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const domains = parseHostsFile(data);
        console.log(
          `[ContentBlocker] Fetched ${domains.length} domains from StevenBlack`
        );
        resolve(domains);
      });
    });

    req.on("error", (err) => {
      console.warn(
        `[ContentBlocker] Fetch failed: ${err.message}, using fallback list`
      );
      resolve(BLOCKED_DOMAINS);
    });

    req.on("timeout", () => {
      req.destroy();
      console.warn("[ContentBlocker] Fetch timed out, using fallback list");
      resolve(BLOCKED_DOMAINS);
    });
  });
}

/**
 * Parse a StevenBlack-format hosts file into a domain array.
 * Format: "0.0.0.0 domain.com" per line
 */
function parseHostsFile(content) {
  const domainSet = new Set();

  // Always include our curated list first
  for (const d of BLOCKED_DOMAINS) {
    domainSet.add(d.toLowerCase());
  }

  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Parse "0.0.0.0 domain.com" or "127.0.0.1 domain.com"
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) continue;

    const domain = parts[1].toLowerCase();
    if (!domain || SKIP_DOMAINS.has(domain)) continue;
    // Basic domain validation
    if (!domain.includes(".")) continue;

    domainSet.add(domain);
  }

  // Enforce Safari Content Blocker limit
  const allDomains = Array.from(domainSet);
  if (allDomains.length > MAX_RULES) {
    console.log(
      `[ContentBlocker] Trimming ${allDomains.length} domains to ${MAX_RULES} (Safari limit)`
    );
    return allDomains.slice(0, MAX_RULES);
  }
  return allDomains;
}

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
    const APP_GROUP = "group.rewire.app.com";
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

      // Fetch StevenBlack blocklist and generate blockerList.json
      const domains = await fetchBlockList();
      const rules = generateBlockerRules(domains);
      console.log(`[ContentBlocker] Writing ${rules.length} rules to blockerList.json`);
      fs.writeFileSync(
        path.join(extDir, "blockerList.json"),
        JSON.stringify(rules)
      );

      // Write ContentBlockerRequestHandler.swift
      // Merges static blockerList.json with custom domains from App Group UserDefaults
      const handlerSwift = `import UIKit

class ContentBlockerRequestHandler: NSObject, NSExtensionRequestHandling {
    private let appGroupId = "group.rewire.app.com"
    private let customDomainsKey = "custom_blocked_domains"

    func beginRequest(with context: NSExtensionContext) {
        // 1. Load static rules from blockerList.json
        var rules: [[String: Any]] = []
        if let url = Bundle(for: ContentBlockerRequestHandler.self).url(forResource: "blockerList", withExtension: "json"),
           let data = try? Data(contentsOf: url),
           let staticRules = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] {
            rules = staticRules
        }

        // 2. Load custom domains from App Group UserDefaults and generate rules
        if let defaults = UserDefaults(suiteName: appGroupId),
           let customDomains = defaults.stringArray(forKey: customDomainsKey) {
            for domain in customDomains {
                rules.append([
                    "trigger": ["url-filter": ".*", "if-domain": ["*" + domain]],
                    "action": ["type": "block"]
                ])
            }
        }

        // 3. Serialize merged rules and return via extension context
        guard let jsonData = try? JSONSerialization.data(withJSONObject: rules),
              let tempURL = writeTempJSON(jsonData),
              let attachment = NSItemProvider(contentsOf: tempURL) else {
            context.cancelRequest(withError: NSError(domain: "ContentBlockerExtension", code: 1, userInfo: nil))
            return
        }

        let item = NSExtensionItem()
        item.attachments = [attachment]
        context.completeRequest(returningItems: [item], completionHandler: nil)
    }

    private func writeTempJSON(_ data: Data) -> URL? {
        let tempDir = FileManager.default.temporaryDirectory
        let fileURL = tempDir.appendingPathComponent("mergedBlockerList.json")
        do {
            try data.write(to: fileURL)
            return fileURL
        } catch {
            return nil
        }
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
\t\t<string>$(PRODUCT_MODULE_NAME).ContentBlockerRequestHandler</string>
\t</dict>
</dict>
</plist>
`;
      fs.writeFileSync(path.join(extDir, "ContentBlockerExtension-Info.plist"), infoPlist);

      // Write ContentBlockerExtension.entitlements (App Group for UserDefaults sharing)
      const entitlementsPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.security.application-groups</key>
\t<array>
\t\t<string>group.rewire.app.com</string>
\t</array>
</dict>
</plist>
`;
      fs.writeFileSync(
        path.join(extDir, "ContentBlockerExtension.entitlements"),
        entitlementsPlist
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
    const EXTENSION_BUNDLE_ID = "rewire.app.com.ContentBlockerExtension";

    // Add the app extension target
    const target = project.addTarget(
      EXTENSION_NAME,
      "app_extension",
      EXTENSION_NAME,
      EXTENSION_BUNDLE_ID
    );

    // Add build configuration settings for the extension target
    // Use buildConfigurationList UUID directly from addTarget return value
    // (avoids xcode library's quoted-name issue where name = '"ContentBlockerExtension"')
    const configListUuid = target.pbxNativeTarget.buildConfigurationList;
    const configList = project.pbxXCConfigurationList()[configListUuid];

    if (configList && configList.buildConfigurations) {
      for (const buildConfig of configList.buildConfigurations) {
        const configUuid = buildConfig.value;
        const xcBuildConfig =
          project.pbxXCBuildConfigurationSection()[configUuid];
        if (xcBuildConfig) {
          xcBuildConfig.buildSettings =
            xcBuildConfig.buildSettings || {};
          Object.assign(xcBuildConfig.buildSettings, {
            SWIFT_VERSION: "5.0",
            IPHONEOS_DEPLOYMENT_TARGET: "15.1",
            PRODUCT_BUNDLE_IDENTIFIER: `"${EXTENSION_BUNDLE_ID}"`,
            INFOPLIST_FILE: `"${EXTENSION_NAME}/${EXTENSION_NAME}-Info.plist"`,
            CODE_SIGN_STYLE: "Automatic",
            DEVELOPMENT_TEAM: "KV6CYPA7JK",
            TARGETED_DEVICE_FAMILY: `"1,2"`,
            GENERATE_INFOPLIST_FILE: "NO",
            MARKETING_VERSION: "1.0",
            CURRENT_PROJECT_VERSION: "1",
            SWIFT_EMIT_LOC_STRINGS: "YES",
            CODE_SIGN_ENTITLEMENTS: `"${EXTENSION_NAME}/${EXTENSION_NAME}.entitlements"`,
          });
        }
      }
    }

    // Add source files and resources to the extension target
    const groupName = EXTENSION_NAME;

    // Create group with all extension files
    const extGroup = project.addPbxGroup(
      [
        "ContentBlockerRequestHandler.swift",
        "ContentBlockerExtension-Info.plist",
        "ContentBlockerExtension.entitlements",
        "blockerList.json",
      ],
      groupName,
      groupName
    );

    // Add group to main project group
    const mainGroup = project.getFirstProject().firstProject.mainGroup;
    project.addToPbxGroup(extGroup.uuid, mainGroup);

    // Use addBuildPhase to add sources and resources to the target
    // This avoids the xcode library's addResourceFile bug
    project.addBuildPhase(
      [`${EXTENSION_NAME}/ContentBlockerRequestHandler.swift`],
      "PBXSourcesBuildPhase",
      "Sources",
      target.uuid
    );

    project.addBuildPhase(
      [`${EXTENSION_NAME}/blockerList.json`],
      "PBXResourcesBuildPhase",
      "Resources",
      target.uuid
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
