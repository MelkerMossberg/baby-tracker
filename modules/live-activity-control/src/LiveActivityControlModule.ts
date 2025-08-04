import { requireNativeModule } from 'expo-modules-core';

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

export default requireNativeModule<LiveActivityControlModule>('LiveActivityControl');

