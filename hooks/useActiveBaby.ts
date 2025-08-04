import { createContext, useContext } from 'react';
import type { BabyWithRole } from '../lib/api';

export interface ActiveBabyContextType {
  activeBabyId: string | null;
  activeBaby: BabyWithRole | null;
  babyList: BabyWithRole[];
  setActiveBabyId: (babyId: string | null) => void;
  loading: boolean;
  error: string | null;
  refreshBabies: () => Promise<void>;
}

export const ActiveBabyContext = createContext<ActiveBabyContextType | undefined>(undefined);

export function useActiveBaby(): ActiveBabyContextType {
  const context = useContext(ActiveBabyContext);
  
  if (context === undefined) {
    throw new Error('useActiveBaby must be used within an ActiveBabyProvider');
  }
  
  return context;
}