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
  async pauseActivity(_activityId?: string) {
    return {
      success: false,
      message: 'Live Activities not supported on this platform',
      elapsedTime: 0
    };
  },
  async resumeActivity(_activityId?: string) {
    return {
      success: false,
      message: 'Live Activities not supported on this platform'
    };
  },
  async completeActivity(_activityId?: string) {
    return {
      success: false,
      message: 'Live Activities not supported on this platform',
      elapsedTime: 0
    };
  },
  async areActivitiesEnabled() {
    return false;
  }
};
