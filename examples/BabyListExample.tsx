import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Alert, FlatList } from 'react-native'
import { getBabiesForCurrentUser, createBabyProfile, BabyWithRole } from '../lib/api'

/**
 * Example component showing how to use the baby API functions
 */
export default function BabyListExample() {
  const [babies, setBabies] = useState<BabyWithRole[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Load babies when component mounts
  useEffect(() => {
    loadBabies()
  }, [])

  const loadBabies = async () => {
    try {
      setLoading(true)
      const fetchedBabies = await getBabiesForCurrentUser()
      setBabies(fetchedBabies)
    } catch (error) {
      console.error('Error loading babies:', error)
      Alert.alert('Error', 'Failed to load babies')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      const fetchedBabies = await getBabiesForCurrentUser()
      setBabies(fetchedBabies)
    } catch (error) {
      console.error('Error refreshing babies:', error)
      Alert.alert('Error', 'Failed to refresh babies')
    } finally {
      setRefreshing(false)
    }
  }

  const handleCreateBaby = async () => {
    try {
      setLoading(true)
      
      // In a real app, you'd get these values from a form
      const babyName = 'Emma'
      const birthdate = '2024-01-15' // YYYY-MM-DD format
      
      const babyId = await createBabyProfile(babyName, birthdate)
      
      Alert.alert('Success', `Baby profile created with ID: ${babyId}`)
      
      // Reload the list to show the new baby
      await loadBabies()
      
    } catch (error) {
      console.error('Error creating baby:', error)
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create baby')
    } finally {
      setLoading(false)
    }
  }

  const renderBaby = ({ item }: { item: BabyWithRole }) => (
    <View className="bg-card-main p-4 mb-2 rounded-lg">
      <Text className="text-text-main text-lg font-bold">{item.name}</Text>
      <Text className="text-text-muted">Born: {item.birthdate}</Text>
      <Text className="text-text-muted">Role: {item.role}</Text>
      <Text className="text-text-muted text-xs">
        Created: {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  )

  if (loading && babies.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-text-main">Loading babies...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-text-main text-xl font-bold">My Babies</Text>
        <TouchableOpacity
          className="bg-primary px-4 py-2 rounded-lg"
          onPress={handleCreateBaby}
          disabled={loading}
        >
          <Text className="text-white">Add Baby</Text>
        </TouchableOpacity>
      </View>

      {babies.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-text-muted text-center mb-4">
            No babies found. Create your first baby profile!
          </Text>
          <TouchableOpacity
            className="bg-green-600 px-6 py-3 rounded-lg"
            onPress={handleCreateBaby}
            disabled={loading}
          >
            <Text className="text-white">Create Baby Profile</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={babies}
          renderItem={renderBaby}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}