import ActivityKit
import Foundation

public struct NursingActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        let side: String
        let babyName: String?
        let startTime: Date
        let isActive: Bool
    }
}