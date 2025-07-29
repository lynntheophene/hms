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
  // Demo mode initialization
  setTimeout(() => {
    auth.update(state => ({ ...state, loading: false }))
  }, 1000) // Simulate loading delay
} else {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      loadUserProfile(session.user)
    } else {
      auth.update(state => ({ ...state, loading: false }))
    }
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
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    auth.set({ user, profile, loading: false })
  } catch (error) {
    console.error('Error loading user profile:', error)
    auth.set({ user, profile: null, loading: false })
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