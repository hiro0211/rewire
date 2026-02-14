import ExpoModulesCore
import SafariServices

public class ContentBlockerModule: Module {
    private let extensionBundleId = Bundle.main.bundleIdentifier! + ".ContentBlockerExtension"
    private let appGroupId = "group.com.rewire.app"
    private let blockerEnabledKey = "contentBlockerEnabled"

    public func definition() -> ModuleDefinition {
        Name("ExpoContentBlocker")

        AsyncFunction("enableBlocker") { () async -> Bool in
            self.setBlockerEnabled(true)
            return await self.reloadExtension()
        }

        AsyncFunction("disableBlocker") { () async -> Bool in
            self.setBlockerEnabled(false)
            return await self.reloadExtension()
        }

        Function("getBlockerStatus") { () -> [String: Any] in
            return [
                "isEnabled": self.isBlockerEnabled(),
                "extensionBundleId": self.extensionBundleId,
            ]
        }

        AsyncFunction("reloadBlockerRules") { () -> Bool in
            return await self.reloadExtension()
        }
    }

    private func setBlockerEnabled(_ enabled: Bool) {
        guard let defaults = UserDefaults(suiteName: appGroupId) else { return }
        defaults.set(enabled, forKey: blockerEnabledKey)
        defaults.synchronize()
    }

    private func isBlockerEnabled() -> Bool {
        guard let defaults = UserDefaults(suiteName: appGroupId) else { return false }
        return defaults.bool(forKey: blockerEnabledKey)
    }

    private func reloadExtension() async -> Bool {
        do {
            try await SFContentBlockerManager.reloadContentBlocker(withIdentifier: extensionBundleId)
            return true
        } catch {
            print("Failed to reload content blocker: \(error)")
            return false
        }
    }
}
