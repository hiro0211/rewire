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

// ============================================================
// Sub-plugin 1: Add App Groups entitlement to main app
// ============================================================
function withWebExtensionEntitlement(config) {
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
function withWebExtensionFiles(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const iosPath = path.join(config.modRequest.platformProjectRoot);
      const extDir = path.join(iosPath, "RewireSafariExtension");
      const resourcesDir = path.join(extDir, "Resources");

      // Create extension and resources directories
      fs.mkdirSync(extDir, { recursive: true });
      fs.mkdirSync(resourcesDir, { recursive: true });

      // Write Resources/.gitkeep (icons to be added later)
      fs.writeFileSync(path.join(resourcesDir, ".gitkeep"), "");

      // ---- manifest.json ----
      const manifest = {
        manifest_version: 2,
        name: "Rewire",
        version: "1.0",
        description: "Track adult site browsing time",
        permissions: ["nativeMessaging", "storage", "activeTab"],
        background: {
          scripts: ["background.js"],
          persistent: false,
        },
        content_scripts: [
          {
            matches: ["*://*/*"],
            js: ["content.js"],
            run_at: "document_start",
          },
        ],
      };

      console.log("[SafariWebExtension] Writing manifest.json");
      fs.writeFileSync(
        path.join(extDir, "manifest.json"),
        JSON.stringify(manifest, null, 2)
      );

      // ---- content.js ----
      const contentJs = `// Rewire Safari Web Extension - Content Script
// Detects adult domain visits and tracks browsing time

(function () {
  "use strict";

  let isTrackedDomain = false;
  let startTime = null;
  const MIN_DURATION_MS = 3000; // Minimum 3 seconds to record

  const hostname = location.hostname;

  // Ask background.js whether this domain is tracked
  browser.runtime.sendMessage(
    { type: "CHECK_DOMAIN", domain: hostname },
    (response) => {
      if (response && response.tracked) {
        isTrackedDomain = true;
        startTime = Date.now();
      }
    }
  );

  /**
   * Send the recorded session duration to background.js
   */
  function sendSession() {
    if (!isTrackedDomain || !startTime) return;

    const duration = Date.now() - startTime;
    if (duration < MIN_DURATION_MS) return;

    const now = new Date();
    const dateStr =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");

    browser.runtime.sendMessage({
      type: "RECORD_SESSION",
      payload: {
        domain: hostname,
        duration: duration,
        date: dateStr,
        timestamp: now.toISOString(),
      },
    });

    // Reset so we don't double-send
    startTime = null;
  }

  // Track visibility changes (user switches tab / minimises browser)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sendSession();
    } else if (document.visibilityState === "visible" && isTrackedDomain) {
      // Restart timing when user comes back
      startTime = Date.now();
    }
  });

  // Track page unload (navigation away, tab close)
  window.addEventListener("beforeunload", () => {
    sendSession();
  });

  /**
   * Stub for future Phase 5 intervention UI.
   * Will overlay a motivational prompt when time threshold is exceeded.
   */
  function showIntervention() {
    // TODO: Phase 5 implementation
  }
})();
`;

      console.log("[SafariWebExtension] Writing content.js");
      fs.writeFileSync(path.join(extDir, "content.js"), contentJs);

      // ---- background.js ----
      const backgroundJs = `// Rewire Safari Web Extension - Background Script
// Manages domain list, session recording, and native communication

(function () {
  "use strict";

  const NATIVE_APP_ID = "application.id"; // Safari native messaging app identifier
  let trackedDomains = [];

  // ---- Domain list management ----

  /**
   * Fetch the tracked domain list from the native app via sendNativeMessage.
   * Caches the result in browser.storage.local.
   */
  function fetchDomainList() {
    browser.runtime.sendNativeMessage(
      NATIVE_APP_ID,
      { type: "GET_DOMAIN_LIST" },
      (response) => {
        if (response && response.domains && Array.isArray(response.domains)) {
          trackedDomains = response.domains;
          browser.storage.local.set({ trackedDomains: trackedDomains });
          console.log(
            "[Rewire] Domain list updated from native:",
            trackedDomains.length,
            "domains"
          );
        } else {
          // Fall back to cached list
          loadCachedDomains();
        }
      }
    );
  }

  /**
   * Load domain list from browser.storage.local cache.
   */
  function loadCachedDomains() {
    browser.storage.local.get("trackedDomains", (result) => {
      if (result.trackedDomains && Array.isArray(result.trackedDomains)) {
        trackedDomains = result.trackedDomains;
        console.log(
          "[Rewire] Loaded cached domain list:",
          trackedDomains.length,
          "domains"
        );
      } else {
        console.log("[Rewire] No cached domain list found");
      }
    });
  }

  /**
   * Check whether a hostname matches any tracked domain.
   * For a hostname like "www.example.com", checks if "example.com" is in the list.
   */
  function isDomainTracked(hostname) {
    if (!hostname) return false;
    const lower = hostname.toLowerCase();
    for (const domain of trackedDomains) {
      if (lower === domain || lower.endsWith("." + domain)) {
        return true;
      }
    }
    return false;
  }

  // ---- Session recording ----

  /**
   * Send a session to the native app. On failure, buffer it for retry.
   */
  function saveSession(session) {
    browser.runtime.sendNativeMessage(
      NATIVE_APP_ID,
      { type: "SAVE_SESSION", payload: session },
      (response) => {
        if (browser.runtime.lastError || !response || !response.success) {
          console.warn("[Rewire] Native send failed, buffering session");
          bufferSession(session);
        } else {
          console.log("[Rewire] Session saved via native:", session.domain);
        }
      }
    );
  }

  /**
   * Buffer a failed session in browser.storage.local for later retry.
   */
  function bufferSession(session) {
    browser.storage.local.get("bufferedSessions", (result) => {
      const buffered = result.bufferedSessions || [];
      buffered.push(session);
      browser.storage.local.set({ bufferedSessions: buffered });
    });
  }

  /**
   * Periodically retry sending buffered sessions to the native app.
   */
  function retryBufferedSessions() {
    browser.storage.local.get("bufferedSessions", (result) => {
      const buffered = result.bufferedSessions || [];
      if (buffered.length === 0) return;

      console.log("[Rewire] Retrying", buffered.length, "buffered sessions");

      // Clear buffer first, re-buffer any that fail
      browser.storage.local.set({ bufferedSessions: [] });

      browser.runtime.sendNativeMessage(
        NATIVE_APP_ID,
        { type: "SYNC_SESSIONS", payload: buffered },
        (response) => {
          if (browser.runtime.lastError || !response || !response.success) {
            // Re-buffer all sessions
            browser.storage.local.get("bufferedSessions", (result2) => {
              const current = result2.bufferedSessions || [];
              const merged = current.concat(buffered);
              browser.storage.local.set({ bufferedSessions: merged });
            });
          } else {
            console.log("[Rewire] Buffered sessions synced successfully");
          }
        }
      );
    });
  }

  // ---- Message handling ----

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || !message.type) return;

    switch (message.type) {
      case "CHECK_DOMAIN":
        sendResponse({ tracked: isDomainTracked(message.domain) });
        break;

      case "RECORD_SESSION":
        if (message.payload) {
          saveSession(message.payload);
        }
        break;
    }
  });

  // ---- Initialisation ----

  // Fetch domain list from native on startup
  fetchDomainList();

  // Retry buffered sessions every 5 minutes
  setInterval(retryBufferedSessions, 5 * 60 * 1000);
})();
`;

      console.log("[SafariWebExtension] Writing background.js");
      fs.writeFileSync(path.join(extDir, "background.js"), backgroundJs);

      // ---- SafariWebExtensionHandler.swift ----
      const handlerSwift = `import SafariServices
import os.log

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    private let appGroupId = "group.rewire.app.com"
    private let sessionsKey = "safari_extension_sessions"
    private let domainsKey = "safari_extension_domains"
    private let logger = Logger(subsystem: "com.rewire.app.safari-extension", category: "handler")

    private var sharedDefaults: UserDefaults? {
        return UserDefaults(suiteName: appGroupId)
    }

    func beginRequest(with context: NSExtensionContext) {
        guard let item = context.inputItems.first as? NSExtensionItem,
              let userInfo = item.userInfo as? [String: Any],
              let messageData = userInfo[SFExtensionMessageKey] as? [String: Any],
              let messageType = messageData["type"] as? String else {
            context.completeRequest(returningItems: nil, completionHandler: nil)
            return
        }

        logger.info("Received message type: \\(messageType)")

        var response: [String: Any] = [:]

        switch messageType {
        case "GET_DOMAIN_LIST":
            response = handleGetDomainList()

        case "SAVE_SESSION":
            if let payload = messageData["payload"] as? [String: Any] {
                response = handleSaveSession(payload)
            } else {
                response = ["success": false, "error": "Missing payload"]
            }

        case "SYNC_SESSIONS":
            if let payload = messageData["payload"] as? [[String: Any]] {
                response = handleSyncSessions(payload)
            } else {
                response = ["success": false, "error": "Missing payload"]
            }

        default:
            response = ["success": false, "error": "Unknown message type"]
        }

        let responseItem = NSExtensionItem()
        responseItem.userInfo = [SFExtensionMessageKey: response]
        context.completeRequest(returningItems: [responseItem], completionHandler: nil)
    }

    // MARK: - GET_DOMAIN_LIST

    private func handleGetDomainList() -> [String: Any] {
        guard let defaults = sharedDefaults else {
            return ["domains": [String]()]
        }
        let domains = defaults.stringArray(forKey: domainsKey) ?? []
        logger.info("Returning \\(domains.count) tracked domains")
        return ["domains": domains]
    }

    // MARK: - SAVE_SESSION

    private func handleSaveSession(_ session: [String: Any]) -> [String: Any] {
        guard let defaults = sharedDefaults else {
            return ["success": false, "error": "Cannot access shared defaults"]
        }

        var sessions = loadSessions(from: defaults)
        sessions.append(session)
        cleanupOldSessions(&sessions)
        defaults.set(sessions, forKey: sessionsKey)

        logger.info("Session saved. Total sessions: \\(sessions.count)")
        return ["success": true]
    }

    // MARK: - SYNC_SESSIONS

    private func handleSyncSessions(_ newSessions: [[String: Any]]) -> [String: Any] {
        guard let defaults = sharedDefaults else {
            return ["success": false, "error": "Cannot access shared defaults"]
        }

        var sessions = loadSessions(from: defaults)
        sessions.append(contentsOf: newSessions)
        cleanupOldSessions(&sessions)
        defaults.set(sessions, forKey: sessionsKey)

        logger.info("Synced \\(newSessions.count) sessions. Total: \\(sessions.count)")
        return ["success": true]
    }

    // MARK: - Helpers

    private func loadSessions(from defaults: UserDefaults) -> [[String: Any]] {
        guard let stored = defaults.array(forKey: sessionsKey) as? [[String: Any]] else {
            return []
        }
        return stored
    }

    /// Remove sessions older than 90 days
    private func cleanupOldSessions(_ sessions: inout [[String: Any]]) {
        let calendar = Calendar.current
        let cutoffDate = calendar.date(byAdding: .day, value: -90, to: Date()) ?? Date()
        let formatter = ISO8601DateFormatter()

        sessions = sessions.filter { session in
            guard let timestampStr = session["timestamp"] as? String,
                  let sessionDate = formatter.date(from: timestampStr) else {
                // Keep sessions without a parseable timestamp (best effort)
                return true
            }
            return sessionDate >= cutoffDate
        }
    }
}
`;

      console.log("[SafariWebExtension] Writing SafariWebExtensionHandler.swift");
      fs.writeFileSync(
        path.join(extDir, "SafariWebExtensionHandler.swift"),
        handlerSwift
      );

      // ---- RewireSafariExtension-Info.plist ----
      const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>CFBundleDevelopmentRegion</key>
\t<string>$(DEVELOPMENT_LANGUAGE)</string>
\t<key>CFBundleDisplayName</key>
\t<string>Rewire Safari Extension</string>
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
\t\t<string>com.apple.Safari.web-extension</string>
\t\t<key>NSExtensionPrincipalClass</key>
\t\t<string>$(PRODUCT_MODULE_NAME).SafariWebExtensionHandler</string>
\t</dict>
</dict>
</plist>
`;

      console.log("[SafariWebExtension] Writing RewireSafariExtension-Info.plist");
      fs.writeFileSync(
        path.join(extDir, "RewireSafariExtension-Info.plist"),
        infoPlist
      );

      return config;
    },
  ]);
}

// ============================================================
// Sub-plugin 3: Add extension target to Xcode project
// ============================================================
function withWebExtensionTarget(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const EXTENSION_NAME = "RewireSafariExtension";
    const EXTENSION_BUNDLE_ID = "rewire.app.com.RewireSafariExtension";

    // Add the app extension target
    const target = project.addTarget(
      EXTENSION_NAME,
      "app_extension",
      EXTENSION_NAME,
      EXTENSION_BUNDLE_ID
    );

    // Add build configuration settings for the extension target
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
          });
        }
      }
    }

    // Create group with all extension files
    const extGroup = project.addPbxGroup(
      [
        "SafariWebExtensionHandler.swift",
        "RewireSafariExtension-Info.plist",
        "manifest.json",
        "content.js",
        "background.js",
      ],
      EXTENSION_NAME,
      EXTENSION_NAME
    );

    // Add group to main project group
    const mainGroup = project.getFirstProject().firstProject.mainGroup;
    project.addToPbxGroup(extGroup.uuid, mainGroup);

    // Add Sources build phase (Swift files)
    project.addBuildPhase(
      [`${EXTENSION_NAME}/SafariWebExtensionHandler.swift`],
      "PBXSourcesBuildPhase",
      "Sources",
      target.uuid
    );

    // Add Resources build phase (manifest, JS files)
    project.addBuildPhase(
      [
        `${EXTENSION_NAME}/manifest.json`,
        `${EXTENSION_NAME}/content.js`,
        `${EXTENSION_NAME}/background.js`,
      ],
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
function withSafariWebExtension(config) {
  config = withWebExtensionEntitlement(config);
  config = withWebExtensionFiles(config);
  config = withWebExtensionTarget(config);
  return config;
}

module.exports = withSafariWebExtension;
