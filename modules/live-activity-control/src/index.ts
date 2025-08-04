import { EventEmitter } from 'expo-modules-core';
import LiveActivityControlModule from './LiveActivityControlModule';

const emitter = new EventEmitter<any>(LiveActivityControlModule as any);

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

export function addLiveActivityUpdateListener(listener: (event: any) => void) {
  return emitter.addListener('onLiveActivityUpdate', listener);
}

export function addWidgetCompleteActivityListener(listener: (event: any) => void) {
  return emitter.addListener('onWidgetCompleteActivity', listener);
}

export function addTimerUpdateListener(listener: (event: any) => void) {
  return emitter.addListener('sendTimerUpdateEvent', listener);
}

