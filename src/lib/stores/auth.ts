import { writable } from 'svelte/store'
import { supabase, isDemoMode } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
}

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true
}

export const auth = writable<AuthState>(initialState)

// Mock profiles for demo mode
const mockProfiles: Record<string, Profile> = {
  'admin@hospital.com': {
    id: 'admin-123',
    email: 'admin@hospital.com',
    full_name: 'Dr. Sarah Admin',
    role: 'admin',
    department: 'Administration',
    phone: '+1234567890',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  'doctor@hospital.com': {
    id: 'doctor-123',
    email: 'doctor@hospital.com',
    full_name: 'Dr. John Smith',
    role: 'doctor',
    department: 'Cardiology',
    phone: '+1234567891',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  'nurse@hospital.com': {
    id: 'nurse-123',
    email: 'nurse@hospital.com',
    full_name: 'Jane Wilson',
    role: 'nurse',
    department: 'ICU',
    phone: '+1234567892',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// Initialize auth state
if (isDemoMode) {
  // Demo mode initialization - start with no user (show login form)
  auth.set({ user: null, profile: null, loading: false })
} else {
  // Production mode with Supabase
  // Set a timeout to prevent infinite loading
  const timeoutId = setTimeout(() => {
    auth.update(state => ({ ...state, loading: false }))
  }, 5000)
  
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    clearTimeout(timeoutId)
    
    if (error) {
      console.error('Session error:', error)
      auth.set({ user: null, profile: null, loading: false })
      return
    }
    
    if (session?.user) {
      loadUserProfile(session.user)
    } else {
      auth.set({ user: null, profile: null, loading: false })
    }
  }).catch(error => {
    clearTimeout(timeoutId)
    console.error('Session check failed:', error)
    auth.set({ user: null, profile: null, loading: false })
  })

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      await loadUserProfile(session.user)
    } else {
      auth.set({ user: null, profile: null, loading: false })
    }
  })
}

async function loadUserProfile(user: User) {
  try {
    // Query user profile with timeout
    const queryPromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile query timeout')), 5000)
    )
    
    const result = await Promise.race([queryPromise, timeoutPromise]) as any
    const { data: profile, error } = result

    if (error) {
      console.error('Error loading profile:', error)
      
      if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
        console.warn('Profile not found for user:', user.email)
        console.warn('An administrator needs to create a profile for this user')
      }
      
      // Set user without profile - they won't be able to access protected areas
      auth.set({ user, profile: null, loading: false })
    } else {
      auth.set({ user, profile, loading: false })
    }
  } catch (error) {
    console.error('Profile loading failed:', error)
    // Set user without profile on exception
    auth.set({ user, profile: null, loading: false })
  }
}

export const signIn = async (email: string, password: string) => {
  // Basic validation
  if (!email || !password) {
    return { data: null, error: { message: 'Email and password are required' } }
  }
  
  if (password.length < 3) {
    return { data: null, error: { message: 'Password is too short' } }
  }
  
  if (isDemoMode) {
    // Mock authentication for demo
    const profile = mockProfiles[email.toLowerCase()]
    if (profile && password.endsWith('123')) {
      const mockUser = {
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at
      } as User
      
      auth.set({ user: mockUser, profile, loading: false })
      return { data: { user: mockUser, session: null }, error: null }
    } else {
      return { data: null, error: { message: 'Invalid credentials' } }
    }
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    return { data, error }
  } catch (exception) {
    console.error('Sign in failed:', exception)
    return { data: null, error: { message: 'Sign in failed' } }
  }
}

export const signOut = async () => {
  if (isDemoMode) {
    auth.set({ user: null, profile: null, loading: false })
    return { error: null }
  }
  
  try {
    const { error } = await supabase.auth.signOut()
    
    if (!error) {
      auth.set({ user: null, profile: null, loading: false })
    }
    
    return { error }
  } catch (exception) {
    console.error('Sign out failed:', exception)
    return { error: { message: 'Sign out failed' } }
  }
}

export const signUp = async (email: string, password: string, userData: {
  full_name: string
  role: Profile['role']
  department?: string
  phone?: string
}) => {
  if (isDemoMode) {
    return { data: null, error: { message: 'Sign up not available in demo mode' } }
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

// Force clear all auth data - useful for clearing stuck sessions
export const forceSignOut = async () => {
  try {
    await supabase.auth.signOut()
    localStorage.clear()
    auth.set({ user: null, profile: null, loading: false })
  } catch (error) {
    console.error('Force sign out failed:', error)
  }
}