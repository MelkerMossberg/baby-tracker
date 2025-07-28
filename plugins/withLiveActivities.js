const { withXcodeProject, withInfoPlist } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Add Live Activities support to iOS project
 */
function withLiveActivities(config) {
  // Add NSSupportsLiveActivities to Info.plist
  config = withInfoPlist(config, (config) => {
    config.modResults.NSSupportsLiveActivities = true;
    return config;
  });

  // Add Widget Extension target to Xcode project
  config = withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const projectName = config.modRequest.projectName || config.name;
    
    // Add widget extension target
    const target = xcodeProject.addTarget(
      'NursingLiveActivity',
      'app_extension',
      'NursingLiveActivity',
      `${config.ios?.bundleIdentifier || `com.yourcompany.${projectName}`}.NursingLiveActivity`
    );

    // Add build configurations
    xcodeProject.addBuildProperty('PRODUCT_NAME', '"NursingLiveActivity"', 'Debug', target.uuid);
    xcodeProject.addBuildProperty('PRODUCT_NAME', '"NursingLiveActivity"', 'Release', target.uuid);
    xcodeProject.addBuildProperty('PRODUCT_BUNDLE_IDENTIFIER', `${config.ios?.bundleIdentifier || `com.yourcompany.${projectName}`}.NursingLiveActivity`, 'Debug', target.uuid);
    xcodeProject.addBuildProperty('PRODUCT_BUNDLE_IDENTIFIER', `${config.ios?.bundleIdentifier || `com.yourcompany.${projectName}`}.NursingLiveActivity`, 'Release', target.uuid);
    xcodeProject.addBuildProperty('SWIFT_VERSION', '5.0', 'Debug', target.uuid);
    xcodeProject.addBuildProperty('SWIFT_VERSION', '5.0', 'Release', target.uuid);
    xcodeProject.addBuildProperty('TARGETED_DEVICE_FAMILY', '1,2', 'Debug', target.uuid);
    xcodeProject.addBuildProperty('TARGETED_DEVICE_FAMILY', '1,2', 'Release', target.uuid);
    xcodeProject.addBuildProperty('IPHONEOS_DEPLOYMENT_TARGET', '16.1', 'Debug', target.uuid);
    xcodeProject.addBuildProperty('IPHONEOS_DEPLOYMENT_TARGET', '16.1', 'Release', target.uuid);

    // Add widget framework
    xcodeProject.addFramework('WidgetKit.framework', { target: target.uuid, weak: true });
    xcodeProject.addFramework('SwiftUI.framework', { target: target.uuid, weak: true });

    return config;
  });

  return config;
}

module.exports = withLiveActivities;