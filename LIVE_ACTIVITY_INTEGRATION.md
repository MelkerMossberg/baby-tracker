# iOS Live Activity Integration Guide

This guide provides step-by-step instructions for integrating iOS Live Activities into your React Native Baby Tracker app.

## Overview

The Live Activity implementation includes:
- **Lock Screen display** with nursing timer and side information
- **Dynamic Island** integration (compact, expanded, minimal views)
- **React Native bridge** for JavaScript integration
- **Live timer updates** with hours, minutes, and seconds
- **Stop button** functionality from Live Activity

## Installation Steps

### 1. Update iOS Deployment Target

Ensure your iOS deployment target is iOS 16.1+ in your `ios/Podfile`:

```ruby
platform :ios, '16.1'
```

### 2. Add ActivityKit Framework

In Xcode, select your main app target:
1. Go to **Build Phases** → **Link Binary With Libraries**
2. Add `ActivityKit.framework`
3. Set it to **Optional** for backward compatibility

### 3. Create Widget Extension

1. In Xcode, go to **File** → **New** → **Target**
2. Choose **Widget Extension**
3. Name it `NursingLiveActivityWidget`
4. **DO NOT** activate the scheme when prompted
5. Select your main app as the containing app

### 4. Add Files to Project

Copy the following files to your Xcode project:

#### Widget Extension Files (Target: NursingLiveActivityWidget)
- `ios/NursingLiveActivity/NursingActivityAttributes.swift`
- `ios/NursingLiveActivity/NursingLiveActivityWidget.swift`
- `ios/NursingLiveActivity/NursingLiveActivityManager.swift`
- `ios/NursingLiveActivityWidget.intentdefinition`

#### Main App Files (Target: YourMainApp)
- `ios/RNNursingLiveActivity.swift`
- `ios/RNNursingLiveActivity.m`
- `ios/NursingLiveActivity/NursingLiveActivityManager.swift` (also add to main target)

### 5. Update Info.plist

Add the following entries to your main app's `Info.plist`:

```xml
<key>NSSupportsLiveActivities</key>
<true/>
<key>NSSupportsLiveActivitiesFrequentUpdates</key>
<true/>
<key>NSLiveActivityUsageDescription</key>
<string>This app uses Live Activities to show your nursing session progress on the Lock Screen and in the Dynamic Island.</string>
```

### 6. Add Nursing Icon

Add your nursing icon to both targets:
1. Create `nursing_icon.png` (and @2x, @3x variants)
2. Add to both main app and widget extension targets
3. Update the image name in `NursingLiveActivityWidget.swift` if different

### 7. Configure Widget Extension Info.plist

In your Widget Extension's Info.plist, ensure these keys exist:

```xml
<key>NSExtension</key>
<dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
</dict>
```

### 8. Build Configuration

1. Set the Widget Extension deployment target to iOS 16.1+
2. Ensure both targets use the same bundle identifier prefix:
   - Main app: `com.yourcompany.babytracker`
   - Widget: `com.yourcompany.babytracker.NursingLiveActivityWidget`

## React Native Integration

### 1. Install the Service

The Live Activity service is already created at:
```
services/liveActivityService.ts
```

### 2. Update Your Nursing Functions

Modify your nursing session handlers in `app/index.tsx`:

```typescript
import { liveActivityService } from '../services/liveActivityService';

// In handleBreastSelection
const handleBreastSelection = async (side: NursingSide) => {
  try {
    // ... existing code ...
    
    await eventTracker.startNursingSession(currentBaby.id, side);
    
    // Start Live Activity
    await liveActivityService.startNursingActivity(side, currentBaby.name);
    
    // ... rest of existing code ...
  } catch (error) {
    // ... error handling ...
  }
};

// In handleNursingSave
const handleNursingSave = async (side: NursingSide, notes: string, durationSeconds: number) => {
  try {
    // ... existing nursing stop code ...
    
    // Stop Live Activity
    await liveActivityService.stopNursingActivity();
    
    // ... rest of existing code ...
  } catch (error) {
    // ... error handling ...
  }
};

// In handleSwitchNursingSide
const handleSwitchNursingSide = (newSide: NursingSide) => {
  try {
    eventTracker.switchNursingSide(newSide);
    setCurrentNursingSide(newSide);
    
    // Update Live Activity
    liveActivityService.updateNursingSide(newSide);
    
    // ... rest of existing code ...
  } catch (error) {
    // ... error handling ...
  }
};
```

### 3. Handle App State Changes

Add this to your main app component to handle Live Activity cleanup:

```typescript
import { AppState } from 'react-native';
import { liveActivityService } from '../services/liveActivityService';

useEffect(() => {
  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'background') {
      // App is going to background - Live Activity will continue
      console.log('App backgrounded - Live Activity continues');
    } else if (nextAppState === 'active') {
      // App is back in foreground - sync with Live Activity
      syncWithLiveActivity();
    }
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);
  return () => subscription?.remove();
}, []);

const syncWithLiveActivity = async () => {
  try {
    const isLiveActivityActive = await liveActivityService.isActivityActive();
    const isAppSessionActive = eventTracker.isNursingInProgress();
    
    // Sync states if they don't match
    if (isLiveActivityActive && !isAppSessionActive) {
      // Live Activity is active but app session isn't - this could happen
      // if the Live Activity was stopped from the widget
      console.log('Live Activity stopped externally');
    }
  } catch (error) {
    console.error('Failed to sync with Live Activity:', error);
  }
};
```

## Testing

### 1. Device Requirements
- **Physical device** with iOS 16.1+
- **iPhone 14 Pro/Pro Max** for Dynamic Island testing
- Live Activities don't work in Simulator for Dynamic Island

### 2. Enable Live Activities
1. Go to **Settings** → **Your App**
2. Enable **Live Activities**
3. Enable **Allow Notifications** (if needed)

### 3. Test Scenarios
1. **Start nursing** - Live Activity appears on Lock Screen
2. **Switch sides** - Live Activity updates
3. **Lock device** - Timer continues on Lock Screen
4. **Background app** - Live Activity persists
5. **Stop nursing** - Live Activity disappears
6. **Force quit app** - Live Activity should remain until stopped

## Troubleshooting

### Common Issues

1. **"Live Activities not supported"**
   - Ensure iOS deployment target is 16.1+
   - Check that ActivityKit framework is linked
   - Verify device iOS version

2. **Live Activity doesn't appear**
   - Check Live Activities are enabled in Settings
   - Verify Info.plist entries are correct
   - Check Xcode console for errors

3. **Timer doesn't update**
   - Ensure Widget Extension has proper permissions
   - Check that Timer publisher is correctly configured

4. **Stop button doesn't work**
   - Verify App Intent configuration
   - Check that intent definition file is included

### Debug Tips

1. Use Xcode console to see Live Activity logs
2. Test on physical device (required for Live Activities)
3. Check iOS Settings → Your App → Live Activities
4. Verify bundle identifiers match expected pattern

## Performance Notes

- Live Activities update every second for timer display
- They automatically end after 1 hour of inactivity (configurable)
- The system may throttle updates under low battery conditions
- Live Activities use minimal system resources when properly implemented

## Privacy & Permissions

- Live Activities don't require explicit user permission
- Users control them via iOS Settings → [App] → Live Activities
- Respect user privacy - only show essential information
- Activities are automatically cleaned up by the system

## Future Enhancements

Possible additions:
1. **Push notifications** to update Live Activity from server
2. **Multiple babies** support in Live Activity
3. **Pause/resume** functionality
4. **Historical data** in expanded view
5. **Custom complications** for Apple Watch