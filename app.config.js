export default {
  name: "baby-tracker",
  slug: "baby-tracker",
  version: "1.0.0",
  orientation: "portrait",
  sdkVersion: "53.0.0",
  icon: "./assets/adaptive-icon.png",
  scheme: "babytracker",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.melkermossberg.babytracker",
    appleTeamId: process.env.APPLE_TEAM_ID,
    infoPlist: {
      NSSupportsLiveActivities: true,
      NSSupportsLiveActivitiesFrequentUpdates: true,
      NSLiveActivityUsageDescription: 'Shows nursing session timers on the Lock Screen.',
      ITSAppUsesNonExemptEncryption: false
    },
    entitlements: {
      "aps-environment": "development"
    }
  },
  android: {
    package: "com.melkermossberg.babytracker",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    }
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
      "eas": {
        "projectId": "04356d21-4584-4652-a27e-1955c7d8cb9f"
      }
  },
  plugins: [
    "@bacons/apple-targets"
  ]
};