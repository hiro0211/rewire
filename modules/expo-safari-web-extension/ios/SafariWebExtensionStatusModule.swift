import ExpoModulesCore
import Foundation
import os.log

public class SafariWebExtensionStatusModule: Module {
    private let appGroup = "group.rewire.app.com"
    private let lastActiveKey = "rewire.webExtension.lastActiveAt"
    private let lastBlockedKey = "rewire.webExtension.lastBlockedAt"
    private let hasAllUrlsKey = "rewire.webExtension.hasAllUrls"
    // 6h: matches the JS-side ACTIVE_WINDOW_SECONDS in lib/safariWebExtension/deriveStatus.ts.
    // The JS layer is the primary judge of state (never/active/stale) and reads `lastActiveAt`
    // directly. `isEnabled` here is kept for legacy callers but is effectively unused now.
    private let activeWindowSeconds: TimeInterval = 60 * 60 * 6
    private let log = OSLog(subsystem: "rewire.app.com", category: "safari-ext")

    public func definition() -> ModuleDefinition {
        Name("SafariWebExtensionStatus")

        AsyncFunction("getExtensionStatus") { () -> [String: Any] in
            let defaults = UserDefaults(suiteName: self.appGroup)
            let lastActive = defaults?.double(forKey: self.lastActiveKey) ?? 0
            let lastBlocked = defaults?.double(forKey: self.lastBlockedKey) ?? 0
            let hasAllUrls = defaults?.bool(forKey: self.hasAllUrlsKey) ?? false
            let now = Date().timeIntervalSince1970
            let delta = now - lastActive
            let isRecentlyActive = lastActive > 0 && delta < self.activeWindowSeconds
            let bundleId = (Bundle.main.bundleIdentifier ?? "rewire.app.com") + ".SafariWebExtension"

            os_log(
                "status: lastActive=%{public}f lastBlocked=%{public}f delta=%{public}f window=%{public}f isEnabled=%{public}@ hasAllUrls=%{public}@",
                log: self.log,
                type: .info,
                lastActive,
                lastBlocked,
                delta,
                self.activeWindowSeconds,
                isRecentlyActive ? "true" : "false",
                hasAllUrls ? "true" : "false"
            )

            return [
                "isEnabled": isRecentlyActive,
                "hasAllUrls": hasAllUrls,
                "extensionBundleId": bundleId,
                "lastActiveAt": lastActive,
                "lastBlockedAt": lastBlocked,
            ]
        }
    }
}
