const {
  withEntitlementsPlist,
  withDangerousMod,
  withXcodeProject,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const DEFAULT_APP_GROUP = 'group.rewire.app.com';
const EXTENSION_NAME = 'SafariWebExtension';

// ============================================================
// Domain loader — single source of truth is constants/screenTime/blockedDomains.ts
// ============================================================
function loadBlockedDomains(projectRoot) {
  const tsPath = path.join(
    projectRoot,
    'constants',
    'screenTime',
    'blockedDomains.ts'
  );
  const source = fs.readFileSync(tsPath, 'utf8');
  const match = source.match(
    /export const ALL_BLOCKED_DOMAINS:[^=]*=\s*\[([\s\S]*?)\];/
  );
  if (!match) {
    throw new Error(
      '[withSafariWebExtension] ALL_BLOCKED_DOMAINS not found in constants/screenTime/blockedDomains.ts'
    );
  }
  const domains = [];
  const re = /'([^'\n]+)'|"([^"\n]+)"/g;
  let m;
  while ((m = re.exec(match[1])) !== null) {
    domains.push(m[1] || m[2]);
  }
  if (domains.length === 0) {
    throw new Error('[withSafariWebExtension] Parsed domain list is empty');
  }
  return Array.from(new Set(domains));
}

// ============================================================
// Generators
// ============================================================
function generateManifest() {
  // NOTE: declarativeNetRequest is intentionally omitted.
  // Safari 26.0 has a known regression where DNR `redirect` action causes
  // a reload/flicker loop ("This webpage was reloaded because a problem occurred").
  // Reported in Apple Developer Forums; no official fix at time of writing.
  // We rely solely on content_scripts at document_start to intercept navigation.
  return {
    manifest_version: 3,
    name: 'Rewire Safari Extension',
    version: '2.2.0',
    description: 'アダルトサイトを、開く前に止める。Rewire の Safari 拡張。',
    default_locale: 'ja',
    permissions: ['nativeMessaging', 'webNavigation', 'alarms'],
    host_permissions: ['<all_urls>'],
    // iOS Safari kills MV3 service_worker permanently after ~30-45s (known issue
    // since iOS 17.4, see Apple Dev Forums thread 758346). Use non-persistent
    // scripts as the recommended workaround — Safari accepts MV2 background
    // syntax inside an MV3 manifest.
    background: { scripts: ['background.js'], persistent: false },
    content_scripts: [
      {
        matches: ['<all_urls>'],
        run_at: 'document_start',
        js: ['domains.js', 'content.js'],
      },
    ],
    web_accessible_resources: [
      {
        resources: ['blocked.html', 'blocked.js', 'blocked.css', 'icons/*'],
        matches: ['<all_urls>'],
      },
    ],
    icons: {
      48: 'icons/app-icon.png',
      96: 'icons/app-icon.png',
      128: 'icons/app-icon.png',
    },
  };
}

function generateRules(domains) {
  return domains.map((domain, idx) => ({
    id: idx + 1,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: { extensionPath: `/blocked.html?domain=${domain}` },
    },
    condition: {
      urlFilter: `||${domain}`,
      resourceTypes: ['main_frame'],
    },
  }));
}

function generateSwiftHandler() {
  return `import SafariServices
import UserNotifications
import CoreFoundation
import os.log

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    private static let appGroup = "group.rewire.app.com"
    private static let lastActiveKey = "rewire.webExtension.lastActiveAt"
    private static let hasAllUrlsKey = "rewire.webExtension.hasAllUrls"
    private static let panicCategoryId = "rewire-shield-panic"
    private static let darwinAliveName = "rewire.extension.alive"
    private static let log = OSLog(subsystem: "rewire.app.com", category: "safari-ext-handler")

    func beginRequest(with context: NSExtensionContext) {
        guard let item = context.inputItems.first as? NSExtensionItem,
              let msg = item.userInfo?[SFExtensionMessageKey] as? [String: Any]
        else {
            os_log("recv: malformed message", log: Self.log, type: .error)
            context.completeRequest(returningItems: [], completionHandler: nil)
            return
        }

        let msgType = msg["type"] as? String ?? "unknown"
        let defaults = UserDefaults(suiteName: Self.appGroup)
        let now = Date().timeIntervalSince1970
        defaults?.set(now, forKey: Self.lastActiveKey)

        var hasAllUrlsLogged = "n/a"
        if let hasAllUrls = msg["hasAllUrls"] as? Bool {
            defaults?.set(hasAllUrls, forKey: Self.hasAllUrlsKey)
            hasAllUrlsLogged = hasAllUrls ? "true" : "false"
        }

        // Real-time signal to the host app: Darwin notifications are observed via
        // CFNotificationCenterGetDarwinNotifyCenter and deliver in <100ms with no
        // payload (details remain in the App Group UserDefaults written above).
        let darwinCenter = CFNotificationCenterGetDarwinNotifyCenter()
        CFNotificationCenterPostNotification(
            darwinCenter,
            CFNotificationName(Self.darwinAliveName as CFString),
            nil,
            nil,
            true
        )

        os_log(
            "recv type=%{public}@ ts=%{public}f hasAllUrls=%{public}@ groupOK=%{public}@",
            log: Self.log,
            type: .info,
            msgType,
            now,
            hasAllUrlsLogged,
            defaults != nil ? "true" : "false"
        )

        if msgType == "blockedAccess" {
            scheduleNotification(domain: msg["domain"] as? String ?? "unknown")
        }

        let response = NSExtensionItem()
        response.userInfo = [SFExtensionMessageKey: ["status": "ok"]]
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }

    private func localizedNotificationBody() -> String {
        // Mirror RN-side getDeviceLocale(): ja gets the Japanese copy,
        // everything else falls through to English. Source of truth for the
        // translated strings is _locales/{ja,en}/messages.json (notificationBody
        // is duplicated here because App Extensions cannot read browser.i18n).
        let lang = Locale.preferredLanguages.first?.prefix(2).lowercased() ?? "ja"
        if lang == "ja" {
            return "衝動に気づきました。今の気持ちを振り返りましょう。"
        }
        return "We noticed an urge. Take a moment to reflect."
    }

    private func scheduleNotification(domain: String) {
        let content = UNMutableNotificationContent()
        content.title = "Rewire"
        content.body = localizedNotificationBody()
        content.sound = .default
        content.categoryIdentifier = Self.panicCategoryId
        content.userInfo = ["route": "/panic", "domain": domain]

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 0.5, repeats: false)
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: trigger
        )
        UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)
    }
}
`;
}

function generateBlockedHtml() {
  // Inline copy stays as Japanese fallback — used pre-DOMContentLoaded and
  // when running outside a real WebExtension context (tests, manual preview).
  // At runtime, blocked.js replaces text via browser.i18n.getMessage() using
  // the data-i18n keys. Safari resolves the locale from the user's OS
  // language preferences and falls back to manifest.default_locale.
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Rewire</title>
  <link rel="stylesheet" href="blocked.css" />
</head>
<body>
  <div class="container">
    <img src="icons/app-icon.png" alt="Rewire" class="app-icon" />
    <h1 data-i18n="blockTitle">止めるって、決めたはず。</h1>
    <p data-i18n="blockBody"><span id="blocked-domain"></span> をブロックしました。
あのときの自分を、信じて。</p>
    <button id="rewire-open" type="button" data-i18n="openRewire">Rewire を開く</button>
    <p class="subtext" data-i18n="notificationHint">通知からも Rewire を開けます</p>
  </div>
  <script src="blocked.js"></script>
</body>
</html>
`;
}

function generateBlockedCss() {
  return `html, body { margin: 0; padding: 0; min-height: 100vh; }
body {
  /* Matches DARK_GRADIENTS.background: ['#0A0A0F', '#1a1a3e', '#2d1b4e'] */
  background: linear-gradient(180deg, #0A0A0F 0%, #1a1a3e 50%, #2d1b4e 100%);
  background-attachment: fixed;
  color: #E8E8ED;
  font-family: -apple-system, system-ui, 'Hiragino Sans', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-font-smoothing: antialiased;
}
.container {
  text-align: center;
  padding: 40px 24px;
  max-width: 400px;
}
.app-icon {
  width: 96px;
  height: 96px;
  border-radius: 22px;
  margin: 0 auto 32px;
  display: block;
  box-shadow: 0 0 60px rgba(139, 92, 246, 0.4);
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1);    box-shadow: 0 0 60px rgba(139, 92, 246, 0.4); }
  50%      { transform: scale(1.04); box-shadow: 0 0 80px rgba(139, 92, 246, 0.6); }
}
h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px;
  color: #E8E8ED;
}
p {
  color: #9CA0B5;
  line-height: 1.6;
  margin: 0 0 32px;
  /* blockBody message uses \\n line breaks (no <br/>); preserve them when
     blocked.js swaps textContent via browser.i18n.getMessage. */
  white-space: pre-line;
}
button {
  background: #8B5CF6;
  color: white;
  border: none;
  padding: 16px 40px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  font-family: inherit;
}
button:active { transform: scale(0.97); }
.subtext {
  font-size: 13px;
  color: #6B6B7B;
  margin-top: 16px;
}
`;
}

function generateBlockedJs() {
  // i18n keys here MUST stay in sync with generateLocaleMessages(). Safari
  // picks the locale based on the user's OS language preferences; manifest
  // default_locale=ja is the fallback when no match is found.
  return `(function() {
  const params = new URLSearchParams(location.search);
  const domain = params.get('domain') || 'unknown';

  var ext = (typeof browser !== 'undefined') ? browser
          : (typeof chrome !== 'undefined') ? chrome
          : null;
  var runtime = ext && ext.runtime ? ext.runtime : null;
  var i18n = ext && ext.i18n ? ext.i18n : null;

  if (runtime && runtime.sendMessage) {
    try {
      runtime.sendMessage({ type: 'blockedAccess', domain });
    } catch (e) { /* noop */ }
  }

  function localize(key, substitutions) {
    if (!i18n || !i18n.getMessage) return null;
    try {
      var msg = substitutions
        ? i18n.getMessage(key, substitutions)
        : i18n.getMessage(key);
      return msg && msg.length > 0 ? msg : null;
    } catch (e) {
      return null;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Domain fallback first — guarantees the domain is shown even if i18n
    // replacement below fails (e.g. older Safari, unexpected runtime).
    var domainEl = document.getElementById('blocked-domain');
    if (domainEl) {
      domainEl.textContent = domain;
    }

    // Per-key localization. Static keys swap textContent; blockBody passes
    // the domain as a $DOMAIN$ substitution so message authors control word order.
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute('data-i18n');
      var msg = (key === 'blockBody')
        ? localize('blockBody', [domain])
        : localize(key);
      if (msg) {
        el.textContent = msg;
      }
    }

    var btn = document.getElementById('rewire-open');
    if (btn) {
      btn.addEventListener('click', function () {
        window.location.href = 'rewire://panic';
      });
    }
  });
})();
`;
}

function generateBackgroundJs() {
  return `var api = (typeof browser !== 'undefined') ? browser : chrome;
var runtime = api.runtime;

var HEARTBEAT_DEBOUNCE_MS = 30 * 1000;
var lastHeartbeatAt = 0;

// hasAllUrls is hardcoded true: <all_urls> is in manifest.host_permissions
// (required), so the install gate already enforces it. We avoid the runtime
// permission check API because it returns false unreliably on Safari iOS.
function sendHeartbeat() {
  try {
    runtime.sendNativeMessage(
      'rewire.app.com.SafariWebExtension',
      { type: 'heartbeat', hasAllUrls: true, ts: Date.now() },
      function () {}
    );
  } catch (e) { /* noop */ }
}

function maybeHeartbeat() {
  var now = Date.now();
  if (now - lastHeartbeatAt < HEARTBEAT_DEBOUNCE_MS) return;
  lastHeartbeatAt = now;
  sendHeartbeat();
}

runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg && msg.type === 'blockedAccess') {
    try {
      runtime.sendNativeMessage('rewire.app.com.SafariWebExtension', msg, function (response) {
        sendResponse(response);
      });
    } catch (e) {
      sendResponse({ status: 'error', error: String(e) });
    }
    return true; // async
  }
  // contentHeartbeat: content_scripts wake the background page on every
  // navigation. Critical fallback for iOS Safari where the background may
  // be paged out aggressively.
  if (msg && msg.type === 'contentHeartbeat') {
    maybeHeartbeat();
    return false;
  }
  return false;
});

if (runtime.onStartup && runtime.onStartup.addListener) {
  runtime.onStartup.addListener(function () { sendHeartbeat(); });
}
if (runtime.onInstalled && runtime.onInstalled.addListener) {
  runtime.onInstalled.addListener(function () { sendHeartbeat(); });
}
if (api.webNavigation && api.webNavigation.onCommitted) {
  api.webNavigation.onCommitted.addListener(function (details) {
    if (details && details.frameId === 0) maybeHeartbeat();
  });
}
if (api.alarms && api.alarms.create) {
  try {
    api.alarms.create('rewire-heartbeat', { periodInMinutes: 15 });
    api.alarms.onAlarm.addListener(function (alarm) {
      if (alarm && alarm.name === 'rewire-heartbeat') sendHeartbeat();
    });
  } catch (e) { /* noop */ }
}
`;
}

function generateContentJs() {
  return `(function () {
  var runtime = (typeof browser !== 'undefined' && browser.runtime)
    ? browser.runtime
    : (typeof chrome !== 'undefined' ? chrome.runtime : null);

  // Fire heartbeat on every page load. Runs before block check so we always
  // signal "extension alive" even on safe pages. Critical fallback when the
  // MV3 background gets paged out on iOS Safari.
  try {
    if (runtime && runtime.sendMessage) {
      runtime.sendMessage({ type: 'contentHeartbeat' });
    }
  } catch (e) { /* noop */ }

  try {
    var host = location.hostname.replace(/^www\\./, '');
    if (!BLOCKED_DOMAINS.some(function (d) {
      return host === d || host.endsWith('.' + d);
    })) {
      return;
    }
    // Fallback for iOS < 18.5 where declarativeNetRequest redirect may fail.
    window.stop();
    if (!runtime) return;
    var extUrl = runtime.getURL('blocked.html') + '?domain=' + encodeURIComponent(host);
    window.location.replace(extUrl);
  } catch (e) { /* noop */ }
})();
`;
}

function generateDomainsJs(domains) {
  const json = JSON.stringify(domains, null, 2);
  return `const BLOCKED_DOMAINS = ${json};\n`;
}

// _locales/{ja,en}/messages.json content. Safari resolves the locale from the
// user's OS language preferences and falls back to manifest.default_locale (ja).
// Keys here MUST stay in sync with the data-i18n attributes emitted by
// generateBlockedHtml() and the lookups in generateBlockedJs().
const LOCALE_MESSAGES = {
  ja: {
    extensionDescription: {
      message: 'Rewire が衝動に気づかせるカスタムブロック拡張',
    },
    blockTitle: { message: '止めるって、決めたはず。' },
    blockBody: {
      message: '$DOMAIN$ をブロックしました。\nあのときの自分を、信じて。',
      placeholders: { domain: { content: '$1', example: 'example.com' } },
    },
    openRewire: { message: 'Rewire を開く' },
    notificationHint: { message: '通知からも Rewire を開けます' },
  },
  en: {
    extensionDescription: {
      message: 'Rewire custom block extension that helps you notice urges',
    },
    blockTitle: { message: "You said you'd stop." },
    blockBody: {
      message:
        "$DOMAIN$ has been blocked.\nTrust the version of you who made that choice.",
      placeholders: { domain: { content: '$1', example: 'example.com' } },
    },
    openRewire: { message: 'Open Rewire' },
    notificationHint: { message: 'You can also open Rewire from the notification' },
  },
};

function generateLocaleMessages(locale) {
  const messages = LOCALE_MESSAGES[locale];
  if (!messages) {
    throw new Error(
      `[withSafariWebExtension] No locale messages defined for "${locale}"`
    );
  }
  return messages;
}

// ============================================================
// Sub-plugin 1: App Groups entitlement on main app
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
// Sub-plugin 2: Write extension files during prebuild
// ============================================================
function withExtensionFiles(config, { appGroup }) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const iosPath = config.modRequest.platformProjectRoot;
      const projectRoot = config.modRequest.projectRoot;
      const extDir = path.join(iosPath, EXTENSION_NAME);
      // Put flat files at extension root; only icons/ and _locales/ stay as subdirs (folder refs).
      const iconDir = path.join(extDir, 'icons');
      const localesDir = path.join(extDir, '_locales');

      fs.mkdirSync(iconDir, { recursive: true });
      fs.mkdirSync(path.join(localesDir, 'ja'), { recursive: true });
      fs.mkdirSync(path.join(localesDir, 'en'), { recursive: true });

      // Copy app icon from main assets
      const iconSrc = path.join(projectRoot, 'assets', 'images', 'icon.png');
      const iconDst = path.join(iconDir, 'app-icon.png');
      if (fs.existsSync(iconSrc)) {
        fs.copyFileSync(iconSrc, iconDst);
      } else {
        console.warn(
          `[withSafariWebExtension] app icon not found at ${iconSrc}; extension icon will be missing`
        );
      }

      // Load domains for content_script matching.
      // We no longer generate rules.json because Safari 26 has a known
      // regression that breaks declarativeNetRequest redirect actions.
      // The content_script approach at document_start is robust.
      const domains = loadBlockedDomains(projectRoot);
      console.log(
        `[SafariWebExtension] Bundling ${domains.length} blocked domains for content_script matching`
      );

      fs.writeFileSync(
        path.join(extDir, 'manifest.json'),
        JSON.stringify(generateManifest(), null, 2)
      );
      fs.writeFileSync(path.join(extDir, 'domains.js'), generateDomainsJs(domains));
      fs.writeFileSync(path.join(extDir, 'background.js'), generateBackgroundJs());
      fs.writeFileSync(path.join(extDir, 'content.js'), generateContentJs());
      fs.writeFileSync(path.join(extDir, 'blocked.html'), generateBlockedHtml());
      fs.writeFileSync(path.join(extDir, 'blocked.css'), generateBlockedCss());
      fs.writeFileSync(path.join(extDir, 'blocked.js'), generateBlockedJs());

      // _locales
      fs.writeFileSync(
        path.join(localesDir, 'ja', 'messages.json'),
        JSON.stringify(generateLocaleMessages('ja'), null, 2)
      );
      fs.writeFileSync(
        path.join(localesDir, 'en', 'messages.json'),
        JSON.stringify(generateLocaleMessages('en'), null, 2)
      );

      // Swift handler
      fs.writeFileSync(
        path.join(extDir, 'SafariWebExtensionHandler.swift'),
        generateSwiftHandler()
      );

      // Info.plist
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
\t<string>2.2.0</string>
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
      fs.writeFileSync(path.join(extDir, `${EXTENSION_NAME}-Info.plist`), infoPlist);

      // Entitlements (App Group)
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
        path.join(extDir, `${EXTENSION_NAME}.entitlements`),
        entitlementsPlist
      );

      return config;
    },
  ]);
}

// ============================================================
// Sub-plugin 3: Add Xcode target
// ============================================================
function withExtensionTarget(config, { appleTeamId }) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const bundleId = `${config.ios.bundleIdentifier}.${EXTENSION_NAME}`;

    // Ensure dependency sections exist (xcode npm package bug fix, per withWidget.js pattern)
    const projObjects = project.hash.project.objects;
    projObjects.PBXTargetDependency = projObjects.PBXTargetDependency || {};
    projObjects.PBXContainerItemProxy = projObjects.PBXContainerItemProxy || {};
    projObjects.PBXBuildFile = projObjects.PBXBuildFile || {};
    projObjects.PBXFileReference = projObjects.PBXFileReference || {};

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
        const xcBuildConfig = project.pbxXCBuildConfigurationSection()[configUuid];
        if (xcBuildConfig) {
          xcBuildConfig.buildSettings = xcBuildConfig.buildSettings || {};
          Object.assign(xcBuildConfig.buildSettings, {
            SWIFT_VERSION: '5.0',
            IPHONEOS_DEPLOYMENT_TARGET: '15.0',
            PRODUCT_BUNDLE_IDENTIFIER: `"${bundleId}"`,
            INFOPLIST_FILE: `"${EXTENSION_NAME}/${EXTENSION_NAME}-Info.plist"`,
            CODE_SIGN_STYLE: 'Automatic',
            DEVELOPMENT_TEAM: appleTeamId,
            TARGETED_DEVICE_FAMILY: `"1,2"`,
            GENERATE_INFOPLIST_FILE: 'NO',
            MARKETING_VERSION: '2.2.0',
            CURRENT_PROJECT_VERSION: '1',
            SWIFT_EMIT_LOC_STRINGS: 'YES',
            CODE_SIGN_ENTITLEMENTS: `"${EXTENSION_NAME}/${EXTENSION_NAME}.entitlements"`,
          });
        }
      }
    }

    // Flat files that sit at the extension root and end up at the .appex root.
    // Note: rules.json is NOT generated because Safari 26 has a regression that
    // breaks declarativeNetRequest redirect. We rely on content_scripts instead.
    const FLAT_RESOURCES = [
      'manifest.json',
      'background.js',
      'content.js',
      'domains.js',
      'blocked.html',
      'blocked.css',
      'blocked.js',
    ];

    // Extension group with Swift source, plists, and all individual flat resource files.
    const extGroup = project.addPbxGroup(
      [
        'SafariWebExtensionHandler.swift',
        `${EXTENSION_NAME}-Info.plist`,
        `${EXTENSION_NAME}.entitlements`,
        ...FLAT_RESOURCES,
      ],
      EXTENSION_NAME,
      EXTENSION_NAME
    );

    const mainGroup = project.getFirstProject().firstProject.mainGroup;
    project.addToPbxGroup(extGroup.uuid, mainGroup);

    // Sources build phase (Swift compilation).
    project.addBuildPhase(
      [`${EXTENSION_NAME}/SafariWebExtensionHandler.swift`],
      'PBXSourcesBuildPhase',
      'Sources',
      target.uuid
    );

    // Empty frameworks build phase (SafariServices/UserNotifications auto-linked via Swift).
    project.addBuildPhase(
      [],
      'PBXFrameworksBuildPhase',
      'Frameworks',
      target.uuid
    );

    // Resources build phase with flat files.
    project.addBuildPhase(
      FLAT_RESOURCES.map((f) => `${EXTENSION_NAME}/${f}`),
      'PBXResourcesBuildPhase',
      'Resources',
      target.uuid
    );

    // Retrieve the Resources build phase object we just created so we can append folder refs.
    const buildPhaseSection = project.hash.project.objects.PBXResourcesBuildPhase;
    let resourcesPhaseUuid = null;
    for (const [uuid, section] of Object.entries(buildPhaseSection)) {
      if (uuid.endsWith('_comment')) continue;
      if (
        section.files &&
        section.files.some(
          (f) => f.comment && f.comment.includes('manifest.json')
        )
      ) {
        resourcesPhaseUuid = uuid;
        break;
      }
    }

    // Add folder references for icons/ and _locales/ so subdirectory
    // structure is preserved in the .appex bundle.
    const FOLDER_REFS = ['icons', '_locales'];
    for (const folderName of FOLDER_REFS) {
      const fileRefUuid = project.generateUuid();
      const buildFileUuid = project.generateUuid();

      projObjects.PBXFileReference[fileRefUuid] = {
        isa: 'PBXFileReference',
        lastKnownFileType: 'folder',
        path: folderName,
        sourceTree: '"<group>"',
      };
      projObjects.PBXFileReference[fileRefUuid + '_comment'] = folderName;

      // Add to extension group
      const extGroupObj = projObjects.PBXGroup[extGroup.uuid];
      extGroupObj.children.push({ value: fileRefUuid, comment: folderName });

      // Build file reference
      projObjects.PBXBuildFile[buildFileUuid] = {
        isa: 'PBXBuildFile',
        fileRef: fileRefUuid,
        fileRef_comment: folderName,
      };
      projObjects.PBXBuildFile[buildFileUuid + '_comment'] =
        `${folderName} in Resources`;

      // Append to Resources build phase files list
      if (resourcesPhaseUuid) {
        const phase = buildPhaseSection[resourcesPhaseUuid];
        phase.files.push({
          value: buildFileUuid,
          comment: `${folderName} in Resources`,
        });
      }
    }

    return config;
  });
}

// ============================================================
// Main plugin
// ============================================================
function withSafariWebExtension(config, props = {}) {
  const options = {
    appleTeamId: props.appleTeamId || 'KV6CYPA7JK',
    appGroup: props.appGroup || DEFAULT_APP_GROUP,
  };
  if (!options.appleTeamId) {
    throw new Error(
      '[withSafariWebExtension] appleTeamId option is required in app.config.ts'
    );
  }
  config = withAppGroupsEntitlement(config, options);
  config = withExtensionFiles(config, options);
  config = withExtensionTarget(config, options);
  return config;
}

// Exports for tests
withSafariWebExtension.loadBlockedDomains = loadBlockedDomains;
withSafariWebExtension.generateManifest = generateManifest;
withSafariWebExtension.generateRules = generateRules;
withSafariWebExtension.generateSwiftHandler = generateSwiftHandler;
withSafariWebExtension.generateBlockedHtml = generateBlockedHtml;
withSafariWebExtension.generateBlockedCss = generateBlockedCss;
withSafariWebExtension.generateBlockedJs = generateBlockedJs;
withSafariWebExtension.generateBackgroundJs = generateBackgroundJs;
withSafariWebExtension.generateContentJs = generateContentJs;
withSafariWebExtension.generateDomainsJs = generateDomainsJs;
withSafariWebExtension.generateLocaleMessages = generateLocaleMessages;

module.exports = withSafariWebExtension;
