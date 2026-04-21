import ExpoModulesCore
import Foundation

public class SafariWebExtensionStatusModule: Module {
    private let appGroup = "group.rewire.app.com"
    private let lastActiveKey = "rewire.webExtension.lastActiveAt"
    private let activeWindowSeconds: TimeInterval = 60 * 60 * 24  // 24h

    public func definition() -> ModuleDefinition {
        Name("SafariWebExtensionStatus")

        AsyncFunction("getExtensionStatus") { () -> [String: Any] in
            let defaults = UserDefaults(suiteName: self.appGroup)
            let lastActive = defaults?.double(forKey: self.lastActiveKey) ?? 0
            let now = Date().timeIntervalSince1970
            let delta = now - lastActive
            let isRecentlyActive = lastActive > 0 && delta < self.activeWindowSeconds
            let bundleId = (Bundle.main.bundleIdentifier ?? "rewire.app.com") + ".SafariWebExtension"
            return [
                "isEnabled": isRecentlyActive,
                "extensionBundleId": bundleId,
                "lastActiveAt": lastActive,
            ]
        }
    }
}
