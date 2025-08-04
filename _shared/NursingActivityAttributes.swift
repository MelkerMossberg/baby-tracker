import ActivityKit
import Foundation

public struct NursingActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var activityName: String
        public var activityIcon: String
        public var startedAt: Date
        public var pausedAt: Date?
        public var babyName: String?
        
        public init(activityName: String, activityIcon: String, startedAt: Date, pausedAt: Date? = nil, babyName: String? = nil) {
            self.activityName = activityName
            self.activityIcon = activityIcon
            self.startedAt = startedAt
            self.pausedAt = pausedAt
            self.babyName = babyName
        }
        
        // Get elapsed time in seconds
        public func getElapsedTimeInSeconds() -> TimeInterval {
            let endTime = pausedAt ?? Date()
            return endTime.timeIntervalSince(startedAt)
        }
        
        // Get formatted elapsed time (e.g., "5m 30s")
        public func getFormattedElapsedTime() -> String {
            let elapsed = getElapsedTimeInSeconds()
            let hours = Int(elapsed) / 3600
            let minutes = Int(elapsed) % 3600 / 60
            let seconds = Int(elapsed) % 60
            
            if hours > 0 {
                return String(format: "%dh %dm", hours, minutes)
            } else if minutes > 0 {
                return String(format: "%dm %ds", minutes, seconds)
            } else {
                return String(format: "%ds", seconds)
            }
        }
        
        // Get future date for timer display (current time + elapsed time)
        public func getFutureDate() -> Date {
            return Date().addingTimeInterval(getElapsedTimeInSeconds())
        }
        
        // Check if the activity is currently running (not paused)
        public func isRunning() -> Bool {
            return pausedAt == nil
        }
    }

    public init() {}
}