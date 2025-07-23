/**
 * Live Activity Service for iOS
 * Handles Live Activity integration for nursing sessions
 */

import { NativeModules, Platform } from 'react-native';

interface LiveActivityModule {
  startNursingLiveActivity(side: string, babyName?: string): Promise<{ success: boolean; message: string }>;
  stopNursingLiveActivity(): Promise<{ success: boolean; message: string }>;
  updateNursingSide(side: string): Promise<{ success: boolean; message: string }>;
  isLiveActivityActive(): Promise<{ isActive: boolean }>;
  checkLiveActivitySupport(): Promise<{
    isSupported: boolean;
    areActivitiesEnabled: boolean;
    frequentPushesEnabled: boolean;
  }>;
}

const { RNNursingLiveActivity } = NativeModules as { RNNursingLiveActivity: LiveActivityModule };

class LiveActivityService {
  private isSupported: boolean = false;
  private isEnabled: boolean = false;

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
      const support = await RNNursingLiveActivity.checkLiveActivitySupport();
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
    if (!this.isSupported || !RNNursingLiveActivity) {
      return false;
    }

    try {
      const result = await RNNursingLiveActivity.startNursingLiveActivity(side, babyName);
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
    if (!this.isSupported || !RNNursingLiveActivity) {
      return false;
    }

    try {
      const result = await RNNursingLiveActivity.stopNursingLiveActivity();
      return result.success;
    } catch (error) {
      console.error('Failed to stop nursing Live Activity:', error);
      return false;
    }
  }

  /**
   * Update the nursing side in the Live Activity
   */
  async updateNursingSide(side: 'left' | 'right'): Promise<boolean> {
    if (!this.isSupported || !RNNursingLiveActivity) {
      return false;
    }

    try {
      const result = await RNNursingLiveActivity.updateNursingSide(side);
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
    if (!this.isSupported || !RNNursingLiveActivity) {
      return false;
    }

    try {
      const result = await RNNursingLiveActivity.isLiveActivityActive();
      return result.isActive;
    } catch (error) {
      console.error('❌ Failed to check Live Activity status:', error);
      return false;
    }
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