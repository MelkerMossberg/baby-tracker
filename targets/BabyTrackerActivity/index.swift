import ActivityKit
import WidgetKit
import SwiftUI

@main
struct BabyTrackerActivityBundle: WidgetBundle {
    var body: some Widget {
        BabyTrackerActivity()
    }
}

struct BabyTrackerActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: NursingActivityAttributes.self) { context in
            // Lock Screen Live Activity View
            LockScreenLiveActivityView(context: context)
        } dynamicIsland: { context in
            // Dynamic Island Integration
            DynamicIsland {
                // Expanded view
                DynamicIslandExpandedRegion(.leading) {
                    HStack {
                        Text(context.state.activityIcon)
                            .font(.title2)
                        VStack(alignment: .leading) {
                            Text(context.state.activityName)
                                .font(.headline)
                                .foregroundColor(.primary)
                            if let babyName = context.state.babyName {
                                Text(babyName)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                }
                
                DynamicIslandExpandedRegion(.trailing) {
                    VStack {
                        if context.state.isRunning() {
                            Text(timerInterval: context.state.startedAt...context.state.getFutureDate())
                                .font(.system(.title3, design: .monospaced))
                                .foregroundColor(.primary)
                        } else {
                            Text(context.state.getFormattedElapsedTime())
                                .font(.system(.title3, design: .monospaced))
                                .foregroundColor(.orange)
                        }
                    }
                }
                
                DynamicIslandExpandedRegion(.bottom) {
                    HStack(spacing: 16) {
                        if context.state.isRunning() {
                            // Pause button
                            Button(intent: PauseNursingIntent()) {
                                Image(systemName: "pause.circle.fill")
                                    .font(.title2)
                                    .foregroundColor(.orange)
                            }
                        } else {
                            // Resume button
                            Button(intent: ResumeNursingIntent()) {
                                Image(systemName: "play.circle.fill")
                                    .font(.title2)
                                    .foregroundColor(.green)
                            }
                            
                            // Complete button
                            Button(intent: CompleteNursingIntent()) {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.title2)
                                    .foregroundColor(.blue)
                            }
                        }
                    }
                }
            } compactLeading: {
                Text(context.state.activityIcon)
                    .font(.title3)
            } compactTrailing: {
                if context.state.isRunning() {
                    Text(timerInterval: context.state.startedAt...context.state.getFutureDate())
                        .font(.system(.caption, design: .monospaced))
                        .foregroundColor(.primary)
                } else {
                    Text("⏸")
                        .font(.caption)
                        .foregroundColor(.orange)
                }
            } minimal: {
                Text(context.state.activityIcon)
                    .font(.caption)
            }
        }
    }
}

struct LockScreenLiveActivityView: View {
    let context: ActivityViewContext<NursingActivityAttributes>
    
    var body: some View {
        HStack(spacing: 12) {
            // Left side: Breast icon + label + timer
            HStack(spacing: 8) {
                Text(context.state.activityIcon)
                    .font(.title2)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(context.state.activityName)
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    if context.state.isRunning() {
                        Text(timerInterval: context.state.startedAt...context.state.getFutureDate())
                            .font(.system(.subheadline, design: .monospaced))
                            .foregroundColor(.primary)
                    } else {
                        Text(context.state.getFormattedElapsedTime())
                            .font(.system(.subheadline, design: .monospaced))
                            .foregroundColor(.orange)
                    }
                    
                    if let babyName = context.state.babyName {
                        Text(babyName)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            Spacer()
            
            // Right side: Control buttons
            VStack(spacing: 8) {
                if context.state.isRunning() {
                    // Pause button
                    Button(intent: PauseNursingIntent()) {
                        VStack(spacing: 4) {
                            Image(systemName: "pause.circle.fill")
                                .font(.title2)
                                .foregroundColor(.orange)
                            Text("Pause")
                                .font(.caption2)
                                .foregroundColor(.orange)
                        }
                    }
                } else {
                    // Resume and Complete buttons when paused
                    HStack(spacing: 12) {
                        Button(intent: ResumeNursingIntent()) {
                            VStack(spacing: 4) {
                                Image(systemName: "play.circle.fill")
                                    .font(.title2)
                                    .foregroundColor(.green)
                                Text("Resume")
                                    .font(.caption2)
                                    .foregroundColor(.green)
                            }
                        }
                        
                        Button(intent: CompleteNursingIntent()) {
                            VStack(spacing: 4) {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.title2)
                                    .foregroundColor(.blue)
                                Text("Complete")
                                    .font(.caption2)
                                    .foregroundColor(.blue)
                            }
                        }
                    }
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
        )
    }
}