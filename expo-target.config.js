/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'widget',
  name: 'BabyTrackerActivity',
  frameworks: ['SwiftUI', 'ActivityKit', 'AppIntents', 'Foundation'],
  entitlements: {
    "aps-environment": "development"
  },
  deploymentTarget: '17.0',
};