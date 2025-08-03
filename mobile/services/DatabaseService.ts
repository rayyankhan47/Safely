import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestionnaireData } from '../components/Questionnaire';

import { SUPABASE_CONFIG, OAUTH_CONFIG, TABLES } from '../config/supabase';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
  preferences: QuestionnaireData;
  subscription_tier: 'free' | 'premium';
  last_active: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

class DatabaseService {
  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<{ user: any; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.status?.toString() } };
      }

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, email, firstName, lastName);
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: { message: 'An unexpected error occurred during sign up' } 
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<{ user: any; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.status?.toString() } };
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: { message: 'An unexpected error occurred during sign in' } 
      };
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<{ user: any; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: OAUTH_CONFIG.redirectUrl,
        }
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.status?.toString() } };
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: { message: 'An unexpected error occurred during Google sign in' } 
      };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: { message: error.message, code: error.status?.toString() } };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred during sign out' } };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<{ user: any; error: AuthError | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return { user: null, error: { message: error.message, code: error.status?.toString() } };
      }

      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: { message: 'An unexpected error occurred while getting user' } 
      };
    }
  }

  /**
   * Create user profile
   */
  async createUserProfile(userId: string, email: string, firstName: string, lastName: string): Promise<{ profile: UserProfile | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .insert([
          {
            id: userId,
            email,
            first_name: firstName,
            last_name: lastName,
            subscription_tier: 'free',
            preferences: null,
          }
        ])
        .select()
        .single();

      if (error) {
        return { profile: null, error: { message: error.message, code: error.code } };
      }

      return { profile: data, error: null };
    } catch (error) {
      return { 
        profile: null, 
        error: { message: 'An unexpected error occurred while creating profile' } 
      };
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { profile: null, error: { message: error.message, code: error.code } };
      }

      return { profile: data, error: null };
    } catch (error) {
      return { 
        profile: null, 
        error: { message: 'An unexpected error occurred while getting profile' } 
      };
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: QuestionnaireData): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase
        .from(TABLES.USER_PROFILES)
        .update({ 
          preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        return { error: { message: error.message, code: error.code } };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: { message: 'An unexpected error occurred while updating preferences' } 
      };
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(userId: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase
        .from(TABLES.USER_PROFILES)
        .update({ last_active: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        return { error: { message: error.message, code: error.code } };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: { message: 'An unexpected error occurred while updating last active' } 
      };
    }
  }

  /**
   * Upgrade to premium subscription
   */
  async upgradeToPremium(userId: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase
        .from(TABLES.USER_PROFILES)
        .update({ 
          subscription_tier: 'premium',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        return { error: { message: error.message, code: error.code } };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: { message: 'An unexpected error occurred while upgrading subscription' } 
      };
    }
  }

  /**
   * Save detection event (for analytics)
   */
  async saveDetectionEvent(userId: string, event: {
    soundType: string;
    confidence: number;
    isCritical: boolean;
    timestamp: string;
  }): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase
        .from(TABLES.DETECTION_EVENTS)
        .insert([{
          user_id: userId,
          sound_type: event.soundType,
          confidence: event.confidence,
          is_critical: event.isCritical,
          timestamp: event.timestamp,
        }]);

      if (error) {
        return { error: { message: error.message, code: error.code } };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: { message: 'An unexpected error occurred while saving detection event' } 
      };
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string, days: number = 30): Promise<{ analytics: any; error: AuthError | null }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from(TABLES.DETECTION_EVENTS)
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        return { analytics: null, error: { message: error.message, code: error.code } };
      }

      // Process analytics data
      const analytics = {
        totalDetections: data.length,
        criticalDetections: data.filter(e => e.is_critical).length,
        soundTypeBreakdown: data.reduce((acc, event) => {
          acc[event.sound_type] = (acc[event.sound_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        averageConfidence: data.reduce((sum, event) => sum + event.confidence, 0) / data.length,
        dailyUsage: data.reduce((acc, event) => {
          const date = new Date(event.timestamp).toDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      return { analytics, error: null };
    } catch (error) {
      return { 
        analytics: null, 
        error: { message: 'An unexpected error occurred while getting analytics' } 
      };
    }
  }
}

// Export singleton instance
export default new DatabaseService(); 