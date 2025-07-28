import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export default function SkeletonLoader({ 
  width = '100%', 
  height = 16, 
  borderRadius = 8,
  className = ''
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulseAnimation = () => {
      return Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]);
    };

    const loop = Animated.loop(createPulseAnimation());
    loop.start();

    return () => loop.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#374151', '#4B5563'], // gray-700 to gray-600
  });

  return (
    <Animated.View
      className={className}
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor,
        }
      ]}
    />
  );
}

// Pre-built skeleton components for common use cases
export const SkeletonText = ({ lines = 1, className = '' }: { lines?: number; className?: string }) => (
  <View className={className}>
    {Array.from({ length: lines }, (_, index) => (
      <SkeletonLoader
        key={index}
        height={16}
        width={index === lines - 1 ? '75%' : '100%'}
        className={index < lines - 1 ? 'mb-2' : ''}
      />
    ))}
  </View>
);

export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <View className={`rounded-2xl p-4 bg-card-main ${className}`}>
    <SkeletonLoader height={20} width="60%" className="mb-3" />
    <SkeletonText lines={2} />
  </View>
);

export const SkeletonEventRow = ({ className = '' }: { className?: string }) => (
  <View className={`flex-row justify-between items-center ${className}`}>
    <SkeletonLoader height={16} width="65%" />
    <SkeletonLoader height={14} width="20%" />
  </View>
);