import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useActiveBaby } from '../hooks/useActiveBaby';
import type { BabyWithRole } from '../lib/api';

interface BabySwitcherProps {
  showCreateButton?: boolean;
  onCreateBaby?: () => void;
}

export default function BabySwitcher({ showCreateButton = false, onCreateBaby }: BabySwitcherProps) {
  const { activeBaby, babyList, setActiveBabyId, loading } = useActiveBaby();
  const [showModal, setShowModal] = useState(false);

  const handleBabySelect = (baby: BabyWithRole) => {
    setActiveBabyId(baby.id);
    setShowModal(false);
  };

  const renderBabyItem = ({ item }: { item: BabyWithRole }) => (
    <TouchableOpacity
      className={`p-4 border-b border-gray-700 ${
        item.id === activeBaby?.id ? 'bg-primary/20' : ''
      }`}
      onPress={() => handleBabySelect(item)}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-text-main text-lg font-semibold" style={{ fontFamily: 'Inter' }}>
            {item.name}
          </Text>
          <Text className="text-text-muted text-sm" style={{ fontFamily: 'Inter' }}>
            Born: {new Date(item.birthdate).toLocaleDateString()}
          </Text>
          <Text className="text-text-muted text-xs" style={{ fontFamily: 'Inter' }}>
            Role: {item.role}
          </Text>
        </View>
        {item.id === activeBaby?.id && (
          <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
            <Text className="text-white text-xs font-bold">✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-row items-center px-4 py-2">
        <Text className="text-text-muted" style={{ fontFamily: 'Inter' }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!activeBaby && babyList.length === 0) {
    return (
      <View className="flex-row items-center justify-between px-4 py-2">
        <Text className="text-text-muted" style={{ fontFamily: 'Inter' }}>
          No babies yet
        </Text>
        {showCreateButton && onCreateBaby && (
          <TouchableOpacity
            className="bg-primary px-3 py-1 rounded-lg"
            onPress={onCreateBaby}
          >
            <Text className="text-white text-sm font-semibold" style={{ fontFamily: 'Inter' }}>
              Add Baby
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Single baby - show name without dropdown
  if (babyList.length === 1) {
    return (
      <View className="flex-row items-center">
        <Text className="text-text-main text-lg font-semibold" style={{ fontFamily: 'Inter' }}>
          {activeBaby?.name || 'Unknown Baby'}
        </Text>
      </View>
    );
  }

  // Multiple babies - show dropdown
  return (
    <View>
      <TouchableOpacity
        className="flex-row items-center"
        onPress={() => setShowModal(true)}
      >
        <Text className="text-text-muted text-sm mr-2">▼</Text>
        <Text className="text-text-main text-lg font-semibold" style={{ fontFamily: 'Inter' }}>
          {activeBaby?.name || 'Select Baby'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-bg-main rounded-t-3xl max-h-96">
            <View className="p-6 border-b border-gray-700">
              <Text className="text-xl font-serif text-text-main text-center" style={{ fontFamily: 'DM Serif Display' }}>
                Select Baby
              </Text>
            </View>
            
            <FlatList
              data={babyList}
              renderItem={renderBabyItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
            
            <View className="p-4">
              <TouchableOpacity
                className="py-3 rounded-xl items-center border border-text-muted"
                onPress={() => setShowModal(false)}
              >
                <Text className="text-text-main text-lg" style={{ fontFamily: 'Inter' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}