import React, { useState } from 'react';
import { User, Stethoscope, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const [userType, setUserType] = useState<'doctor' | 'patient'>('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState(''); // For doctors
  const [patientId, setPatientId] = useState(''); // For patients

  // Simple local storage for users (fallback when Supabase is not configured)
  const getStoredUsers = () => {
    try {
      const users = localStorage.getItem('ayurvedic_users');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  };

  const storeUser = (userData: any) => {
    try {
      const users = getStoredUsers();
      const existingUserIndex = users.findIndex((u: any) => u.email === userData.email);
      
      if (existingUserIndex >= 0) {
        users[existingUserIndex] = userData;
      } else {
        users.push(userData);
      }
      
      localStorage.setItem('ayurvedic_users', JSON.stringify(users));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  };

  const findUser = (email: string, password: string) => {
    const users = getStoredUsers();
    return users.find((u: any) => u.email === email && u.password === password);
  };

  const createDemoAccount = async (type: 'doctor' | 'patient') => {
    setIsLoading(true);
    try {
      const demoCredentials = {
        doctor: { 
          email: 'doctor@demo.com', 
          password: 'password123', 
          name: 'Dr. Sarah Johnson', 
          licenseNumber: 'MD12345' 
        },
        patient: { 
          email: 'patient@demo.com', 
          password: 'password123', 
          name: 'John Smith', 
          patientId: 'PAT001' 
        }
      };

      const credentials = demoCredentials[type];
      
      // Check if demo account already exists
      const existingUser = findUser(credentials.email, credentials.password);
      
      if (existingUser) {
        login(type, {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          ...(type === 'doctor' && { licenseNumber: existingUser.licenseNumber }),
          ...(type === 'patient' && { patientId: existingUser.patientId })
        });
        toast.success(`Welcome, ${existingUser.name}!`);
        return;
      }

      // Create demo account
      const newUser = {
        id: Date.now().toString(),
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        userType: type,
        ...(type === 'doctor' && { licenseNumber: credentials.licenseNumber }),
        ...(type === 'patient' && { patientId: credentials.patientId })
      };

      storeUser(newUser);
      
      login(type, {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        ...(type === 'doctor' && { licenseNumber: newUser.licenseNumber }),
        ...(type === 'patient' && { patientId: newUser.patientId })
      });
      
      toast.success(`Demo account created! Welcome, ${newUser.name}!`);
    } catch (error: any) {
      console.error('Demo account error:', error);
      toast.error(error.message || 'Failed to create demo account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        // Validate required fields for signup
        if (!name) {
          toast.error('Please enter your name');
          return;
        }
        
        if (userType === 'doctor' && !licenseNumber) {
          toast.error('Please enter your license number');
          return;
        }
        
        if (userType === 'patient' && !patientId) {
          toast.error('Please enter your patient ID');
          return;
        }

        // Check if user already exists
        const users = getStoredUsers();
        const existingUser = users.find((u: any) => u.email === email);
        
        if (existingUser) {
          toast.error('An account with this email already exists');
          return;
        }

        // Create new user
        const newUser = {
          id: Date.now().toString(),
          email,
          password,
          name,
          userType,
          ...(userType === 'doctor' && { licenseNumber }),
          ...(userType === 'patient' && { patientId })
        };

        storeUser(newUser);
        
        login(userType, {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          ...(userType === 'doctor' && { licenseNumber: newUser.licenseNumber }),
          ...(userType === 'patient' && { patientId: newUser.patientId })
        });
        
        toast.success('Account created successfully!');
        
        // Reset form
        setEmail('');
        setPassword('');
        setName('');
        setLicenseNumber('');
        setPatientId('');
        setIsSignUp(false);
      } else {
        // Sign in logic
        const user = findUser(email, password);
        
        if (user) {
          login(user.userType, {
            id: user.id,
            email: user.email,
            name: user.name,
            ...(user.userType === 'doctor' && { licenseNumber: user.licenseNumber }),
            ...(user.userType === 'patient' && { patientId: user.patientId })
          });
          toast.success(`Welcome back, ${user.name}!`);
        } else {
          toast.error('Invalid email or password');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-full">
                {userType === 'doctor' ? (
                  <Stethoscope className="w-8 h-8 text-white" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {isSignUp ? 'Sign up as a' : 'Sign in as a'} {userType}
            </p>
          </div>

          {/* User Type Selection */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setUserType('doctor')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userType === 'doctor'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Stethoscope className="w-4 h-4 inline mr-2" />
              Doctor
            </button>
            <button
              type="button"
              onClick={() => setUserType('patient')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userType === 'patient'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Patient
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            {isSignUp && userType === 'doctor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your medical license number"
                  required
                />
              </div>
            )}

            {isSignUp && userType === 'patient' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID
                </label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your patient ID"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-primary hover:underline font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Demo Access:</h3>
            <div className="flex gap-2">
              <button
                onClick={() => createDemoAccount('doctor')}
                disabled={isLoading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                Demo Doctor
              </button>
              <button
                onClick={() => createDemoAccount('patient')}
                disabled={isLoading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Demo Patient
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Demo accounts will be created automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;