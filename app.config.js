export default {
  name: "baby-tracker",
  slug: "baby-tracker",
  version: "1.0.0",
  orientation: "portrait",
  sdkVersion: "53.0.0",
  //icon: "./assets/icon.png", // adjust if you don't have one yet
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
    infoPlist: {
      NSSupportsLiveActivities: true
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
  plugins: [
    "./plugins/withLiveActivities.js"
  ]
};