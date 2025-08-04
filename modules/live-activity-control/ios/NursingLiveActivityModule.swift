import ExpoModulesCore
import ActivityKit
import Foundation

public class NursingLiveActivityModule: Module {
    private var currentActivity: Activity<NursingActivityAttributes>?
    private var currentActivityId: String?
    private var startedAt: Date?
    private var pausedAt: Date?
    
    public func definition() -> ModuleDefinition {
        Name("NursingLiveActivityModule")
        
        // Events to JavaScript
        Events("onLiveActivityUpdate", "onWidgetCompleteActivity", "sendTimerUpdateEvent")
        
        // Main functions exposed to JS
        AsyncFunction("startActivity") { (activityName: String, activityIcon: String) -> [String: Any] in
            return await self.startActivity(activityName: activityName, activityIcon: activityIcon)
        }
        
        AsyncFunction("pauseActivity") { (activityId: String?) -> [String: Any] in
            return await self.pauseActivity(activityId: activityId)
        }
        
        AsyncFunction("resumeActivity") { (activityId: String?) -> [String: Any] in
            return await self.resumeActivity(activityId: activityId)
        }
        
        AsyncFunction("completeActivity") { (activityId: String?) -> [String: Any] in
            return await self.completeActivity(activityId: activityId)
        }
        
        AsyncFunction("areActivitiesEnabled") { () -> Bool in
            return self.areActivitiesEnabled()
        }
        
        OnCreate {
            self.setupNotificationListeners()
        }
    }
    
    @available(iOS 16.1, *)
    private func startActivity(activityName: String, activityIcon: String) async -> [String: Any] {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            return [
                "success": false,
                "message": "Live Activities are not enabled"
            ]
        }
        
        // End any existing activity first
        await completeActivity(activityId: nil)
        
        let attributes = NursingActivityAttributes()
        let startTime = Date()
        self.startedAt = startTime
        self.pausedAt = nil
        self.currentActivityId = UUID().uuidString
        
        let contentState = NursingActivityAttributes.ContentState(
            activityName: activityName,
            activityIcon: activityIcon,
            startedAt: startTime,
            pausedAt: nil,
            babyName: nil // Can be enhanced later
        )
        
        do {
            let activity = try Activity<NursingActivityAttributes>.request(
                attributes: attributes,
                content: .init(state: contentState, staleDate: nil),
                pushType: .token
            )
            
            self.currentActivity = activity
            
            // Send update to JS
            sendEvent("onLiveActivityUpdate", [
                "state": "started",
                "elapsedTime": 0,
                "activityId": currentActivityId ?? ""
            ])
            
            return [
                "success": true,
                "message": "Live Activity started successfully",
                "activityId": currentActivityId ?? ""
            ]
        } catch {
            return [
                "success": false,
                "message": "Failed to start Live Activity: \(error.localizedDescription)"
            ]
        }
    }
    
    @available(iOS 16.1, *)
    private func pauseActivity(activityId: String?) async -> [String: Any] {
        guard let activity = currentActivity else {
            return [
                "success": false,
                "message": "No active Live Activity to pause"
            ]
        }
        
        let pauseTime = Date()
        self.pausedAt = pauseTime
        
        let updatedState = NursingActivityAttributes.ContentState(
            activityName: activity.content.state.activityName,
            activityIcon: activity.content.state.activityIcon,
            startedAt: activity.content.state.startedAt,
            pausedAt: pauseTime,
            babyName: activity.content.state.babyName
        )
        
        await activity.update(.init(state: updatedState, staleDate: nil))
        
        let elapsedTime = pauseTime.timeIntervalSince(activity.content.state.startedAt)
        
        // Send update to JS
        sendEvent("onLiveActivityUpdate", [
            "state": "paused",
            "elapsedTime": elapsedTime,
            "activityId": currentActivityId ?? ""
        ])
        
        return [
            "success": true,
            "message": "Live Activity paused successfully",
            "elapsedTime": elapsedTime
        ]
    }
    
    @available(iOS 16.1, *)
    private func resumeActivity(activityId: String?) async -> [String: Any] {
        guard let activity = currentActivity else {
            return [
                "success": false,
                "message": "No active Live Activity to resume"
            ]
        }
        
        guard let pausedTime = self.pausedAt else {
            return [
                "success": false,
                "message": "Activity is not paused"
            ]
        }
        
        // Calculate the time spent paused and adjust start time
        let pauseDuration = Date().timeIntervalSince(pausedTime)
        let adjustedStartTime = activity.content.state.startedAt.addingTimeInterval(pauseDuration)
        
        self.startedAt = adjustedStartTime
        self.pausedAt = nil
        
        let updatedState = NursingActivityAttributes.ContentState(
            activityName: activity.content.state.activityName,
            activityIcon: activity.content.state.activityIcon,
            startedAt: adjustedStartTime,
            pausedAt: nil,
            babyName: activity.content.state.babyName
        )
        
        await activity.update(.init(state: updatedState, staleDate: nil))
        
        // Send update to JS
        sendEvent("onLiveActivityUpdate", [
            "state": "resumed",
            "elapsedTime": activity.content.state.getElapsedTimeInSeconds(),
            "activityId": currentActivityId ?? ""
        ])
        
        return [
            "success": true,
            "message": "Live Activity resumed successfully"
        ]
    }
    
    @available(iOS 16.1, *)
    private func completeActivity(activityId: String?) async -> [String: Any] {
        guard let activity = currentActivity else {
            return [
                "success": true,
                "message": "No active Live Activity to complete"
            ]
        }
        
        let elapsedTime = activity.content.state.getElapsedTimeInSeconds()
        
        await activity.end(nil, dismissalPolicy: .immediate)
        currentActivity = nil
        currentActivityId = nil
        startedAt = nil
        pausedAt = nil
        
        // Send completion event to JS
        sendEvent("onWidgetCompleteActivity", [
            "activityId": activityId ?? "",
            "elapsedTime": elapsedTime
        ])
        
        return [
            "success": true,
            "message": "Live Activity completed successfully",
            "elapsedTime": elapsedTime
        ]
    }
    
    private func areActivitiesEnabled() -> Bool {
        if #available(iOS 16.1, *) {
            return ActivityAuthorizationInfo().areActivitiesEnabled
        } else {
            return false
        }
    }
    
    // Setup notification listeners for widget interactions
    private func setupNotificationListeners() {
        NotificationCenter.default.addObserver(
            forName: NSNotification.Name("pauseTimerFromWidget"),
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task {
                await self?.performPause()
            }
        }
        
        NotificationCenter.default.addObserver(
            forName: NSNotification.Name("resumeTimerFromWidget"),
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task {
                await self?.performResume()
            }
        }
        
        NotificationCenter.default.addObserver(
            forName: NSNotification.Name("completeActivityFromWidget"),
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task {
                await self?.performComplete()
            }
        }
    }
    
    @available(iOS 16.1, *)
    private func performPause() async {
        let _ = await pauseActivity(activityId: currentActivityId)
    }
    
    @available(iOS 16.1, *)
    private func performResume() async {
        let _ = await resumeActivity(activityId: currentActivityId)
    }
    
    @available(iOS 16.1, *)
    private func performComplete() async {
        let _ = await completeActivity(activityId: currentActivityId)
    }
    
    // Send timer update events periodically
    func sendTimerUpdateEvent() {
        guard let activity = currentActivity else { return }
        
        sendEvent("sendTimerUpdateEvent", [
            "elapsedTime": activity.content.state.getElapsedTimeInSeconds(),
            "isRunning": activity.content.state.isRunning(),
            "activityId": currentActivityId ?? ""
        ])
    }
}
