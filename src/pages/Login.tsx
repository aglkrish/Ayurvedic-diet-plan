import React, { useState } from 'react';
import { User, Stethoscope, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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

  const createDemoAccount = async (type: 'doctor' | 'patient') => {
    setIsLoading(true);
    try {
      const demoCredentials = {
        doctor: { email: 'doctor@demo.com', password: 'password123', name: 'Dr. Sarah Johnson', licenseNumber: 'MD12345' },
        patient: { email: 'patient@demo.com', password: 'password123', name: 'John Smith', patientId: 'PAT001' }
      };

      const credentials = demoCredentials[type];
      
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (signInData.user) {
        const userProfile = await fetchUserProfile(signInData.user.id);
        if (userProfile) {
          login(userProfile.user_type, {
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            ...(userProfile.user_type === 'doctor' && { licenseNumber: userProfile.license_number }),
            ...(userProfile.user_type === 'patient' && { patientId: userProfile.patient_id })
          });
          toast.success(`Welcome, ${userProfile.name}!`);
          return;
        }
      }

      // If sign in fails, create account
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            user_type: type,
            name: credentials.name,
            ...(type === 'doctor' && { license_number: credentials.licenseNumber }),
            ...(type === 'patient' && { patient_id: credentials.patientId })
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Wait for the trigger to create the user profile
        setTimeout(async () => {
          const userProfile = await fetchUserProfile(data.user.id);
          if (userProfile) {
            login(userProfile.user_type, {
              id: userProfile.id,
              email: userProfile.email,
              name: userProfile.name,
              ...(userProfile.user_type === 'doctor' && { licenseNumber: userProfile.license_number }),
              ...(userProfile.user_type === 'patient' && { patientId: userProfile.patient_id })
            });
            toast.success(`Demo account created! Welcome, ${userProfile.name}!`);
          }
        }, 1000);
      }
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
        // Sign up logic
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: userType,
              name: name,
              ...(userType === 'doctor' && { license_number: licenseNumber }),
              ...(userType === 'patient' && { patient_id: patientId })
            }
          }
        });

        if (error) throw error;
        
        if (data.user) {
          // Wait a moment for the trigger to create the user profile
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(data.user.id);
            if (userProfile) {
              login(userType, {
                id: userProfile.id,
                email: userProfile.email,
                name: userProfile.name,
                ...(userType === 'doctor' && { licenseNumber: userProfile.license_number }),
                ...(userType === 'patient' && { patientId: userProfile.patient_id })
              });
              toast.success('Account created successfully!');
            }
          }, 1000);
        }
      } else {
        // Sign in logic
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.user) {
          const userProfile = await fetchUserProfile(data.user.id);
          
          if (userProfile) {
            login(userProfile.user_type, {
              id: userProfile.id,
              email: userProfile.email,
              name: userProfile.name,
              ...(userProfile.user_type === 'doctor' && { licenseNumber: userProfile.license_number }),
              ...(userProfile.user_type === 'patient' && { patientId: userProfile.patient_id })
            });
            toast.success(`Welcome back, ${userProfile.name}!`);
          } else {
            toast.error('User profile not found. Please contact support.');
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

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
              Demo accounts will be created automatically if they don't exist
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
