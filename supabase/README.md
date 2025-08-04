# Baby Tracker Supabase Backend

This directory contains the complete backend setup for the Baby Tracker app using Supabase.

## 🏗️ Architecture Overview

- **Authentication**: Email/password + magic link support
- **User Management**: Extended user profiles with GDPR compliance
- **Baby Profiles**: Shareable baby profiles with role-based access
- **Event Tracking**: Comprehensive activity tracking (nursing, sleep, etc.)
- **Invite System**: Secure one-time codes for sharing access
- **Security**: Row Level Security (RLS) for data isolation

## 📁 File Structure

```
supabase/
├── schema.sql           # Database tables and indexes
├── rls-policies.sql     # Row Level Security policies
├── functions.sql        # Database functions for complex operations
└── README.md           # This file

lib/
├── supabase.ts         # Supabase client configuration
├── types/
│   └── database.types.ts # TypeScript types
└── api/
    ├── auth.ts         # Authentication functions
    ├── babies.ts       # Baby management functions
    ├── events.ts       # Event tracking functions
    ├── invites.ts      # Invite code functions
    └── index.ts        # Export all APIs
```

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project in the **EU region** (for GDPR compliance)
3. Wait for the project to be ready

### 2. Run Database Setup

Execute the SQL files in order in your Supabase SQL editor:

```sql
-- 1. Create tables and triggers
\i schema.sql

-- 2. Set up Row Level Security
\i rls-policies.sql

-- 3. Create functions
\i functions.sql
```

### 3. Configure Environment

Create `.env.local` in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 5. Generate Types (Optional)

```bash
# Install Supabase CLI
npm install -g supabase

# Generate types
supabase gen types typescript --project-id your-project-id > lib/types/database.types.ts
```

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:

- Users can only see babies they have access to
- Only admins can manage baby profiles and invite codes
- Users can only edit their own events
- Invite codes are properly scoped and validated

### GDPR Compliance

- **Right to Access**: `get_user_data_summary()` function
- **Right to Deletion**: `delete_user_account()` function with cascade delete
- **Data Minimization**: Only necessary data is stored
- **EU Region**: Use Supabase EU region for data residency

## 📊 Database Schema

### Core Tables

- **users** - Extended user profiles
- **baby_profiles** - Baby information and metadata
- **user_baby_links** - Many-to-many relationship with roles
- **events** - Activity tracking with flexible metadata
- **invite_codes** - Temporary sharing codes

### Key Relationships

```
users ←→ user_baby_links ←→ baby_profiles
                ↓
             events
users ←→ invite_codes → baby_profiles
```

## 🎯 Usage Examples

### Authentication

```typescript
import { signUp, signIn, getCurrentUser } from '@/lib/api'

// Sign up
await signUp('user@example.com', 'password', 'John Doe')

// Sign in
await signIn('user@example.com', 'password')

// Get current user
const user = await getCurrentUser()
```

### Baby Management

```typescript
import { createBaby, getBabiesForUser } from '@/lib/api'

// Create baby (user becomes admin)
const babyId = await createBaby('Emma', '2024-01-15')

// Get user's babies
const babies = await getBabiesForUser()
```

### Event Tracking

```typescript
import { createNursingEvent, createSleepEvent, getEventsForBaby } from '@/lib/api'

// Log nursing session
await createNursingEvent(babyId, 'left', 1200, {
  notes: 'Good feeding session'
})

// Log sleep
await createSleepEvent(babyId, 7200, {
  timestamp: new Date('2024-01-15T22:00:00')
})

// Get events
const events = await getEventsForBaby(babyId, 20)
```

### Invite System

```typescript
import { createInviteCode, redeemInviteCode, validateInviteCode } from '@/lib/api'

// Create invite (admin only)
const code = await createInviteCode(babyId, 'guest', 7)
console.log(`Share this code: ${code}`)

// Validate before redeeming
const validation = await validateInviteCode(code)
if (validation.valid) {
  const babyId = await redeemInviteCode(code)
}
```

## 🛠️ Customization

### Adding New Event Types

1. Update the `EventType` enum in `schema.sql`
2. Add metadata types in `database.types.ts`
3. Create helper functions in `events.ts`

### Custom User Fields

1. Add columns to `users` table
2. Update the `User` type
3. Modify the `handle_new_user()` trigger

### Additional Security

Consider adding these for production:

- Rate limiting on invite code creation
- Email verification for new users
- Audit logging for sensitive operations
- Backup and recovery procedures

## 🐛 Troubleshooting

### Common Issues

1. **RLS Policies Not Working**
   - Ensure policies are applied after table creation
   - Check that `auth.uid()` is properly used
   - Verify user is authenticated

2. **Function Errors**
   - Check function permissions (`SECURITY DEFINER`)
   - Ensure proper error handling
   - Validate input parameters

3. **Type Errors**
   - Regenerate types after schema changes
   - Check for null handling in TypeScript
   - Validate enum values match database

### Debug Queries

```sql
-- Check user's baby access
SELECT bp.name, ubl.role 
FROM baby_profiles bp
JOIN user_baby_links ubl ON bp.id = ubl.baby_id
WHERE ubl.user_id = auth.uid();

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📈 Performance Tips

1. **Indexes**: All critical queries have supporting indexes
2. **Pagination**: Use `range()` for large event lists
3. **Selective Queries**: Only fetch needed columns
4. **Caching**: Consider Redis for frequently accessed data

## 🔄 Migration Guide

When updating the schema:

1. Create migration SQL files
2. Test in staging environment
3. Backup production data
4. Apply migrations during low traffic
5. Update TypeScript types
6. Deploy application updates

This backend provides a solid foundation for a production-ready baby tracking application with proper security, scalability, and GDPR compliance.