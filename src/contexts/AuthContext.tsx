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

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          
          if (userProfile) {
            setUser({
              id: userProfile.id,
              email: userProfile.email,
              name: userProfile.name,
              userType: userProfile.user_type,
              ...(userProfile.user_type === 'doctor' && { licenseNumber: userProfile.license_number }),
              ...(userProfile.user_type === 'patient' && { patientId: userProfile.patient_id })
            });
            setUserType(userProfile.user_type);
          }
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
          const userProfile = await fetchUserProfile(session.user.id);
          
          if (userProfile) {
            setUser({
              id: userProfile.id,
              email: userProfile.email,
              name: userProfile.name,
              userType: userProfile.user_type,
              ...(userProfile.user_type === 'doctor' && { licenseNumber: userProfile.license_number }),
              ...(userProfile.user_type === 'patient' && { patientId: userProfile.patient_id })
            });
            setUserType(userProfile.user_type);
          }
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
