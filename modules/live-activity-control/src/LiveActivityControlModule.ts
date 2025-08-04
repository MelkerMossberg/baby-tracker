import { requireNativeModule, NativeModulesProxy } from 'expo-modules-core';

export type LiveActivityResult = {
  success: boolean;
  message: string;
  activityId?: string;
  elapsedTime?: number;
};

export interface LiveActivityControlModule {
  startActivity(sideOrName: string, babyNameOrIcon?: string): Promise<LiveActivityResult>;
  endActivity(): Promise<LiveActivityResult>;
  updateActivity(side: string): Promise<LiveActivityResult>;
  pauseActivity(activityId?: string): Promise<LiveActivityResult>;
  resumeActivity(activityId?: string): Promise<LiveActivityResult>;
  completeActivity(activityId?: string): Promise<LiveActivityResult>;
  areActivitiesEnabled(): Promise<boolean>;
}

// Native implementation for iOS/Android
const LiveActivityNative = requireNativeModule<LiveActivityControlModule>('LiveActivityControl');

// Fallback implementation for unsupported platforms (e.g., web)
export default LiveActivityNative ?? {
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