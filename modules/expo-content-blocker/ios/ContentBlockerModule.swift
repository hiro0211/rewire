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
            print("[ContentBlocker] Checking status for extensionBundleId: \(self.extensionBundleId)")
            do {
                let state = try await SFContentBlockerManager.stateOfContentBlocker(withIdentifier: self.extensionBundleId)
                print("[ContentBlocker] Status: isEnabled=\(state.isEnabled)")
                return [
                    "isEnabled": state.isEnabled,
                    "extensionBundleId": self.extensionBundleId,
                ]
            } catch {
                print("[ContentBlocker] Failed to get state: \(error.localizedDescription)")
                return [
                    "isEnabled": false,
                    "extensionBundleId": self.extensionBundleId,
                    "error": error.localizedDescription,
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
            print("[ContentBlocker] Failed to reload: \(error.localizedDescription)")
            return false
        }
    }
}
