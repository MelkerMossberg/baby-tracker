import AppIntents
import Foundation

@available(iOS 16.0, *)
struct PauseNursingIntent: AppIntent {
    static var title: LocalizedStringResource = "Pause Nursing"
    static var description = IntentDescription("Pause the nursing timer")
    
    func perform() async throws -> some IntentResult {
        NotificationCenter.default.post(name: NSNotification.Name("pauseTimerFromWidget"), object: nil)
        return .result()
    }
}

@available(iOS 16.0, *)
struct ResumeNursingIntent: AppIntent {
    static var title: LocalizedStringResource = "Resume Nursing"
    static var description = IntentDescription("Resume the nursing timer")
    
    func perform() async throws -> some IntentResult {
        NotificationCenter.default.post(name: NSNotification.Name("resumeTimerFromWidget"), object: nil)
        return .result()
    }
}

@available(iOS 16.0, *)
struct CompleteNursingIntent: AppIntent {
    static var title: LocalizedStringResource = "Complete Nursing"
    static var description = IntentDescription("Complete the nursing session")
    
    func perform() async throws -> some IntentResult {
        NotificationCenter.default.post(name: NSNotification.Name("completeActivityFromWidget"), object: nil)
        return .result()
    }
}