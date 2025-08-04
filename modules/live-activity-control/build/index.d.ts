import LiveActivityControlModule from './LiveActivityControlModule';
export declare function startActivity(side: 'left' | 'right', babyName?: string): Promise<{
    success: boolean;
    message: string;
    activityId?: string;
}>;
export declare function endActivity(): Promise<{
    success: boolean;
    message: string;
    elapsedTime?: number;
}>;
export declare function updateActivity(side: 'left' | 'right'): Promise<{
    success: boolean;
    message: string;
}>;
export declare function areActivitiesEnabled(): Promise<boolean>;
export declare function startNursingActivity(activityName: string, activityIcon: string): Promise<{
    success: boolean;
    message: string;
    activityId?: string;
}>;
export declare function pauseActivity(activityId?: string): Promise<{
    success: boolean;
    message: string;
    elapsedTime?: number;
}>;
export declare function resumeActivity(activityId?: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function completeActivity(activityId?: string): Promise<{
    success: boolean;
    message: string;
    elapsedTime?: number;
}>;
export { LiveActivityControlModule };
