import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'doctor' | 'patient';
  licenseNumber?: string;
  patientId?: string;
}

interface AuthContextType {
  user: User | null;
  userType: 'doctor' | 'patient' | null;
  login: (userType: 'doctor' | 'patient', userData: any) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'doctor' | 'patient' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userMetadata = session.user.user_metadata;
          const actualUserType = userMetadata?.user_type || 'patient';
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: userMetadata?.name || 'User',
            userType: actualUserType,
            ...(actualUserType === 'doctor' && { licenseNumber: userMetadata?.license_number }),
            ...(actualUserType === 'patient' && { patientId: userMetadata?.patient_id })
          });
          setUserType(actualUserType);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userMetadata = session.user.user_metadata;
          const actualUserType = userMetadata?.user_type || 'patient';
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: userMetadata?.name || 'User',
            userType: actualUserType,
            ...(actualUserType === 'doctor' && { licenseNumber: userMetadata?.license_number }),
            ...(actualUserType === 'patient' && { patientId: userMetadata?.patient_id })
          });
          setUserType(actualUserType);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserType(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = (userType: 'doctor' | 'patient', userData: any) => {
    setUser({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      userType: userType,
      ...(userType === 'doctor' && { licenseNumber: userData.licenseNumber }),
      ...(userType === 'patient' && { patientId: userData.patientId })
    });
    setUserType(userType);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserType(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    userType,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
