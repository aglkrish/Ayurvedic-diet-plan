import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Check for existing session in localStorage
    const checkLocalSession = () => {
      try {
        const storedUser = localStorage.getItem('ayurvedic_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setUserType(userData.userType);
        }
      } catch (error) {
        console.error('Error checking local session:', error);
        localStorage.removeItem('ayurvedic_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkLocalSession();
  }, []);

  const login = (userType: 'doctor' | 'patient', userData: any) => {
    const userInfo = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      userType: userType,
      ...(userType === 'doctor' && { licenseNumber: userData.licenseNumber }),
      ...(userType === 'patient' && { patientId: userData.patientId })
    };
    
    setUser(userInfo);
    setUserType(userType);
    
    // Store in localStorage for persistence
    localStorage.setItem('ayurvedic_user', JSON.stringify(userInfo));
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('ayurvedic_user');
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