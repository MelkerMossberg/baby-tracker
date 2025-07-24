import React, { useState, useEffect, ReactNode } from 'react';
import { ActiveBabyContext, ActiveBabyContextType } from '../hooks/useActiveBaby';
import { getBabiesForCurrentUser, BabyWithRole } from '../lib/api';

interface ActiveBabyProviderProps {
  children: ReactNode;
}

export function ActiveBabyProvider({ children }: ActiveBabyProviderProps) {
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
      
      const babies = await getBabiesForCurrentUser();
      setBabyList(babies);
      
      // Auto-select logic
      if (babies.length === 1) {
        // If only one baby, auto-select it
        setActiveBabyIdState(babies[0].id);
      } else if (babies.length > 1) {
        // If multiple babies and no current selection, select the first one
        if (!activeBabyId || !babies.find(b => b.id === activeBabyId)) {
          setActiveBabyIdState(babies[0].id);
        }
      } else {
        // No babies exist
        setActiveBabyIdState(null);
      }
      
    } catch (err) {
      console.error('Error fetching babies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch babies');
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
    await fetchBabies();
  };

  // Fetch babies on mount
  useEffect(() => {
    fetchBabies();
  }, []);

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