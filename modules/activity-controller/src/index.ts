import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

type ActivityControllerModule = {
  isLiveActivityAvailable: () => boolean;
  startNursingActivity: (
    activityName: string,
    side: string,
    babyName?: string
  ) => Promise<string>;
  pauseActivity: (activityId?: string) => Promise<boolean>;
  resumeActivity: (activityId?: string) => Promise<boolean>;
  endActivity: (activityId?: string) => Promise<boolean>;
  getNursingStatus: () => Promise<NursingStatus>;
  addListener: (
    eventType: string,
    listener: (event: any) => void
  ) => Subscription;
};

let ActivityController: ActivityControllerModule | null = null;

if (Platform.OS === "ios") {
  ActivityController = requireNativeModule("ActivityControllerModule");
}

export type NursingState = "active" | "paused" | "finished";

export interface NursingActivityEvent {
  state: NursingState;
  elapsedTime: number;
  activityId: string;
  side: string;
  babyName?: string;
}

export interface NursingStatus {
  state: NursingState;
  activityId: string;
  elapsedTime: number;
  side: string;
  babyName?: string;
}

interface Subscription {
  remove: () => void;
}

export function isLiveActivityAvailable(): boolean {
  if (!ActivityController) return false;

  try {
    return ActivityController.isLiveActivityAvailable();
  } catch (error) {
    console.error(
      "[NursingLiveActivity] Error checking availability:",
      error
    );
    return false;
  }
}

export async function startNursingActivity(
  activityName: string,
  side: string,
  babyName?: string
): Promise<string> {
  if (!ActivityController) {
    console.warn("[NursingLiveActivity] Module not available.");
    return "";
  }
  try {
    return await ActivityController.startNursingActivity(
      activityName,
      side,
      babyName
    );
  } catch (error) {
    console.error("[NursingLiveActivity] Error starting activity:", error);
    return "";
  }
}

export async function pauseNursingActivity(
  activityId?: string
): Promise<boolean> {
  if (!ActivityController) return false;

  try {
    return await ActivityController.pauseActivity(activityId);
  } catch (error) {
    console.error("[NursingLiveActivity] Error pausing activity:", error);
    return false;
  }
}

export async function resumeNursingActivity(
  activityId?: string
): Promise<boolean> {
  if (!ActivityController) return false;

  try {
    return await ActivityController.resumeActivity(activityId);
  } catch (error) {
    console.error("[NursingLiveActivity] Error resuming activity:", error);
    return false;
  }
}

export async function endNursingActivity(
  activityId?: string
): Promise<boolean> {
  if (!ActivityController) return false;

  try {
    return await ActivityController.endActivity(activityId);
  } catch (error) {
    console.error("[NursingLiveActivity] Error ending activity:", error);
    return false;
  }
}

export async function getNursingStatus(): Promise<NursingStatus> {
  if (!ActivityController) {
    return {
      state: "finished",
      activityId: "",
      elapsedTime: 0,
      side: "",
    };
  }

  try {
    const status = await ActivityController.getNursingStatus();
    if (!["active", "paused", "finished"].includes(status.state)) {
      console.warn(
        `[NursingLiveActivity] Received unexpected state: ${status.state}`
      );
      status.state = "finished";
    }
    return status as NursingStatus;
  } catch (error) {
    console.error(
      "[NursingLiveActivity] Error getting nursing status:",
      error
    );
    return {
      state: "finished",
      activityId: "",
      elapsedTime: 0,
      side: "",
    };
  }
}

export function addListener(
  eventType:
    | "onNursingActivityUpdate"
    | "onNursingActivityEnd"
    | "onWidgetCompleteNursing",
  listener: (event: NursingActivityEvent) => void
): Subscription {
  if (!ActivityController) {
    return {
      remove: () => {},
    };
  }

  return ActivityController.addListener(eventType, listener);
}

export default {
  isLiveActivityAvailable,
  startNursingActivity,
  pauseNursingActivity,
  resumeNursingActivity,
  endNursingActivity,
  getNursingStatus,
  addListener,
};