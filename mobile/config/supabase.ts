// Supabase Configuration
// Replace these values with your actual Supabase project credentials

export const SUPABASE_CONFIG = {
  // Your Supabase project URL
  url: 'https://your-project-id.supabase.co',
  
  // Your Supabase anon/public key
  anonKey: 'your-anon-key-here',
  
  // Optional: Service role key for admin operations (keep secret!)
  serviceRoleKey: 'your-service-role-key-here',
};

// OAuth Configuration
export const OAUTH_CONFIG = {
  // Google OAuth redirect URL
  redirectUrl: 'safely://auth/callback',
  
  // Allowed OAuth providers
  providers: ['google'] as const,
};

// Database table names
export const TABLES = {
  USER_PROFILES: 'user_profiles',
  DETECTION_EVENTS: 'detection_events',
  USAGE_SESSIONS: 'usage_sessions',
  USER_SETTINGS: 'user_settings',
} as const;

// RLS (Row Level Security) policies
export const POLICIES = {
  USER_PROFILES: {
    SELECT: 'Users can view own profile',
    UPDATE: 'Users can update own profile',
    INSERT: 'Users can insert own profile',
  },
  DETECTION_EVENTS: {
    SELECT: 'Users can view own detection events',
    INSERT: 'Users can insert own detection events',
  },
  USAGE_SESSIONS: {
    SELECT: 'Users can view own usage sessions',
    INSERT: 'Users can insert own usage sessions',
    UPDATE: 'Users can update own usage sessions',
  },
  USER_SETTINGS: {
    SELECT: 'Users can view own settings',
    INSERT: 'Users can insert own settings',
    UPDATE: 'Users can update own settings',
  },
} as const;

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
} as const;

// Analytics configuration
export const ANALYTICS_CONFIG = {
  // How long to keep detection events (in days)
  retentionDays: 90,
  
  // Maximum events per user per day
  maxEventsPerDay: 1000,
  
  // Batch size for analytics queries
  batchSize: 100,
} as const; 