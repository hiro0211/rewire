import ExpoModulesCore

public class ScreenTimeModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoScreenTime")

        AsyncFunction("requestAuthorization") { (promise: Promise) in
            if #available(iOS 16.0, *) {
                Task {
                    do {
                        let center = AuthorizationCenter.shared
                        try await center.requestAuthorization(for: .individual)
                        promise.resolve(["status": "approved"])
                    } catch {
                        promise.resolve(["status": "denied", "error": error.localizedDescription])
                    }
                }
            } else {
                promise.resolve(["status": "notDetermined", "error": "iOS 16.0 or later required"])
            }
        }

        AsyncFunction("getAuthorizationStatus") { (promise: Promise) in
            if #available(iOS 16.0, *) {
                let status = AuthorizationCenter.shared.authorizationStatus
                switch status {
                case .notDetermined:
                    promise.resolve("notDetermined")
                case .denied:
                    promise.resolve("denied")
                case .approved:
                    promise.resolve("approved")
                @unknown default:
                    promise.resolve("notDetermined")
                }
            } else {
                promise.resolve("notDetermined")
            }
        }

        AsyncFunction("enableWebContentFilter") { (promise: Promise) in
            if #available(iOS 16.0, *) {
                do {
                    let store = ManagedSettingsStore()
                    store.webContent.filterPolicy = .auto()
                    promise.resolve(true)
                } catch {
                    promise.resolve(false)
                }
            } else {
                promise.resolve(false)
            }
        }

        AsyncFunction("disableWebContentFilter") { (promise: Promise) in
            if #available(iOS 16.0, *) {
                do {
                    let store = ManagedSettingsStore()
                    store.webContent.filterPolicy = nil
                    promise.resolve(true)
                } catch {
                    promise.resolve(false)
                }
            } else {
                promise.resolve(false)
            }
        }
    }
}
