import { NativeModulesProxy } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to a web-specific implementation
// and on native platforms to the native implementation.
export default NativeModulesProxy.LiveActivityControl ?? {
  async startActivity(side: string, babyName?: string) {
    return {
      success: false,
      message: 'Live Activities not supported on this platform'
    };
  },
  async endActivity() {
    return {
      success: false,
      message: 'Live Activities not supported on this platform'
    };
  },
  async updateActivity(side: string) {
    return {
      success: false,
      message: 'Live Activities not supported on this platform'
    };
  },
  async areActivitiesEnabled() {
    return false;
  }
};