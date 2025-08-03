# Supabase Setup Guide for Safely

This guide will help you set up Supabase for the Safely app authentication and database functionality.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `safely-app`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for the project to be created (2-3 minutes)

## 2. Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## 3. Update Configuration

1. Open `mobile/config/supabase.ts`
2. Replace the placeholder values:

```typescript
export const SUPABASE_CONFIG = {
  url: 'https://your-actual-project-id.supabase.co',
  anonKey: 'your-actual-anon-key-here',
  serviceRoleKey: 'your-service-role-key-here', // Optional
};
```

## 4. Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase/schema.sql`
3. Paste it into the SQL editor
4. Click "Run" to execute the schema

This will create:
- `user_profiles` table for user data
- `detection_events` table for analytics
- `usage_sessions` table for tracking
- `user_settings` table for preferences
- Row Level Security (RLS) policies
- Automatic triggers and functions

## 5. Configure Authentication

### Email/Password Auth
1. Go to **Authentication** → **Settings**
2. Enable "Enable email confirmations" (optional)
3. Configure email templates if needed

### Google OAuth
1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Get Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - **Enable Google Identity Platform** (or Google Sign-In API):
     - Go to **APIs & Services** → **Library**
     - Search for "Google Identity Platform" or "Google Sign-In API"
     - Click and **Enable**
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - `safely://auth/callback` (for mobile app)
4. Copy the Client ID and Client Secret
5. Paste them into Supabase Google provider settings

## 6. Configure Row Level Security (RLS)

The schema already includes RLS policies, but verify they're working:

1. Go to **Authentication** → **Policies**
2. Check that all tables have RLS enabled
3. Verify policies are created for each table

## 7. Test the Setup

1. Run the app: `npm start`
2. Try to sign up with email/password
3. Check Supabase dashboard → **Authentication** → **Users** to see the new user
4. Check **Table Editor** → **user_profiles** to see the profile was created

## 8. Environment Variables (Optional)

For production, you can use environment variables:

1. Create `.env` file in the mobile directory:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

2. Update `mobile/config/supabase.ts`:
```typescript
export const SUPABASE_CONFIG = {
  url: process.env.SUPABASE_URL || 'https://your-project-id.supabase.co',
  anonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
};
```

## 9. Troubleshooting

### Common Issues:

1. **"Invalid API key" error**
   - Check that you copied the correct anon key
   - Verify the project URL is correct

2. **"Table doesn't exist" error**
   - Run the schema.sql file in Supabase SQL Editor
   - Check that all tables were created

3. **"RLS policy violation" error**
   - Verify RLS policies are created
   - Check that user is authenticated

4. **Google OAuth not working**
   - Verify redirect URIs are correct
   - Check Google Cloud Console settings
   - Ensure Google+ API is enabled

### Getting Help:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## 10. Next Steps

Once Supabase is set up:

1. **Test authentication flow** - Sign up, sign in, sign out
2. **Test questionnaire data** - Complete questionnaire and verify data is saved
3. **Set up analytics** - Test detection event logging
4. **Configure monitoring** - Set up alerts and monitoring

## Security Notes

- Never commit your service role key to version control
- Use environment variables for production
- Regularly rotate your API keys
- Monitor your database usage and costs
- Set up proper backup strategies

---

**Your Supabase setup is now complete! The Safely app should have full authentication and database functionality.** 