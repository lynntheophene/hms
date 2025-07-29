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
  console.log('Initializing demo mode...')
  auth.set({ user: null, profile: null, loading: false })
  console.log('Auth state set to not loading immediately')
} else {
  // Set a timeout to prevent infinite loading
  const timeoutId = setTimeout(() => {
    auth.update(state => ({ ...state, loading: false }))
  }, 3000)
  
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
    console.log('Auth state change:', event, 'Session:', session)
    if (session?.user) {
      console.log('User found in session, loading profile...')
      await loadUserProfile(session.user)
    } else {
      console.log('No user in session, setting auth to logged out')
      auth.set({ user: null, profile: null, loading: false })
    }
  })
}

async function loadUserProfile(user: User) {
  console.log('Loading profile for user:', user.id, user.email)
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('Profile query result:', { profile, error })

    if (error) {
      console.error('Error loading profile:', error)
      // Create a basic profile if not found
      const fallbackProfile = {
        id: user.id,
        email: user.email || '',
        full_name: user.email?.split('@')[0] || 'User',
        role: 'admin' as const,
        department: 'Administration',
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      console.log('Using fallback profile:', fallbackProfile)
      auth.set({ user, profile: fallbackProfile, loading: false })
    } else {
      console.log('Profile loaded successfully:', profile)
      auth.set({ user, profile, loading: false })
    }
  } catch (error) {
    console.error('Exception in loadUserProfile:', error)
    // Create fallback profile on exception
    const fallbackProfile = {
      id: user.id,
      email: user.email || '',
      full_name: user.email?.split('@')[0] || 'User',
      role: 'admin' as const,
      department: 'Administration', 
      phone: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    console.log('Using fallback profile due to exception:', fallbackProfile)
    auth.set({ user, profile: fallbackProfile, loading: false })
  }
}

export const signIn = async (email: string, password: string) => {
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
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  if (isDemoMode) {
    auth.set({ user: null, profile: null, loading: false })
    return { error: null }
  }
  
  const { error } = await supabase.auth.signOut()
  return { error }
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