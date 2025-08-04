# Baby Tracker Supabase Integration

This directory contains the Supabase client and API integration for the Baby Tracker React Native app.

## 📁 Structure

```
lib/
├── supabase.ts           # Supabase client configuration
├── types/
│   └── database.types.ts # TypeScript types (from Supabase backend)
├── api/
│   ├── auth.ts           # Authentication functions
│   ├── baby.ts           # Baby management functions
│   └── index.ts          # Export all APIs
└── README.md             # This file
```

## 🚀 Quick Start

### 1. Environment Setup

Ensure your `.env` file has the correct Supabase variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Basic Usage

```typescript
import { 
  signIn, 
  signUp, 
  getBabiesForCurrentUser, 
  createBabyProfile 
} from '@/lib/api'

// Authentication
await signUp('user@example.com', 'password', 'John Doe')
await signIn('user@example.com', 'password')

// Baby management
const babies = await getBabiesForCurrentUser()
const babyId = await createBabyProfile('Emma', '2024-01-15')
```

## 🔐 Authentication API

### `signUp(email, password, name)`
Creates a new user account with email and password.

```typescript
try {
  const { user } = await signUp('user@email.com', 'password123', 'John Doe')
  console.log('User created:', user?.id)
} catch (error) {
  console.error('Sign up failed:', error.message)
}
```

### `signIn(email, password)`
Signs in an existing user.

```typescript
try {
  const { user } = await signIn('user@email.com', 'password123')
  console.log('User signed in:', user?.id)
} catch (error) {
  console.error('Sign in failed:', error.message)
}
```

### `signOut()`
Signs out the current user.

```typescript
try {
  await signOut()
  console.log('User signed out')
} catch (error) {
  console.error('Sign out failed:', error.message)
}
```

### `getCurrentUser()`
Gets the current authenticated user's profile.

```typescript
try {
  const user = await getCurrentUser()
  if (user) {
    console.log('Current user:', user.name)
  } else {
    console.log('No user signed in')
  }
} catch (error) {
  console.error('Failed to get user:', error.message)
}
```

### `onAuthStateChange(callback)`
Listens for authentication state changes.

```typescript
const { data: { subscription } } = onAuthStateChange((user) => {
  if (user) {
    console.log('User signed in:', user.name)
  } else {
    console.log('User signed out')
  }
})

// Cleanup when component unmounts
return () => subscription.unsubscribe()
```

## 👶 Baby Management API

### `getBabiesForCurrentUser()`
Fetches all babies the current user has access to, including their role.

```typescript
try {
  const babies = await getBabiesForCurrentUser()
  babies.forEach(baby => {
    console.log(`${baby.name} (${baby.role}) - Born: ${baby.birthdate}`)
  })
} catch (error) {
  console.error('Failed to fetch babies:', error.message)
}
```

**Returns**: `BabyWithRole[]` - Array of baby profiles with user's role

### `createBabyProfile(name, birthdate)`
Creates a new baby profile and makes the current user an admin.

```typescript
try {
  const babyId = await createBabyProfile('Emma', '2024-01-15')
  console.log('Baby created with ID:', babyId)
} catch (error) {
  console.error('Failed to create baby:', error.message)
}
```

**Parameters**:
- `name` (string): Baby's name (required)
- `birthdate` (string): Birth date in YYYY-MM-DD format (required)

**Returns**: `string` - The new baby's ID

### `getBabyById(babyId)`
Gets a specific baby profile by ID (only if user has access).

```typescript
try {
  const baby = await getBabyById('baby-uuid')
  if (baby) {
    console.log(`Found baby: ${baby.name} (Role: ${baby.role})`)
  } else {
    console.log('Baby not found or no access')
  }
} catch (error) {
  console.error('Failed to fetch baby:', error.message)
}
```

### `updateBabyProfile(babyId, updates)`
Updates a baby profile (admin only).

```typescript
try {
  await updateBabyProfile('baby-uuid', {
    name: 'Emma Rose',
    birthdate: '2024-01-16'
  })
  console.log('Baby profile updated')
} catch (error) {
  console.error('Failed to update baby:', error.message)
}
```

## 🔄 React Native Integration

### Using with React Hooks

```typescript
import React, { useEffect, useState } from 'react'
import { getBabiesForCurrentUser, onAuthStateChange, BabyWithRole, User } from '@/lib/api'

export default function BabyScreen() {
  const [user, setUser] = useState<User | null>(null)
  const [babies, setBabies] = useState<BabyWithRole[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(setUser)
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      loadBabies()
    } else {
      setBabies([])
      setLoading(false)
    }
  }, [user])

  const loadBabies = async () => {
    try {
      setLoading(true)
      const fetchedBabies = await getBabiesForCurrentUser()
      setBabies(fetchedBabies)
    } catch (error) {
      console.error('Error loading babies:', error)
    } finally {
      setLoading(false)
    }
  }

  // Rest of your component...
}
```

### Error Handling

All API functions throw descriptive errors that you can catch and handle:

```typescript
try {
  await createBabyProfile('', '2024-01-15') // Empty name
} catch (error) {
  if (error.message.includes('Baby name is required')) {
    // Handle validation error
  } else if (error.message.includes('Authentication error')) {
    // Handle auth error
  } else {
    // Handle other errors
  }
}
```

## 🔧 TypeScript Support

All functions are fully typed with TypeScript. Import types as needed:

```typescript
import type { 
  User, 
  BabyProfile, 
  BabyWithRole, 
  UserRole 
} from '@/lib/api'

const user: User | null = await getCurrentUser()
const babies: BabyWithRole[] = await getBabiesForCurrentUser()
```

## 📱 React Native Considerations

- **Async Storage**: Supabase automatically uses React Native's AsyncStorage for session persistence
- **Deep Links**: Auth callbacks work with Expo's linking system
- **Network**: All requests work with React Native's networking stack
- **Security**: Uses secure storage for sensitive data

## 🛠️ Development Tips

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Loading States**: Use loading states for better UX
3. **Type Safety**: Use TypeScript types for better development experience
4. **Testing**: Test with real Supabase instance, not mocks
5. **Debugging**: Check console logs for detailed error messages

## 📚 Next Steps

- Add event tracking API functions
- Implement invite code system
- Add real-time subscriptions
- Set up push notifications
- Add offline support