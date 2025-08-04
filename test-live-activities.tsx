import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import { liveActivityService } from './services/liveActivityService';

/**
 * Test component for Live Activities
 * Add this to your app temporarily to test Live Activities functionality
 */
export const LiveActivityTest: React.FC = () => {
  const testStartActivity = async () => {
    try {
      console.log('🧪 Testing Live Activity start...');
      
      // Direct test bypassing service layer
      const LiveActivityControl = require('../modules/live-activity-control/src');
      const directResult = await LiveActivityControl.startActivity('left', 'Demo Baby');
      
      console.log('🧪 Direct test result:', directResult);
      Alert.alert('Direct Live Activity Test', JSON.stringify(directResult, null, 2));
    } catch (error) {
      console.error('🧪 Test error:', error);
      Alert.alert('Direct Test Error', String(error));
    }
  };

  const testStopActivity = async () => {
    try {
      console.log('🧪 Testing Live Activity stop...');
      const result = await liveActivityService.stopNursingActivity();
      console.log('🧪 Stop result:', result);
      Alert.alert('Live Activity Test', result.message);
    } catch (error) {
      console.error('🧪 Test error:', error);
      Alert.alert('Error', String(error));
    }
  };

  const testUpdateActivity = async () => {
    try {
      console.log('🧪 Testing Live Activity update...');
      const result = await liveActivityService.updateNursingSide('right');
      console.log('🧪 Update result:', result);
      Alert.alert('Live Activity Test', result.message);
    } catch (error) {
      console.error('🧪 Test error:', error);
      Alert.alert('Error', String(error));
    }
  };

  const testCheckSupport = async () => {
    try {
      console.log('🧪 Testing Live Activity support...');
      
      // Start with basic info that shouldn't crash
      const basicResults = {
        platform: Platform.OS,
        platformVersion: Platform.Version,
        expoVersion: Constants.expoVersion,
        moduleAvailable: false,
        serviceTestResult: null as any,
        directTestError: null as string | null
      };

      Alert.alert('Basic Info', JSON.stringify(basicResults, null, 2));

      // Test module availability step by step
      try {
        console.log('🧪 Step 1: Testing module import...');
        const moduleImport = require('../modules/expo-live-activity-manager/src');
        console.log('🧪 Module import result:', !!moduleImport);
        
        basicResults.moduleAvailable = !!moduleImport;
        
        if (moduleImport) {
          console.log('🧪 Step 2: Module imported successfully');
          
          // Try to access module functions
          console.log('🧪 Step 3: Checking module functions...');
          const hasCheckMethod = typeof moduleImport.checkLiveActivitySupport === 'function';
          basicResults.directTestError = `Has check method: ${hasCheckMethod}`;
          
          if (hasCheckMethod) {
            console.log('🧪 Step 4: Calling checkLiveActivitySupport...');
            try {
              const support = await moduleImport.checkLiveActivitySupport();
              basicResults.directTestError = `Success: ${JSON.stringify(support)}`;
            } catch (methodError) {
              basicResults.directTestError = `Method error: ${String(methodError)}`;
            }
          }
        }
      } catch (moduleError) {
        console.error('🧪 Module error:', moduleError);
        basicResults.directTestError = `Module error: ${String(moduleError)}`;
      }

      // Test service separately with protection
      try {
        console.log('🧪 Step 5: Testing service...');
        const serviceResult = await liveActivityService.getSupport();
        basicResults.serviceTestResult = serviceResult;
      } catch (serviceError) {
        console.error('🧪 Service error:', serviceError);
        basicResults.serviceTestResult = `Service error: ${String(serviceError)}`;
      }
      
      console.log('🧪 Final result:', basicResults);
      Alert.alert('Live Activity Support', JSON.stringify(basicResults, null, 2));
      
    } catch (error) {
      console.error('🧪 Top level error:', error);
      Alert.alert('Critical Error', `Top level crash: ${String(error)}`);
    }
  };

  const testBasicInfo = () => {
    try {
      const info = {
        platform: Platform.OS,
        version: Platform.Version,
        expo: Constants.expoVersion
      };
      Alert.alert('Basic Device Info', JSON.stringify(info, null, 2));
    } catch (error) {
      Alert.alert('Error', `Basic info error: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Activity Test</Text>
      <Text style={styles.subtitle}>Test Live Activities functionality</Text>
      
      <TouchableOpacity style={[styles.button, { backgroundColor: '#28A745' }]} onPress={testBasicInfo}>
        <Text style={styles.buttonText}>Test Basic Info (Safe)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testCheckSupport}>
        <Text style={styles.buttonText}>Check Support</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testStartActivity}>
        <Text style={styles.buttonText}>Start Live Activity</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testUpdateActivity}>
        <Text style={styles.buttonText}>Update to Right Side</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={testStopActivity}>
        <Text style={styles.buttonText}>Stop Live Activity</Text>
      </TouchableOpacity>
      
      <Text style={styles.note}>
        Check console logs and your Dynamic Island/Lock Screen for Live Activities
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});

export default LiveActivityTest;