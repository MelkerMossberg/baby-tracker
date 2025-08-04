/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'widget',
  name: 'BabyTrackerActivity',
  frameworks: ['SwiftUI', 'ActivityKit', 'Foundation'],
  entitlements: {
    "aps-environment": "development"
  },
};