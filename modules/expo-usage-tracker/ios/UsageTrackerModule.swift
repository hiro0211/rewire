import ExpoModulesCore

public class UsageTrackerModule: Module {
    private let appGroupId = "group.rewire.app.com"
    private let sessionsKey = "safari_extension_sessions"
    private let domainsKey = "safari_extension_domains"

    public func definition() -> ModuleDefinition {
        Name("ExpoUsageTracker")

        // Get sessions between start and end dates (inclusive)
        AsyncFunction("getSessions") { (startDate: String, endDate: String) -> [[String: Any]] in
            let sessions = self.loadSessions()
            return sessions.filter { session in
                guard let date = session["date"] as? String else { return false }
                return date >= startDate && date <= endDate
            }
        }

        // Get today's total usage in milliseconds
        AsyncFunction("getTodayUsage") { () -> Int in
            let today = self.todayDateString()
            let sessions = self.loadSessions()
            var total = 0
            for session in sessions {
                if let date = session["date"] as? String, date == today,
                   let duration = session["duration"] as? Int {
                    total += duration
                }
            }
            return total
        }

        // Get weekly usage for the last 7 days
        AsyncFunction("getWeeklyUsage") { () -> [[String: Any]] in
            let sessions = self.loadSessions()
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd"
            formatter.locale = Locale(identifier: "en_US_POSIX")

            let calendar = Calendar.current
            let today = calendar.startOfDay(for: Date())

            var result: [[String: Any]] = []

            for i in stride(from: 6, through: 0, by: -1) {
                guard let date = calendar.date(byAdding: .day, value: -i, to: today) else { continue }
                let dateString = formatter.string(from: date)

                var totalDuration = 0
                var sessionCount = 0

                for session in sessions {
                    if let sessionDate = session["date"] as? String, sessionDate == dateString {
                        sessionCount += 1
                        if let duration = session["duration"] as? Int {
                            totalDuration += duration
                        }
                    }
                }

                result.append([
                    "date": dateString,
                    "totalDuration": totalDuration,
                    "sessionCount": sessionCount,
                ])
            }

            return result
        }

        // Get current month's total usage in milliseconds
        AsyncFunction("getMonthlyUsage") { () -> Int in
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM"
            formatter.locale = Locale(identifier: "en_US_POSIX")
            let currentMonth = formatter.string(from: Date())

            let sessions = self.loadSessions()
            var total = 0
            for session in sessions {
                if let date = session["date"] as? String, date.hasPrefix(currentMonth),
                   let duration = session["duration"] as? Int {
                    total += duration
                }
            }
            return total
        }

        // Clear all session and domain data
        AsyncFunction("clearAllData") { () in
            guard let defaults = UserDefaults(suiteName: self.appGroupId) else { return }
            defaults.removeObject(forKey: self.sessionsKey)
            defaults.removeObject(forKey: self.domainsKey)
        }

        // Set the list of domains to track
        AsyncFunction("setDomainList") { (domains: [String]) in
            guard let defaults = UserDefaults(suiteName: self.appGroupId) else { return }
            defaults.set(domains, forKey: self.domainsKey)
        }

        // Get the current list of tracked domains
        AsyncFunction("getDomainList") { () -> [String] in
            guard let defaults = UserDefaults(suiteName: self.appGroupId) else {
                return []
            }
            return defaults.stringArray(forKey: self.domainsKey) ?? []
        }
    }

    // MARK: - Helper Methods

    private func loadSessions() -> [[String: Any]] {
        guard let defaults = UserDefaults(suiteName: appGroupId),
              let stored = defaults.array(forKey: sessionsKey) as? [[String: Any]] else {
            return []
        }
        return stored
    }

    private func saveSessions(_ sessions: [[String: Any]]) {
        guard let defaults = UserDefaults(suiteName: appGroupId) else { return }
        defaults.set(sessions, forKey: sessionsKey)
    }

    private func todayDateString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        return formatter.string(from: Date())
    }
}
