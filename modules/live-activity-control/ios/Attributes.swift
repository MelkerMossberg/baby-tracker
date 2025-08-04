import ActivityKit
import Foundation

public struct NursingActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var activityName: String
        public var activityIcon: String
        public var startedAt: Date
        public var pausedAt: Date?
        public var babyName: String?

        public init(activityName: String, activityIcon: String, startedAt: Date, pausedAt: Date?, babyName: String?) {
            self.activityName = activityName
            self.activityIcon = activityIcon
            self.startedAt = startedAt
            self.pausedAt = pausedAt
            self.babyName = babyName
        }

        public func getElapsedTimeInSeconds() -> Double {
            let endDate = pausedAt ?? Date()
            return endDate.timeIntervalSince(startedAt)
        }

        public func isRunning() -> Bool {
            return pausedAt == nil
        }
    }
}
