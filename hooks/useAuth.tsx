import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut, getCurrentUser, onAuthStateChange } from '../lib/api/auth';
import { supabase } from '../lib/supabase';
import type { User } from '../lib/supabase';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextType {
  user: User | null;
  authStatus: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  const signIn = async (email: string, password: string) => {
    try {
      await apiSignIn(email, password);
      // User state will be updated via onAuthStateChange
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      await apiSignUp(email, password, name);
      // User state will be updated via onAuthStateChange
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await apiSignOut();
      // User state will be updated via onAuthStateChange
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // First check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setAuthStatus('unauthenticated');
          return;
        }

        if (session?.user) {
          try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setAuthStatus(currentUser ? 'authenticated' : 'unauthenticated');
          } catch (userError) {
            console.error('Error getting user profile:', userError);
            // Even if user profile fails, we have a session
            setUser(null);
            setAuthStatus('unauthenticated');
          }
        } else {
          setUser(null);
          setAuthStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setAuthStatus('unauthenticated');
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      setAuthStatus(user ? 'authenticated' : 'unauthenticated');
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const contextValue: AuthContextType = {
    user,
    authStatus,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}