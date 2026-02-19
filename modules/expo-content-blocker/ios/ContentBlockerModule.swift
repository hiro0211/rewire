import ExpoModulesCore
import SafariServices

public class ContentBlockerModule: Module {
    private let extensionBundleId = Bundle.main.bundleIdentifier! + ".ContentBlockerExtension"
    private let appGroupId = "group.rewire.app.com"
    private let customDomainsKey = "custom_blocked_domains"

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

        // Add a custom domain to the block list and reload
        AsyncFunction("addCustomDomain") { (domain: String) async -> Bool in
            guard let defaults = UserDefaults(suiteName: self.appGroupId) else { return false }
            var domains = defaults.stringArray(forKey: self.customDomainsKey) ?? []
            let normalized = domain.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
            guard !normalized.isEmpty,
                  normalized.contains("."),
                  !normalized.hasPrefix("."),
                  !normalized.hasSuffix("."),
                  !normalized.contains(" "),
                  !domains.contains(normalized) else { return false }
            domains.append(normalized)
            defaults.set(domains, forKey: self.customDomainsKey)
            return await self.reloadExtension()
        }

        // Remove a custom domain from the block list and reload
        AsyncFunction("removeCustomDomain") { (domain: String) async -> Bool in
            guard let defaults = UserDefaults(suiteName: self.appGroupId) else { return false }
            var domains = defaults.stringArray(forKey: self.customDomainsKey) ?? []
            domains.removeAll { $0 == domain.lowercased() }
            defaults.set(domains, forKey: self.customDomainsKey)
            return await self.reloadExtension()
        }

        // Get all custom blocked domains
        AsyncFunction("getCustomDomains") { () -> [String] in
            guard let defaults = UserDefaults(suiteName: self.appGroupId) else { return [] }
            return defaults.stringArray(forKey: self.customDomainsKey) ?? []
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
