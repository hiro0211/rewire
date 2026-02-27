const {
  withEntitlementsPlist,
  withDangerousMod,
  withXcodeProject,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const WIDGET_EXTENSION_NAME = "RewireWidget";
const WIDGET_BUNDLE_ID = "rewire.app.com.RewireWidget";
const APP_GROUP_ID = "group.rewire.app.com";
const DATA_KEY = "widget_data";

// ============================================================
// Swift code generators
// ============================================================

function generateWidgetSwift() {
  return `import WidgetKit
import SwiftUI

struct WidgetData: Codable {
    let streakStartDate: String?
    let goalDays: Int
    let relapseCount: Int
    let updatedAt: String
}

struct RewireEntry: TimelineEntry {
    let date: Date
    let days: Int
    let hours: Int
    let minutes: Int
    let relapseCount: Int
    let goalDays: Int
    let hasData: Bool
}

struct RewireWidgetProvider: TimelineProvider {
    private let appGroupId = "${APP_GROUP_ID}"
    private let dataKey = "${DATA_KEY}"

    func placeholder(in context: Context) -> RewireEntry {
        RewireEntry(date: Date(), days: 0, hours: 0, minutes: 0, relapseCount: 0, goalDays: 30, hasData: false)
    }

    func getSnapshot(in context: Context, completion: @escaping (RewireEntry) -> Void) {
        let entry = createEntry(date: Date())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<RewireEntry>) -> Void) {
        let now = Date()
        let entry = createEntry(date: now)
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: now) ?? now
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func createEntry(date: Date) -> RewireEntry {
        guard let defaults = UserDefaults(suiteName: appGroupId),
              let json = defaults.string(forKey: dataKey),
              let jsonData = json.data(using: .utf8),
              let data = try? JSONDecoder().decode(WidgetData.self, from: jsonData) else {
            return RewireEntry(date: date, days: 0, hours: 0, minutes: 0, relapseCount: 0, goalDays: 0, hasData: false)
        }

        var days = 0
        var hours = 0
        var minutes = 0

        if let startDateStr = data.streakStartDate {
            let formatter = ISO8601DateFormatter()
            var startDate: Date?
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            startDate = formatter.date(from: startDateStr)
            if startDate == nil {
                formatter.formatOptions = [.withInternetDateTime]
                startDate = formatter.date(from: startDateStr)
            }
            if startDate == nil {
                formatter.formatOptions = [.withFullDate]
                startDate = formatter.date(from: startDateStr)
            }
            if let startDate = startDate {
                let components = Calendar.current.dateComponents([.day, .hour, .minute], from: startDate, to: date)
                days = max(0, components.day ?? 0)
                hours = max(0, components.hour ?? 0)
                minutes = max(0, components.minute ?? 0)
            }
        }

        return RewireEntry(
            date: date,
            days: days,
            hours: hours,
            minutes: minutes,
            relapseCount: data.relapseCount,
            goalDays: data.goalDays,
            hasData: true
        )
    }
}
`;
}

function generateWidgetViews() {
  return `import SwiftUI
import WidgetKit

extension View {
    @ViewBuilder
    func widgetBackground(_ color: Color) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            self.containerBackground(color, for: .widget)
        } else {
            self.background(color)
        }
    }
}

struct RewireWidgetSmallView: View {
    let entry: RewireEntry

    private let bgColor = Color(red: 10/255, green: 10/255, blue: 15/255)
    private let accentColor = Color(red: 139/255, green: 92/255, blue: 246/255)

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(formatElapsed())
                .font(.system(size: 22, weight: .bold, design: .monospaced))
                .foregroundColor(.white)
                .minimumScaleFactor(0.6)

            Spacer()

            HStack {
                Label("\\(entry.relapseCount)", systemImage: "arrow.counterclockwise")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                Spacer()
                Label("\\(entry.goalDays)日", systemImage: "flag.fill")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(accentColor)
            }
        }
        .padding()
        .widgetBackground(bgColor)
    }

    private func formatElapsed() -> String {
        if entry.days == 0 && entry.hours == 0 && entry.minutes == 0 {
            return "0分"
        }
        var parts: [String] = []
        if entry.days > 0 { parts.append("\\(entry.days)日") }
        if entry.hours > 0 { parts.append("\\(entry.hours)時間") }
        parts.append("\\(entry.minutes)分")
        return parts.joined()
    }
}

struct RewireWidgetMediumView: View {
    let entry: RewireEntry

    private let bgColor = Color(red: 10/255, green: 10/255, blue: 15/255)
    private let accentColor = Color(red: 139/255, green: 92/255, blue: 246/255)

    var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Text("経過時間")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.white.opacity(0.6))
                Text(formatElapsed())
                    .font(.system(size: 24, weight: .bold, design: .monospaced))
                    .foregroundColor(.white)
                    .minimumScaleFactor(0.5)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 8) {
                HStack(spacing: 4) {
                    Image(systemName: "arrow.counterclockwise")
                        .font(.system(size: 11))
                    Text("リセット \\(entry.relapseCount)回")
                        .font(.system(size: 12, weight: .medium))
                }
                .foregroundColor(.white.opacity(0.8))

                HStack(spacing: 4) {
                    Image(systemName: "flag.fill")
                        .font(.system(size: 11))
                    Text("目標 \\(entry.goalDays)日")
                        .font(.system(size: 12, weight: .medium))
                }
                .foregroundColor(accentColor)
            }
        }
        .padding()
        .widgetBackground(bgColor)
    }

    private func formatElapsed() -> String {
        if entry.days == 0 && entry.hours == 0 && entry.minutes == 0 {
            return "0分"
        }
        var parts: [String] = []
        if entry.days > 0 { parts.append("\\(entry.days)日") }
        if entry.hours > 0 { parts.append("\\(entry.hours)時間") }
        parts.append("\\(entry.minutes)分")
        return parts.joined()
    }
}

struct RewireWidgetEntryView: View {
    @Environment(\\.widgetFamily) var family
    let entry: RewireEntry

    var body: some View {
        switch family {
        case .systemMedium:
            RewireWidgetMediumView(entry: entry)
        default:
            RewireWidgetSmallView(entry: entry)
        }
    }
}

struct RewireWidget: Widget {
    let kind = "RewireWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: RewireWidgetProvider()) { entry in
            RewireWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Rewire")
        .description("経過時間・リセット回数・目標日数")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
`;
}

function generateWidgetBundle() {
  return `import SwiftUI
import WidgetKit

@main
struct RewireWidgetBundle: WidgetBundle {
    var body: some Widget {
        RewireWidget()
    }
}
`;
}

function generateInfoPlist() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>CFBundleDevelopmentRegion</key>
\t<string>$(DEVELOPMENT_LANGUAGE)</string>
\t<key>CFBundleDisplayName</key>
\t<string>Rewire Widget</string>
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
\t\t<string>com.apple.widgetkit-extension</string>
\t</dict>
</dict>
</plist>
`;
}

function generateEntitlements() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.security.application-groups</key>
\t<array>
\t\t<string>${APP_GROUP_ID}</string>
\t</array>
</dict>
</plist>
`;
}

// ============================================================
// Sub-plugin 1: Ensure App Groups entitlement
// ============================================================
function withWidgetEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    const groups =
      config.modResults["com.apple.security.application-groups"] || [];
    if (!groups.includes(APP_GROUP_ID)) {
      groups.push(APP_GROUP_ID);
    }
    config.modResults["com.apple.security.application-groups"] = groups;
    return config;
  });
}

// ============================================================
// Sub-plugin 2: Write widget extension files
// ============================================================
function withWidgetExtensionFiles(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const iosPath = config.modRequest.platformProjectRoot;
      const extDir = path.join(iosPath, WIDGET_EXTENSION_NAME);

      fs.mkdirSync(extDir, { recursive: true });

      fs.writeFileSync(
        path.join(extDir, "RewireWidgetProvider.swift"),
        generateWidgetSwift()
      );
      fs.writeFileSync(
        path.join(extDir, "RewireWidgetViews.swift"),
        generateWidgetViews()
      );
      fs.writeFileSync(
        path.join(extDir, "RewireWidgetBundle.swift"),
        generateWidgetBundle()
      );
      fs.writeFileSync(
        path.join(extDir, "RewireWidget-Info.plist"),
        generateInfoPlist()
      );
      fs.writeFileSync(
        path.join(extDir, "RewireWidget.entitlements"),
        generateEntitlements()
      );

      return config;
    },
  ]);
}

// ============================================================
// Sub-plugin 3: Add widget extension target to Xcode project
// ============================================================
function withWidgetExtensionTarget(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;

    // Fix for xcode npm package bug: ensure dependency sections exist
    // before addTarget tries to create target dependencies.
    // Without this, addTargetDependency silently fails if sections don't exist.
    const projObjects = project.hash.project.objects;
    projObjects["PBXTargetDependency"] =
      projObjects["PBXTargetDependency"] || {};
    projObjects["PBXContainerItemProxy"] =
      projObjects["PBXContainerItemProxy"] || {};

    // addTarget with 'app_extension' automatically:
    // 1. Creates the native target
    // 2. Adds a "Copy Files" (embed) build phase on the main app target (dstSubfolderSpec=13)
    // 3. Adds the .appex product to that phase
    // 4. Creates a target dependency from main app -> widget extension
    const target = project.addTarget(
      WIDGET_EXTENSION_NAME,
      "app_extension",
      WIDGET_EXTENSION_NAME,
      WIDGET_BUNDLE_ID
    );

    // Configure build settings for the widget extension target
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
            PRODUCT_BUNDLE_IDENTIFIER: `"${WIDGET_BUNDLE_ID}"`,
            INFOPLIST_FILE: `"${WIDGET_EXTENSION_NAME}/${WIDGET_EXTENSION_NAME}-Info.plist"`,
            CODE_SIGN_STYLE: "Automatic",
            DEVELOPMENT_TEAM: "KV6CYPA7JK",
            TARGETED_DEVICE_FAMILY: `"1,2"`,
            GENERATE_INFOPLIST_FILE: "NO",
            MARKETING_VERSION: "1.0",
            CURRENT_PROJECT_VERSION: "1",
            SWIFT_EMIT_LOC_STRINGS: "YES",
            CODE_SIGN_ENTITLEMENTS: `"${WIDGET_EXTENSION_NAME}/${WIDGET_EXTENSION_NAME}.entitlements"`,
          });
        }
      }
    }

    // Add file group for widget extension source files
    const extGroup = project.addPbxGroup(
      [
        "RewireWidgetProvider.swift",
        "RewireWidgetViews.swift",
        "RewireWidgetBundle.swift",
        "RewireWidget-Info.plist",
        "RewireWidget.entitlements",
      ],
      WIDGET_EXTENSION_NAME,
      WIDGET_EXTENSION_NAME
    );

    const mainGroup = project.getFirstProject().firstProject.mainGroup;
    project.addToPbxGroup(extGroup.uuid, mainGroup);

    // Add source files build phase
    project.addBuildPhase(
      [
        `${WIDGET_EXTENSION_NAME}/RewireWidgetProvider.swift`,
        `${WIDGET_EXTENSION_NAME}/RewireWidgetViews.swift`,
        `${WIDGET_EXTENSION_NAME}/RewireWidgetBundle.swift`,
      ],
      "PBXSourcesBuildPhase",
      "Sources",
      target.uuid
    );

    // Add empty frameworks build phase (WidgetKit/SwiftUI auto-linked by Swift)
    project.addBuildPhase(
      [],
      "PBXFrameworksBuildPhase",
      "Frameworks",
      target.uuid
    );

    // Add empty resources build phase
    project.addBuildPhase(
      [],
      "PBXResourcesBuildPhase",
      "Resources",
      target.uuid
    );

    return config;
  });
}

// ============================================================
// Main plugin
// ============================================================
function withWidget(config) {
  config = withWidgetEntitlement(config);
  config = withWidgetExtensionFiles(config);
  config = withWidgetExtensionTarget(config);
  return config;
}

withWidget.generateWidgetSwift = generateWidgetSwift;
withWidget.generateWidgetViews = generateWidgetViews;
withWidget.generateWidgetBundle = generateWidgetBundle;
withWidget.generateInfoPlist = generateInfoPlist;
withWidget.generateEntitlements = generateEntitlements;
withWidget.WIDGET_BUNDLE_ID = WIDGET_BUNDLE_ID;
withWidget.WIDGET_EXTENSION_NAME = WIDGET_EXTENSION_NAME;

module.exports = withWidget;
