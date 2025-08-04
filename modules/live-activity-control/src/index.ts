import LiveActivityControlModule from './LiveActivityControlModule';

// Legacy compatibility functions
export async function startActivity(side: 'left' | 'right', babyName?: string): Promise<{
  success: boolean;
  message: string;
  activityId?: string;
}> {
  return await LiveActivityControlModule.startActivity(side, babyName);
}

export async function endActivity(): Promise<{
  success: boolean;
  message: string;
  elapsedTime?: number;
}> {
  return await LiveActivityControlModule.endActivity();
}

export async function updateActivity(side: 'left' | 'right'): Promise<{
  success: boolean;
  message: string;
}> {
  return await LiveActivityControlModule.updateActivity(side);
}

export async function areActivitiesEnabled(): Promise<boolean> {
  return await LiveActivityControlModule.areActivitiesEnabled();
}

// Enhanced functions with pause/resume support
export async function startNursingActivity(activityName: string, activityIcon: string): Promise<{
  success: boolean;
  message: string;
  activityId?: string;
}> {
  return await LiveActivityControlModule.startActivity(activityName, activityIcon);
}

export async function pauseActivity(activityId?: string): Promise<{
  success: boolean;
  message: string;
  elapsedTime?: number;
}> {
  return await LiveActivityControlModule.pauseActivity(activityId);
}

export async function resumeActivity(activityId?: string): Promise<{
  success: boolean;
  message: string;
}> {
  return await LiveActivityControlModule.resumeActivity(activityId);
}

export async function completeActivity(activityId?: string): Promise<{
  success: boolean;
  message: string;
  elapsedTime?: number;
}> {
  return await LiveActivityControlModule.completeActivity(activityId);
}

export { LiveActivityControlModule };

