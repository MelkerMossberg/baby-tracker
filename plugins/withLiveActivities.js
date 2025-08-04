const { withInfoPlist } = require('@expo/config-plugins');

/**
 * Add Live Activities support to iOS project
 * Using Expo Modules API instead of manual Xcode project manipulation
 */
function withLiveActivities(config) {
  // Add NSSupportsLiveActivities to Info.plist
  config = withInfoPlist(config, (config) => {
    config.modResults.NSSupportsLiveActivities = true;
    // Add minimum iOS version for Live Activities
    config.modResults.CFBundleInfoDictionaryVersion = "16.1";
    return config;
  });

  return config;
}

module.exports = withLiveActivities;