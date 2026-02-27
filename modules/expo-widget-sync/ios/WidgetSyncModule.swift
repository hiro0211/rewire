import ExpoModulesCore
import WidgetKit

public class WidgetSyncModule: Module {
    private let appGroupId = "group.rewire.app.com"
    private let dataKey = "widget_data"

    public func definition() -> ModuleDefinition {
        Name("ExpoWidgetSync")

        AsyncFunction("syncData") { (json: String) in
            guard let defaults = UserDefaults(suiteName: self.appGroupId) else { return }
            defaults.set(json, forKey: self.dataKey)
        }

        AsyncFunction("reloadTimelines") { () in
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
    }
}
