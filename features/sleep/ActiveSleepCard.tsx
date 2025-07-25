import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ActiveSleepCardProps {
  startTime: Date;
  elapsedTime: string;
  onStop: () => void;
  onAdjustStartTime: () => void;
  wakeTimerSetFor?: Date;
  wakeTimerTriggered?: boolean;
  onSetWakeTimer: () => void;
  onCancelWakeTimer: () => void;
  babyName?: string;
}

export default function ActiveSleepCard({ 
  startTime, 
  elapsedTime, 
  onStop, 
  onAdjustStartTime, 
  wakeTimerSetFor, 
  wakeTimerTriggered, 
  onSetWakeTimer, 
  onCancelWakeTimer, 
  babyName 
}: ActiveSleepCardProps) {

  const getWakeTimerCountdown = (): string => {
    if (!wakeTimerSetFor) return '';
    
    const now = new Date();
    const diffMs = wakeTimerSetFor.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Time to wake up!';
    
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const isWakeTimeReached = (): boolean => {
    if (!wakeTimerSetFor) return false;
    return new Date().getTime() >= wakeTimerSetFor.getTime();
  };

  return (
    <View className="mb-4 rounded-2xl p-4 shadow-lg bg-card-main">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-text-main text-lg font-serif" style={{ fontFamily: 'DM Serif Display' }}>
            {isWakeTimeReached() ? `Timer to wake ${babyName || 'baby'} up` : 'Sleep in Progress'}
          </Text>
          <Text className="text-white text-2xl font-bold mt-1" style={{ fontFamily: 'Inter' }}>
            Sleeping: {elapsedTime}
          </Text>
          {wakeTimerSetFor && (
            <Text className={`text-sm mt-1 ${isWakeTimeReached() ? 'text-red-400' : 'text-yellow-400'}`} style={{ fontFamily: 'Inter' }}>
              {isWakeTimeReached() ? 'Time to wake up! 🔔' : `Wake-up timer: ${getWakeTimerCountdown()}`}
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          className="py-2 px-4 rounded-xl bg-red-600"
          onPress={onStop}
        >
          <Text className="text-text-main font-semibold" style={{ fontFamily: 'Inter' }}>Stop</Text>
        </TouchableOpacity>
      </View>

      <View className="space-y-2">
        <TouchableOpacity
          className="py-2 px-3 rounded-lg items-center bg-gray-700"
          onPress={onAdjustStartTime}
        >
          <Text className="text-text-main text-sm" style={{ fontFamily: 'Inter' }}>
            Adjust start time
          </Text>
        </TouchableOpacity>
        
        {!wakeTimerSetFor ? (
          <TouchableOpacity
            className="py-2 px-3 rounded-lg items-center bg-primary"
            onPress={onSetWakeTimer}
          >
            <Text className="text-text-main text-sm" style={{ fontFamily: 'Inter' }}>
              Set a timer?
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row space-x-2">
            <View className="flex-1 py-2 px-3 rounded-lg bg-gray-600 items-center">
              <Text className="text-text-main text-sm" style={{ fontFamily: 'Inter' }}>
                Alert at {wakeTimerSetFor.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} (in {getWakeTimerCountdown()})
              </Text>
            </View>
            <TouchableOpacity
              className="py-2 px-3 rounded-lg bg-red-600 items-center"
              onPress={onCancelWakeTimer}
            >
              <Text className="text-text-main text-sm font-bold" style={{ fontFamily: 'Inter' }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}