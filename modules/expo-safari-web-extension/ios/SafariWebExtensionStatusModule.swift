import ExpoModulesCore
import Foundation
import SafariServices
import CoreFoundation
import os.log

// NOTE (2026-05-01): The `getExtensionState` (Tier 1) and Darwin notification
// observer (Tier 2) APIs below are currently NOT consumed by the JS UI layer.
// The JS-side `useExtensionGate` hook was removed after real-device testing
// showed the detection unreliable in production. The post-purchase demo flow
// now uses a user confirmation modal instead of programmatic detection. These
// native APIs are kept for future re-attempts at detection — do NOT delete
// without coordinating with the JS bridge (`safariWebExtensionBridge`).

public class SafariWebExtensionStatusModule: Module {
    private let appGroup = "group.rewire.app.com"
    private let lastActiveKey = "rewire.webExtension.lastActiveAt"
    private let lastBlockedKey = "rewire.webExtension.lastBlockedAt"
    private let hasAllUrlsKey = "rewire.webExtension.hasAllUrls"
    private let darwinAliveName = "rewire.extension.alive"
    // 6h: matches the JS-side ACTIVE_WINDOW_SECONDS in lib/safariWebExtension/deriveStatus.ts.
    // The JS layer is the primary judge of state (never/active/stale) and reads `lastActiveAt`
    // directly. `isEnabled` here is kept for legacy callers but is effectively unused now.
    private let activeWindowSeconds: TimeInterval = 60 * 60 * 6
    private let log = OSLog(subsystem: "rewire.app.com", category: "safari-ext")

    public func definition() -> ModuleDefinition {
        Name("SafariWebExtensionStatus")

        Events("onExtensionAlive")

        OnCreate {
            let center = CFNotificationCenterGetDarwinNotifyCenter()
            let observer = Unmanaged.passUnretained(self).toOpaque()
            CFNotificationCenterAddObserver(
                center,
                observer,
                { (_, observerPtr, _, _, _) in
                    guard let observerPtr = observerPtr else { return }
                    let module = Unmanaged<SafariWebExtensionStatusModule>
                        .fromOpaque(observerPtr)
                        .takeUnretainedValue()
                    let payload: [String: Any] = [
                        "receivedAt": Date().timeIntervalSince1970,
                    ]
                    DispatchQueue.main.async {
                        module.sendEvent("onExtensionAlive", payload)
                    }
                },
                self.darwinAliveName as CFString,
                nil,
                .deliverImmediately
            )
        }

        OnDestroy {
            let center = CFNotificationCenterGetDarwinNotifyCenter()
            let observer = Unmanaged.passUnretained(self).toOpaque()
            CFNotificationCenterRemoveEveryObserver(center, observer)
        }

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

        // Tier 1: SFSafariExtensionManager.getStateOfSafariExtension (iOS 26.2+).
        // Returns { available: false } on older iOS so the JS layer can fall back
        // to Tier 2 (Darwin notification + probe) and Tier 3 (heartbeat).
        AsyncFunction("getExtensionState") { (promise: Promise) in
            let bundleId = (Bundle.main.bundleIdentifier ?? "rewire.app.com") + ".SafariWebExtension"

            if #available(iOS 26.2, *) {
                SFSafariExtensionManager.getStateOfSafariExtension(
                    withIdentifier: bundleId
                ) { state, error in
                    if let error = error {
                        os_log(
                            "getStateOfSafariExtension error: %{public}@",
                            log: self.log,
                            type: .error,
                            String(describing: error)
                        )
                        promise.resolve([
                            "available": true,
                            "isEnabled": false,
                            "error": String(describing: error),
                        ])
                        return
                    }
                    promise.resolve([
                        "available": true,
                        "isEnabled": state?.isEnabled ?? false,
                    ])
                }
            } else {
                promise.resolve([
                    "available": false,
                    "isEnabled": false,
                ])
            }
        }
    }
}
