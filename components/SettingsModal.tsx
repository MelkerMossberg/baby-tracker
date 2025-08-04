import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, Animated, Dimensions } from 'react-native';
import { getBabiesForCurrentUser, getBabyById } from '../lib/api/baby';
import { useAuth } from '../hooks/useAuth';
import EditBabyScreen from '../screens/EditBabyScreen';
import JoinWithInviteScreen from '../screens/JoinWithInviteScreen';
import ShareBabyScreen from '../screens/ShareBabyScreen';
import type { BabyWithRole } from '../lib/supabase';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onBabyUpdated?: () => void;
  onCreateBaby?: () => void;
  onBabyJoined?: (babyId: string) => void;
}

type SettingsPage = 'main' | 'account' | 'baby' | 'editBaby' | 'joinInvite' | 'shareBaby';

export default function SettingsModal({ visible, onClose, onBabyUpdated, onCreateBaby, onBabyJoined }: SettingsModalProps) {
  const { user, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<SettingsPage>('main');
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const [babies, setBabies] = useState<BabyWithRole[]>([]);
  const [selectedBaby, setSelectedBaby] = useState<BabyWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [babyLoading, setBabyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [babyError, setBabyError] = useState<string | null>(null);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  React.useEffect(() => {
    if (visible) {
      loadBabies();
      setCurrentPage('main');
      setSelectedBabyId(null);
      setSelectedBaby(null);
      setBabyError(null);
      slideAnim.setValue(0);
    }
  }, [visible]);

  const loadBabies = async () => {
    try {
      setLoading(true);
      setError(null);
      const babiesData = await getBabiesForCurrentUser();
      setBabies(babiesData);
    } catch (err) {
      console.error('Error loading babies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load babies');
    } finally {
      setLoading(false);
    }
  };

  const loadBaby = async (babyId: string) => {
    try {
      setBabyLoading(true);
      setBabyError(null);
      const babyData = await getBabyById(babyId);
      setSelectedBaby(babyData);
    } catch (err) {
      console.error('Error loading baby:', err);
      setBabyError(err instanceof Error ? err.message : 'Failed to load baby');
    } finally {
      setBabyLoading(false);
    }
  };

  const navigateToPage = (page: SettingsPage, babyId?: string) => {
    if (babyId) {
      setSelectedBabyId(babyId);
      loadBaby(babyId);
    }
    
    // Animate slide to the right
    Animated.timing(slideAnim, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(page);
      slideAnim.setValue(screenWidth);
      
      // Animate slide in from the right
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const navigateToEditBaby = () => {
    navigateToPage('editBaby');
  };

  const navigateToShareBaby = () => {
    navigateToPage('shareBaby');
  };

  const handleEditBabySave = (updatedBaby: { name: string; birthdate: string }) => {
    // Update the selected baby with new information
    if (selectedBaby) {
      setSelectedBaby({
        ...selectedBaby,
        name: updatedBaby.name,
        birthdate: updatedBaby.birthdate
      });
    }
    
    // Update the babies list as well
    setBabies(babies.map(baby => 
      baby.id === selectedBaby?.id 
        ? { ...baby, name: updatedBaby.name, birthdate: updatedBaby.birthdate }
        : baby
    ));
    
    // Notify parent component to refresh its baby data
    onBabyUpdated?.();
    
    // Navigate back to baby settings
    navigateBack();
  };

  const handleEditBabyCancel = () => {
    navigateBack();
  };

  const handleCreateBaby = () => {
    onCreateBaby?.();
    onClose();
  };

  const handleJoinWithInvite = () => {
    navigateToPage('joinInvite');
  };

  const handleJoinSuccess = (babyId: string) => {
    onBabyJoined?.(babyId);
    onClose();
  };

  const handleJoinCancel = () => {
    navigateBack();
  };

  const navigateBack = () => {
    // Animate slide to the right
    Animated.timing(slideAnim, {
      toValue: screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage('main');
      setSelectedBabyId(null);
      setSelectedBaby(null);
      setBabyError(null);
      slideAnim.setValue(-screenWidth);
      
      // Animate slide in from the left
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      `Sign out of ${user?.name || 'your account'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              onClose();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const getBabyStatusText = (baby: BabyWithRole) => {
    return baby.role === 'admin' ? 'Admin' : 'Guest';
  };

  const formatBirthdate = (birthdate: string) => {
    try {
      const date = new Date(birthdate);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return birthdate;
    }
  };

  const renderMainPage = () => (
    <>
      {/* Header */}
      <View className="flex-row items-center justify-between p-6 pt-12">
        <Text className="text-2xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
          Settings
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Text className="text-lg text-white">Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Account Settings Section */}
        <View className="mb-8">
          <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
            Account Settings
          </Text>
          
          <TouchableOpacity
            className="bg-gray-900 rounded-2xl p-4 mb-3"
            onPress={() => navigateToPage('account')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-lg font-medium" style={{ fontFamily: 'Inter' }}>
                  Your Account
                </Text>
                <Text className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Inter' }}>
                  {user?.email || 'Manage your account settings'}
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">›</Text>
            </View>
          </TouchableOpacity>

          {/* Sign Out Button */}
          <TouchableOpacity
            className="bg-gray-900 rounded-2xl p-4"
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text className="text-red-400 text-lg font-medium text-center" style={{ fontFamily: 'Inter' }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Your Babies Section */}
        <View className="mb-8">
          <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
            Your Babies
          </Text>

          {loading ? (
            <View className="bg-gray-900 rounded-2xl p-8 items-center">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-gray-400 mt-2" style={{ fontFamily: 'Inter' }}>
                Loading babies...
              </Text>
            </View>
          ) : error ? (
            <View className="bg-gray-900 rounded-2xl p-4">
              <Text className="text-red-400 text-center" style={{ fontFamily: 'Inter' }}>
                {error}
              </Text>
              <TouchableOpacity
                className="mt-3 bg-gray-800 rounded-xl p-3"
                onPress={loadBabies}
              >
                <Text className="text-white text-center" style={{ fontFamily: 'Inter' }}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : babies.length === 0 ? (
            <>
              {/* Action Buttons when no babies */}
              <TouchableOpacity
                className="bg-gray-900 rounded-2xl p-4 mb-3"
                onPress={handleCreateBaby}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white text-lg font-medium" style={{ fontFamily: 'Inter' }}>
                      ➕ Create new baby
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Inter' }}>
                      Add a new baby to your tracker
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-lg">›</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-900 rounded-2xl p-4 mb-4"
                onPress={handleJoinWithInvite}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white text-lg font-medium" style={{ fontFamily: 'Inter' }}>
                      🔑 Join with invite code
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Inter' }}>
                      Join another family's baby tracking
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-lg">›</Text>
                </View>
              </TouchableOpacity>

              <View className="bg-gray-900 rounded-2xl p-8 items-center">
                <Text className="text-gray-400 text-center" style={{ fontFamily: 'Inter' }}>
                  No babies found
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* Baby List */}
              {babies.map((baby, index) => (
                <TouchableOpacity
                  key={baby.id}
                  className="bg-gray-900 rounded-2xl p-4 mb-3"
                  onPress={() => navigateToPage('baby', baby.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-white text-lg font-medium" style={{ fontFamily: 'Inter' }}>
                        {baby.name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <View className={`px-2 py-1 rounded-full mr-2 ${
                          baby.role === 'admin' ? 'bg-primary/20' : 'bg-gray-700'
                        }`}>
                          <Text className={`text-xs font-medium ${
                            baby.role === 'admin' ? 'text-white' : 'text-gray-300'
                          }`} style={{ fontFamily: 'Inter' }}>
                            {getBabyStatusText(baby)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text className="text-gray-400 text-lg">›</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Action Buttons when babies exist */}
              <TouchableOpacity
                className="bg-gray-900 rounded-2xl p-4 mb-3"
                onPress={handleCreateBaby}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white text-lg font-medium" style={{ fontFamily: 'Inter' }}>
                      ➕ Create new baby
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Inter' }}>
                      Add a new baby to your tracker
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-lg">›</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-900 rounded-2xl p-4"
                onPress={handleJoinWithInvite}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white text-lg font-medium" style={{ fontFamily: 'Inter' }}>
                      🔑 Join with invite code
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Inter' }}>
                      Join another family's baby tracking
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-lg">›</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );

  const renderAccountPage = () => (
    <>
      {/* Header */}
      <View className="flex-row items-center justify-between p-6 pt-12">
        <TouchableOpacity onPress={navigateBack}>
          <Text className="text-lg text-white">‹ Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
          Account Settings
        </Text>
        <View className="w-12" />
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="mb-6">
          <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
            Profile Information
          </Text>
          
          <View className="bg-gray-900 rounded-2xl p-4 mb-3">
            <Text className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Inter' }}>
              Name
            </Text>
            <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
              {user?.name || 'Not set'}
            </Text>
          </View>

          <View className="bg-gray-900 rounded-2xl p-4">
            <Text className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Inter' }}>
              Email
            </Text>
            <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
              {user?.email || 'Not available'}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
            Coming Soon
          </Text>
          
          <View className="bg-gray-900 rounded-2xl p-6 items-center">
            <Text className="text-gray-400 text-center" style={{ fontFamily: 'Inter' }}>
              Account management features will be available in a future update.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );

  const renderBabyPage = () => {
    if (babyLoading) {
      return (
        <>
          <View className="flex-row items-center justify-between p-6 pt-12">
            <TouchableOpacity onPress={navigateBack}>
              <Text className="text-lg text-white">‹ Back</Text>
            </TouchableOpacity>
            <Text className="text-xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
              Baby Settings
            </Text>
            <View className="w-12" />
          </View>
          
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#fff" />
            <Text className="text-gray-400 mt-4" style={{ fontFamily: 'Inter' }}>
              Loading baby information...
            </Text>
          </View>
        </>
      );
    }

    if (babyError || !selectedBaby) {
      return (
        <>
          <View className="flex-row items-center justify-between p-6 pt-12">
            <TouchableOpacity onPress={navigateBack}>
              <Text className="text-lg text-white">‹ Back</Text>
            </TouchableOpacity>
            <Text className="text-xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
              Baby Settings
            </Text>
            <View className="w-12" />
          </View>
          
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-red-400 text-center mb-4" style={{ fontFamily: 'Inter' }}>
              {babyError || 'Baby not found'}
            </Text>
            <TouchableOpacity
              className="bg-gray-800 rounded-xl px-6 py-3"
              onPress={() => selectedBabyId && loadBaby(selectedBabyId)}
            >
              <Text className="text-white" style={{ fontFamily: 'Inter' }}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    return (
      <>
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 pt-12">
          <TouchableOpacity onPress={navigateBack}>
            <Text className="text-lg text-white">‹ Back</Text>
          </TouchableOpacity>
          <Text className="text-xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
            {selectedBaby.name}
          </Text>
          <View className="w-12" />
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Baby Information */}
          <View className="mb-6">
            <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
              Baby Information
            </Text>
            
            <View className="bg-gray-900 rounded-2xl p-4 mb-3">
              <Text className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Inter' }}>
                Name
              </Text>
              <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
                {selectedBaby.name}
              </Text>
            </View>

            <View className="bg-gray-900 rounded-2xl p-4 mb-3">
              <Text className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Inter' }}>
                Birthdate
              </Text>
              <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
                {formatBirthdate(selectedBaby.birthdate)}
              </Text>
            </View>

            <View className="bg-gray-900 rounded-2xl p-4">
              <Text className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Inter' }}>
                Your Role
              </Text>
              <View className={`self-start px-3 py-1 rounded-full ${
                selectedBaby.role === 'admin' ? 'bg-primary/20' : 'bg-gray-700'
              }`}>
                <Text className={`text-sm font-medium ${
                  selectedBaby.role === 'admin' ? 'text-white' : 'text-gray-300'
                }`} style={{ fontFamily: 'Inter' }}>
                  {selectedBaby.role === 'admin' ? 'Admin' : 'Guest'}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions - only show for admins */}
          {selectedBaby.role === 'admin' && (
            <View className="mb-6">
              <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
                Manage Baby
              </Text>
              
              <TouchableOpacity
                className="bg-gray-900 rounded-2xl p-4 mb-3"
                onPress={navigateToEditBaby}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
                    Edit Baby Information
                  </Text>
                  <Text className="text-gray-400 text-lg">›</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-900 rounded-2xl p-4 mb-3"
                onPress={navigateToShareBaby}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
                    Share Baby
                  </Text>
                  <Text className="text-gray-400 text-lg">›</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-900 rounded-2xl p-4"
                activeOpacity={0.7}
              >
                <Text className="text-red-400 text-lg text-center" style={{ fontFamily: 'Inter' }}>
                  Remove Baby
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Coming Soon */}
          <View className="mb-6">
            <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
              Coming Soon
            </Text>
            
            <View className="bg-gray-900 rounded-2xl p-6 items-center">
              <Text className="text-gray-400 text-center" style={{ fontFamily: 'Inter' }}>
                Baby management features will be available in a future update.
              </Text>
            </View>
          </View>
        </ScrollView>
      </>
    );
  };

  const renderEditBabyPage = () => {
    if (!selectedBaby) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-400" style={{ fontFamily: 'Inter' }}>
            Baby information not available
          </Text>
        </View>
      );
    }

    return (
      <EditBabyScreen
        baby={selectedBaby}
        onSave={handleEditBabySave}
        onCancel={handleEditBabyCancel}
      />
    );
  };

  const renderJoinInvitePage = () => {
    return (
      <JoinWithInviteScreen
        onJoinSuccess={handleJoinSuccess}
        onCancel={handleJoinCancel}
      />
    );
  };

  const renderShareBabyPage = () => {
    if (!selectedBaby) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-400" style={{ fontFamily: 'Inter' }}>
            Baby information not available
          </Text>
        </View>
      );
    }

    return (
      <ShareBabyScreen
        baby={{ id: selectedBaby.id, name: selectedBaby.name }}
        onBack={navigateBack}
      />
    );
  };

  const getCurrentPageContent = () => {
    switch (currentPage) {
      case 'account':
        return renderAccountPage();
      case 'baby':
        return renderBabyPage();
      case 'editBaby':
        return renderEditBabyPage();
      case 'joinInvite':
        return renderJoinInvitePage();
      case 'shareBaby':
        return renderShareBabyPage();
      default:
        return renderMainPage();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={currentPage === 'main' ? onClose : navigateBack}
    >
      <View className="flex-1 bg-black">
        <Animated.View 
          className="flex-1"
          style={{
            transform: [{ translateX: slideAnim }],
          }}
        >
          {getCurrentPageContent()}
        </Animated.View>
      </View>
    </Modal>
  );
}