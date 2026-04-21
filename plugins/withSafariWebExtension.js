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
    version: '1.0',
    description: 'Rewire が衝動に気づかせるカスタムブロック拡張',
    default_locale: 'ja',
    permissions: ['nativeMessaging'],
    host_permissions: ['<all_urls>'],
    background: { service_worker: 'background.js' },
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

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    private static let appGroup = "group.rewire.app.com"
    private static let lastActiveKey = "rewire.webExtension.lastActiveAt"
    private static let panicCategoryId = "rewire-shield-panic"

    func beginRequest(with context: NSExtensionContext) {
        guard let item = context.inputItems.first as? NSExtensionItem,
              let msg = item.userInfo?[SFExtensionMessageKey] as? [String: Any]
        else {
            context.completeRequest(returningItems: [], completionHandler: nil)
            return
        }

        UserDefaults(suiteName: Self.appGroup)?
            .set(Date().timeIntervalSince1970, forKey: Self.lastActiveKey)

        if msg["type"] as? String == "blockedAccess" {
            scheduleNotification(domain: msg["domain"] as? String ?? "unknown")
        }

        let response = NSExtensionItem()
        response.userInfo = [SFExtensionMessageKey: ["status": "ok"]]
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }

    private func scheduleNotification(domain: String) {
        let content = UNMutableNotificationContent()
        content.title = "Rewire"
        content.body = "衝動に気づきました。今の気持ちを振り返りましょう。"
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
    <h1>衝動に気づきました</h1>
    <p>Rewire はあなたを守るためにこのサイトをブロックしました。<br/>今の気持ちを振り返ってみませんか？</p>
    <button id="rewire-open" type="button">Rewire を開く</button>
    <p class="subtext">通知からも Rewire を開けます</p>
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
  return `(function() {
  const params = new URLSearchParams(location.search);
  const domain = params.get('domain') || 'unknown';

  var runtime = (typeof browser !== 'undefined' && browser.runtime)
    ? browser.runtime
    : (typeof chrome !== 'undefined' ? chrome.runtime : null);

  if (runtime && runtime.sendMessage) {
    try {
      runtime.sendMessage({ type: 'blockedAccess', domain });
    } catch (e) { /* noop */ }
  }

  document.addEventListener('DOMContentLoaded', function () {
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
  return `var runtime = (typeof browser !== 'undefined' && browser.runtime)
  ? browser.runtime
  : chrome.runtime;

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
  return false;
});
`;
}

function generateContentJs() {
  return `(function () {
  try {
    var host = location.hostname.replace(/^www\\./, '');
    if (!BLOCKED_DOMAINS.some(function (d) {
      return host === d || host.endsWith('.' + d);
    })) {
      return;
    }
    // Fallback for iOS < 18.5 where declarativeNetRequest redirect may fail.
    window.stop();
    var runtime = (typeof browser !== 'undefined' && browser.runtime)
      ? browser.runtime
      : chrome.runtime;
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
        JSON.stringify({
          extensionDescription: {
            message: 'Rewire が衝動に気づかせるカスタムブロック拡張',
          },
        })
      );
      fs.writeFileSync(
        path.join(localesDir, 'en', 'messages.json'),
        JSON.stringify({
          extensionDescription: {
            message: 'Rewire custom block extension that helps you notice urges',
          },
        })
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
            MARKETING_VERSION: '1.0',
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

module.exports = withSafariWebExtension;
