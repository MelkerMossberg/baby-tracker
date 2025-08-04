import ActivityKit
import WidgetKit
import SwiftUI

@main
struct LiveActivityBundle: WidgetBundle {
    var body: some Widget {
        LiveActivity()
    }
}

struct LiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: NursingActivityAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("🍼 Nursing")
                        .font(.headline)
                        .foregroundColor(.primary)
                    Spacer()
                    Text(context.state.side.capitalized)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.blue.opacity(0.2))
                        .cornerRadius(8)
                }
                
                if let babyName = context.state.babyName {
                    Text("For \(babyName)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    Text("Started:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(context.state.startTime, style: .time)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
        } dynamicIsland: { context in
            // Dynamic Island UI goes here
            DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    HStack {
                        Text("🍼")
                        Text("Nursing")
                            .font(.headline)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.side.capitalized)
                        .font(.subheadline)
                        .foregroundColor(.blue)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        if let babyName = context.state.babyName {
                            Text(babyName)
                                .font(.caption)
                        }
                        Spacer()
                        Text(context.state.startTime, style: .timer)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.horizontal)
                }
            } compactLeading: {
                Text("🍼")
            } compactTrailing: {
                Text(context.state.side.prefix(1).uppercased())
                    .font(.caption2)
                    .foregroundColor(.blue)
            } minimal: {
                Text("🍼")
            }
        }
    }
}