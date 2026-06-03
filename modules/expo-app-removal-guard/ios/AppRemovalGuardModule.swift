import ExpoModulesCore
import FamilyControls
import ManagedSettings

/// Wraps ManagedSettings ApplicationSettings.denyAppRemoval.
///
/// When the user opts into self-binding from inside Rewire, this module
/// flips the system-wide "prevent app removal" flag while Rewire still
/// holds Family Controls authorization. The flag is honoured per
/// ManagedSettingsStore — we share the default store with
/// react-native-device-activity so a single authorization grants both.
///
/// To remove the lock the user must disable Rewire's Screen Time access
/// under Settings → Screen Time → Apps with Screen Time Access → Rewire
/// (Screen Time passcode required on iOS 26.4 and later).
public class AppRemovalGuardModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoAppRemovalGuard")

        AsyncFunction("setDenyAppRemoval") { (value: Bool) -> Bool in
            if #available(iOS 16.0, *) {
                let store = ManagedSettingsStore()
                store.application.denyAppRemoval = value
                return true
            }
            return false
        }

        AsyncFunction("getDenyAppRemoval") { () -> Bool in
            if #available(iOS 16.0, *) {
                let store = ManagedSettingsStore()
                return store.application.denyAppRemoval ?? false
            }
            return false
        }
    }
}
