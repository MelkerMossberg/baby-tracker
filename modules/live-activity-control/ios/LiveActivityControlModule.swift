import ExpoModulesCore
import ActivityKit
import Foundation

public class LiveActivityControlModule: Module {
    private var nursingModule = NursingLiveActivityModule()
    
    public func definition() -> ModuleDefinition {
        Name("LiveActivityControl")

        // Legacy compatibility functions - delegate to new module
        AsyncFunction("startActivity") { (side: String, babyName: String?) -> [String: Any] in
            let activityName = side.capitalized + " Nursing"
            let activityIcon = "🍼"
            return await self.nursingModule.startActivity(activityName: activityName, activityIcon: activityIcon)
        }

        AsyncFunction("endActivity") { () -> [String: Any] in
            return await self.nursingModule.completeActivity(activityId: nil)
        }

        AsyncFunction("updateActivity") { (side: String) -> [String: Any] in
            // For legacy compatibility, treat as restart with new side
            let activityName = side.capitalized + " Nursing"
            let activityIcon = "🍼"
            return await self.nursingModule.startActivity(activityName: activityName, activityIcon: activityIcon)
        }

        AsyncFunction("areActivitiesEnabled") { () -> Bool in
            return self.nursingModule.areActivitiesEnabled()
        }
        
        // Expose new enhanced functions
        AsyncFunction("pauseActivity") { (activityId: String?) -> [String: Any] in
            return await self.nursingModule.pauseActivity(activityId: activityId)
        }
        
        AsyncFunction("resumeActivity") { (activityId: String?) -> [String: Any] in
            return await self.nursingModule.resumeActivity(activityId: activityId)
        }
        
        AsyncFunction("completeActivity") { (activityId: String?) -> [String: Any] in
            return await self.nursingModule.completeActivity(activityId: activityId)
        }
    }
}

