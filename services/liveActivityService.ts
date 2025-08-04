/**
 * Enhanced Live Activity Service for iOS
 * Handles Live Activity integration for nursing sessions with pause/resume functionality
 */

import { Platform } from 'react-native';

// Conditionally import LiveActivityControl only on iOS
let LiveActivityControl: any = null;
if (Platform.OS === 'ios') {
  try {
    LiveActivityControl = require('live-activity-control');
    console.log('✅ [LiveActivityService] Module loaded successfully:', !!LiveActivityControl);
    console.log('✅ [LiveActivityService] Available functions:', Object.keys(LiveActivityControl || {}));
  } catch (error) {
    console.warn('❌ [LiveActivityService] Module not available:', error);
  }
} else {
  console.log('ℹ️ [LiveActivityService] Not iOS, skipping module load');
}

interface LiveActivityModule {
  startNursingLiveActivity(side: string, babyName?: string): Promise<{ 
    success: boolean; 
    message: string; 
    activityId?: string; 
  }>;
  stopNursingLiveActivity(): Promise<{ 
    success: boolean; 
    message: string; 
    elapsedTime?: number; 
  }>;
  pauseNursingLiveActivity(): Promise<{ 
    success: boolean; 
    message: string; 
    elapsedTime?: number; 
  }>;
  resumeNursingLiveActivity(): Promise<{ 
    success: boolean; 
    message: string; 
  }>;
  updateNursingSide(side: string): Promise<{ success: boolean; message: string }>;
  isLiveActivityActive(): Promise<{ isActive: boolean }>;
  checkLiveActivitySupport(): Promise<{
    isSupported: boolean;
    areActivitiesEnabled: boolean;
    frequentPushesEnabled: boolean;
  }>;
}

// Enhanced Live Activity implementation using custom Expo module
const LiveActivityModule: LiveActivityModule = {
  async startNursingLiveActivity(side: string, babyName?: string) {
    console.log('🚀 [LiveActivityService] Starting Live Activity with enhanced module');
    
    if (Platform.OS !== 'ios') {
      return { success: false, message: 'Live Activities only supported on iOS' };
    }

    try {
      console.log('📱 [LiveActivityService] Starting activity with:', { side, babyName });

      const activityName = `${side.charAt(0).toUpperCase() + side.slice(1)} Nursing`;
      const activityIcon = side === 'left' ? '👈🍼' : side === 'right' ? '👉🍼' : '🍼';
      
      if (!LiveActivityControl) {
        console.error('❌ [LiveActivityService] LiveActivityControl is null/undefined');
        throw new Error('LiveActivityControl module not available');
      }
      
      console.log('🔍 [LiveActivityService] Calling startNursingActivity with:', { activityName, activityIcon });
      const result = await LiveActivityControl.startNursingActivity(activityName, activityIcon);
      console.log('🔍 [LiveActivityService] Raw result from native module:', result);
      
      console.log('✅ [LiveActivityService] Live Activity result:', result);

      return {
        success: result.success,
        message: result.success 
          ? `Live Activity started for ${side} side${babyName ? ` (${babyName})` : ''}`
          : result.message,
        activityId: result.activityId
      };
    } catch (error) {
      console.error('❌ [LiveActivityService] Failed to start Live Activity:', error);
      return {
        success: false,
        message: `Failed to start Live Activity: ${error}`
      };
    }
  },

  async stopNursingLiveActivity() {
    console.log('🛑 [LiveActivityService] Completing Live Activity');

    try {
      if (!LiveActivityControl) {
        throw new Error('LiveActivityControl module not available');
      }
      
      const result = await LiveActivityControl.completeActivity();
      
      console.log('✅ [LiveActivityService] Complete result:', result);
      
      return {
        success: result.success,
        message: result.message,
        elapsedTime: result.elapsedTime
      };
    } catch (error) {
      console.error('❌ [LiveActivityService] Failed to complete Live Activity:', error);
      return {
        success: false,
        message: `Failed to complete Live Activity: ${error}`
      };
    }
  },

  async pauseNursingLiveActivity() {
    console.log('⏸️ [LiveActivityService] Pausing Live Activity');

    try {
      if (!LiveActivityControl) {
        throw new Error('LiveActivityControl module not available');
      }
      
      const result = await LiveActivityControl.pauseActivity();
      
      console.log('✅ [LiveActivityService] Pause result:', result);
      
      return {
        success: result.success,
        message: result.message,
        elapsedTime: result.elapsedTime
      };
    } catch (error) {
      console.error('❌ [LiveActivityService] Failed to pause Live Activity:', error);
      return {
        success: false,
        message: `Failed to pause Live Activity: ${error}`
      };
    }
  },

  async resumeNursingLiveActivity() {
    console.log('▶️ [LiveActivityService] Resuming Live Activity');

    try {
      if (!LiveActivityControl) {
        throw new Error('LiveActivityControl module not available');
      }
      
      const result = await LiveActivityControl.resumeActivity();
      
      console.log('✅ [LiveActivityService] Resume result:', result);
      
      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error('❌ [LiveActivityService] Failed to resume Live Activity:', error);
      return {
        success: false,
        message: `Failed to resume Live Activity: ${error}`
      };
    }
  },

  async updateNursingSide(side: string) {
    console.log('🔄 [LiveActivityService] Updating Live Activity side to:', side);

    try {
      if (!LiveActivityControl) {
        throw new Error('LiveActivityControl module not available');
      }
      
      const result = await LiveActivityControl.updateActivity(side as 'left' | 'right');
      
      console.log('✅ [LiveActivityService] Update result:', result);
      
      return {
        success: result.success,
        message: result.success 
          ? `Live Activity updated to ${side} side` 
          : result.message
      };
    } catch (error) {
      console.error('❌ [LiveActivityService] Failed to update Live Activity:', error);
      return {
        success: false,
        message: `Failed to update Live Activity: ${error}`
      };
    }
  },

  async isLiveActivityActive() {
    try {
      // For now, just return false since we don't track state in the module
      return { isActive: false };
    } catch (error) {
      console.error('❌ [LiveActivityService] Failed to check activity status:', error);
      return { isActive: false };
    }
  },

  async checkLiveActivitySupport() {
    try {
      if (!LiveActivityControl) {
        return {
          isSupported: false,
          areActivitiesEnabled: false,
          frequentPushesEnabled: false
        };
      }

      const areActivitiesEnabled = await LiveActivityControl.areActivitiesEnabled();
      
      const support = {
        isSupported: Platform.OS === 'ios',
        areActivitiesEnabled,
        frequentPushesEnabled: true // We now support frequent updates
      };

      console.log('📊 [LiveActivityService] Live Activities support:', support);
      
      return support;
    } catch (error) {
      console.error('❌ [LiveActivityService] Failed to check support:', error);
      return {
        isSupported: false,
        areActivitiesEnabled: false,
        frequentPushesEnabled: false
      };
    }
  }
};

class LiveActivityService {
  private isSupported: boolean = false;
  private isEnabled: boolean = false;
  private currentActivityId: string | null = null;

  constructor() {
    this.checkSupport();
  }

  /**
   * Check if Live Activities are supported and enabled
   */
  async checkSupport(): Promise<void> {
    if (Platform.OS !== 'ios') {
      this.isSupported = false;
      return;
    }

    try {
      const support = await LiveActivityModule.checkLiveActivitySupport();
      this.isSupported = support.isSupported;
      this.isEnabled = support.areActivitiesEnabled;
      
    } catch (error) {
      this.isSupported = false;
      this.isEnabled = false;
    }
  }

  /**
   * Start a nursing Live Activity
   */
  async startNursingActivity(side: 'left' | 'right', babyName?: string): Promise<boolean> {
    if (!this.isSupported || !LiveActivityModule) {
      return false;
    }

    try {
      const result = await LiveActivityModule.startNursingLiveActivity(side, babyName);
      if (result.success && result.activityId) {
        this.currentActivityId = result.activityId;
      }
      return result.success;
    } catch (error) {
      console.error('Failed to start nursing Live Activity:', error);
      return false;
    }
  }

  /**
   * Stop the current nursing Live Activity
   */
  async stopNursingActivity(): Promise<boolean> {
    if (!this.isSupported || !LiveActivityModule) {
      return false;
    }

    try {
      const result = await LiveActivityModule.stopNursingLiveActivity();
      if (result.success) {
        this.currentActivityId = null;
      }
      return result.success;
    } catch (error) {
      console.error('Failed to stop nursing Live Activity:', error);
      return false;
    }
  }

  /**
   * Pause the current nursing Live Activity
   */
  async pauseNursingActivity(): Promise<{ success: boolean; elapsedTime?: number }> {
    if (!this.isSupported || !LiveActivityModule) {
      return { success: false };
    }

    try {
      const result = await LiveActivityModule.pauseNursingLiveActivity();
      return {
        success: result.success,
        elapsedTime: result.elapsedTime
      };
    } catch (error) {
      console.error('Failed to pause nursing Live Activity:', error);
      return { success: false };
    }
  }

  /**
   * Resume the current nursing Live Activity
   */
  async resumeNursingActivity(): Promise<boolean> {
    if (!this.isSupported || !LiveActivityModule) {
      return false;
    }

    try {
      const result = await LiveActivityModule.resumeNursingLiveActivity();
      return result.success;
    } catch (error) {
      console.error('Failed to resume nursing Live Activity:', error);
      return false;
    }
  }

  /**
   * Update the nursing side in the Live Activity
   */
  async updateNursingSide(side: 'left' | 'right'): Promise<boolean> {
    if (!this.isSupported || !LiveActivityModule) {
      return false;
    }

    try {
      const result = await LiveActivityModule.updateNursingSide(side);
      return result.success;
    } catch (error) {
      console.error('Failed to update nursing side:', error);
      return false;
    }
  }

  /**
   * Check if there's an active nursing Live Activity
   */
  async isActivityActive(): Promise<boolean> {
    if (!this.isSupported || !LiveActivityModule) {
      return false;
    }

    try {
      const result = await LiveActivityModule.isLiveActivityActive();
      return result.isActive;
    } catch (error) {
      console.error('❌ Failed to check Live Activity status:', error);
      return false;
    }
  }

  /**
   * Get the current activity ID
   */
  getCurrentActivityId(): string | null {
    return this.currentActivityId;
  }

  /**
   * Get Live Activity support status
   */
  getSupport(): { isSupported: boolean; isEnabled: boolean } {
    return {
      isSupported: this.isSupported,
      isEnabled: this.isEnabled
    };
  }

  /**
   * Request permission for Live Activities (iOS 16.1+)
   */
  async requestPermission(): Promise<boolean> {
    // Note: Live Activities don't require explicit permission request
    // They're controlled by user settings in iOS Settings > [App] > Live Activities
    await this.checkSupport();
    return this.isEnabled;
  }
}

export const liveActivityService = new LiveActivityService();