import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView 
      className="flex-1" 
      contentContainerStyle={{ padding: 16 }} // optional, remove for true edge-to-edge
      style={{ backgroundColor: '#0E0A13' }}
      >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
            Baby Tracker
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-sm text-gray-400" style={{ fontFamily: 'Inter' }}>
              ▼ Focused on Otis
            </Text>
          </View>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center">
          <Image 
            source={require('../assets/img/icons/account.png')} 
            className="w-6 h-6"
          />
        </TouchableOpacity>
      </View>

      {/* Hero Message */}
      <Text className="text-3xl font-serif text-white mb-8 leading-tight" style={{ fontFamily: 'DM Serif Display' }}>
        Soon time for Otis's second meal. Yum.
      </Text>

      {/* Recent Activity */}
      <Text className="text-lg text-gray-400 mb-4" style={{ fontFamily: 'Inter' }}>
        Recent activity
      </Text>
      <View className="rounded-2xl p-4 shadow-lg mb-8" style={{ backgroundColor: '#171021' }}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            Last feeding
          </Text>
          <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Inter' }}>
            2h ago
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            Last sleep
          </Text>
          <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Inter' }}>
            2h ago
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            Last diaper change
          </Text>
          <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Inter' }}>
            2h ago
          </Text>
        </View>
      </View>

      {/* Track */}
      <Text className="text-lg text-gray-400 mb-4" style={{ fontFamily: 'Inter' }}>
        Track
      </Text>
      <View className="mb-8 space-y-4">
  <View className="flex-row justify-between">
    <TouchableOpacity className="w-[48%] rounded-2xl p-6 shadow-lg items-center" style={{ backgroundColor: '#171021' }}>
      <Image source={require('../assets/img/icons/nursing.png')} className="w-12 h-12 mb-3" />
      <Text className="text-white" style={{ fontFamily: 'Inter' }}>Nursing</Text>
    </TouchableOpacity>

    <TouchableOpacity className="w-[48%] rounded-2xl p-6 shadow-lg items-center" style={{ backgroundColor: '#171021' }}>
      <Image source={require('../assets/img/icons/sleep.png')} className="w-12 h-12 mb-3" />
      <Text className="text-white" style={{ fontFamily: 'Inter' }}>Sleep</Text>
    </TouchableOpacity>
  </View>

  <View className="flex-row justify-between">
    <TouchableOpacity className="w-[48%] rounded-2xl p-6 shadow-lg items-center" style={{ backgroundColor: '#171021' }}>
      <Image source={require('../assets/img/icons/diaper.png')} className="w-12 h-12 mb-3" />
      <Text className="text-white" style={{ fontFamily: 'Inter' }}>Diaper change</Text>
    </TouchableOpacity>

    <TouchableOpacity className="w-[48%] rounded-2xl p-6 shadow-lg items-center" style={{ backgroundColor: '#171021' }}>
      <Image source={require('../assets/img/icons/pumping.png')} className="w-12 h-12 mb-3" />
      <Text className="text-white" style={{ fontFamily: 'Inter' }}>Pumping</Text>
    </TouchableOpacity>
  </View>

  <View className="flex-row justify-between">
    <TouchableOpacity className="w-[48%] rounded-2xl p-6 shadow-lg items-center" style={{ backgroundColor: '#171021' }}>
      <Image source={require('../assets/img/icons/bottle.png')} className="w-12 h-12 mb-3" />
      <Text className="text-white" style={{ fontFamily: 'Inter' }}>Bottle feed</Text>
    </TouchableOpacity>

    <TouchableOpacity className="w-[48%] rounded-2xl p-6 shadow-lg items-center" style={{ backgroundColor: '#171021' }}>
      <Image source={require('../assets/img/icons/solids.png')} className="w-12 h-12 mb-3" />
      <Text className="text-white" style={{ fontFamily: 'Inter' }}>Solid food</Text>
    </TouchableOpacity>
  </View>
</View>

      {/* Today's Summary */}
      <Text className="text-lg text-gray-400 mb-4" style={{ fontFamily: 'Inter' }}>
        Today's summary
      </Text>
      <View className="rounded-2xl p-4 shadow-lg mb-8" style={{ backgroundColor: '#171021' }}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            Feedings
          </Text>
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            8 times
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            Sleep
          </Text>
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            12h 30 min
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            Diapers
          </Text>
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            6 changes
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}