import React, { useState, useEffect, ReactNode } from 'react';
import { ActiveBabyContext, ActiveBabyContextType } from '../hooks/useActiveBaby';
import { getBabiesForCurrentUser, BabyWithRole } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

interface ActiveBabyProviderProps {
  children: ReactNode;
}

export function ActiveBabyProvider({ children }: ActiveBabyProviderProps) {
  const { authStatus, user } = useAuth();
  const [activeBabyId, setActiveBabyIdState] = useState<string | null>(null);
  const [babyList, setBabyList] = useState<BabyWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the active baby object from the list
  const activeBaby = babyList.find(baby => baby.id === activeBabyId) || null;

  const fetchBabies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching babies for current user...');
      const babies = await getBabiesForCurrentUser();
      console.log('👶 Fetched babies:', babies.length, babies);
      setBabyList(babies);
      
      // Auto-select logic
      if (babies.length === 1) {
        // If only one baby, auto-select it
        console.log('🔥 Auto-selecting single baby:', babies[0].name);
        setActiveBabyIdState(babies[0].id);
      } else if (babies.length > 1) {
        // If multiple babies and no current selection, select the first one
        if (!activeBabyId || !babies.find(b => b.id === activeBabyId)) {
          console.log('🔥 Auto-selecting first baby from multiple:', babies[0].name);
          setActiveBabyIdState(babies[0].id);
        }
      } else {
        // No babies exist
        console.log('❌ No babies found, setting active baby to null');
        setActiveBabyIdState(null);
      }
      
    } catch (err) {
      console.error('❌ Error fetching babies:', err);
      
      // Handle specific database policy errors
      if (err instanceof Error && err.message.includes('infinite recursion')) {
        setError('Database configuration error. Please contact support.');
      } else if (err instanceof Error && err.message.includes('user_baby_links')) {
        setError('Database access error. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch babies');
      }
      
      setBabyList([]);
      setActiveBabyIdState(null);
    } finally {
      setLoading(false);
    }
  };

  const setActiveBabyId = (babyId: string | null) => {
    if (babyId && !babyList.find(baby => baby.id === babyId)) {
      console.warn(`Baby with ID ${babyId} not found in baby list`);
      return;
    }
    setActiveBabyIdState(babyId);
  };

  const refreshBabies = async () => {
    console.log('🔄 RefreshBabies called - triggering fetch...');
    await fetchBabies();
  };

  // Fetch babies when authenticated
  useEffect(() => {
    if (authStatus === 'authenticated' && user) {
      fetchBabies();
    } else if (authStatus === 'unauthenticated') {
      // Clear data when not authenticated
      setBabyList([]);
      setActiveBabyIdState(null);
      setError(null);
      setLoading(false);
    }
  }, [authStatus, user]);

  const contextValue: ActiveBabyContextType = {
    activeBabyId,
    activeBaby,
    babyList,
    setActiveBabyId,
    loading,
    error,
    refreshBabies
  };

  return (
    <ActiveBabyContext.Provider value={contextValue}>
      {children}
    </ActiveBabyContext.Provider>
  );
}