import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService, { UserProfile, AuthError } from '../../services/DatabaseService';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isFirstTime: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signUp: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updatePreferences: (preferences: any) => Promise<{ error: AuthError | null }>;
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

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  const signUp = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const { user: supabaseUser, error } = await DatabaseService.signUp(
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName
      );

      if (supabaseUser && !error) {
        const newUser: User = {
          id: supabaseUser.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          isFirstTime: true,
        };
        
        setUser(newUser);
        await saveUserToStorage(newUser);
        
        // Get user profile
        const { profile } = await DatabaseService.getUserProfile(supabaseUser.id);
        if (profile) {
          setUserProfile(profile);
        }
      }

      return { error };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { error: { message: 'An unexpected error occurred' } };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: supabaseUser, error } = await DatabaseService.signIn(email, password);

      if (supabaseUser && !error) {
        const newUser: User = {
          id: supabaseUser.id,
          firstName: supabaseUser.user_metadata?.first_name || 'User',
          lastName: supabaseUser.user_metadata?.last_name || '',
          email: supabaseUser.email || email,
          isFirstTime: false,
        };
        
        setUser(newUser);
        await saveUserToStorage(newUser);
        
        // Get user profile
        const { profile } = await DatabaseService.getUserProfile(supabaseUser.id);
        if (profile) {
          setUserProfile(profile);
        }
      }

      return { error };
    } catch (error) {
      console.error('Error during sign in:', error);
      return { error: { message: 'An unexpected error occurred' } };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { user: supabaseUser, error } = await DatabaseService.signInWithGoogle();

      if (supabaseUser && !error) {
        const newUser: User = {
          id: supabaseUser.id,
          firstName: supabaseUser.user_metadata?.first_name || 'Google',
          lastName: supabaseUser.user_metadata?.last_name || 'User',
          email: supabaseUser.email || 'google@example.com',
          isFirstTime: true,
        };
        
        setUser(newUser);
        await saveUserToStorage(newUser);
        
        // Get user profile
        const { profile } = await DatabaseService.getUserProfile(supabaseUser.id);
        if (profile) {
          setUserProfile(profile);
        }
      }

      return { error };
    } catch (error) {
      console.error('Error during Google sign in:', error);
      return { error: { message: 'An unexpected error occurred' } };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await DatabaseService.signOut();
      
      if (!error) {
        await AsyncStorage.removeItem('user');
        setUser(null);
        setUserProfile(null);
      }

      return { error };
    } catch (error) {
      console.error('Error during sign out:', error);
      return { error: { message: 'An unexpected error occurred' } };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (preferences: any) => {
    if (!user) {
      return { error: { message: 'No user logged in' } };
    }

    try {
      const { error } = await DatabaseService.updateUserPreferences(user.id, preferences);
      
      if (!error && userProfile) {
        setUserProfile({ ...userProfile, preferences });
      }

      return { error };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updatePreferences,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 