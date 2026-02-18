import ExpoModulesCore
import SafariServices

public class ContentBlockerModule: Module {
    private let extensionBundleId = Bundle.main.bundleIdentifier! + ".ContentBlockerExtension"

    public func definition() -> ModuleDefinition {
        Name("ExpoContentBlocker")

        // Reload the content blocker rules in Safari
        AsyncFunction("enableBlocker") { () async -> Bool in
            return await self.reloadExtension()
        }

        // Content blockers can only be disabled from Safari Settings
        AsyncFunction("disableBlocker") { () async -> Bool in
            return false
        }

        // Check actual state from SFContentBlockerManager
        AsyncFunction("getBlockerStatus") { () async -> [String: Any] in
            do {
                let state = try await SFContentBlockerManager.stateOfContentBlocker(withIdentifier: self.extensionBundleId)
                return [
                    "isEnabled": state.isEnabled,
                    "extensionBundleId": self.extensionBundleId,
                ]
            } catch {
                print("Failed to get content blocker state: \(error)")
                return [
                    "isEnabled": false,
                    "extensionBundleId": self.extensionBundleId,
                ]
            }
        }

        AsyncFunction("reloadBlockerRules") { () async -> Bool in
            return await self.reloadExtension()
        }
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
