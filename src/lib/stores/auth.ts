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
console.log('=== AUTH INITIALIZATION ===')
console.log('isDemoMode:', isDemoMode)
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)

if (isDemoMode) {
  // Demo mode initialization - start with no user (show login form)
  console.log('Initializing demo mode...')
  auth.set({ user: null, profile: null, loading: false })
  console.log('Auth state set to not loading immediately')
} else {
  console.log('Initializing production mode with Supabase...')
  
  // Quick test to check if profiles table is accessible
  console.log('Testing profiles table accessibility...')
  supabase.from('profiles').select('count', { count: 'exact', head: true })
    .then(({ count, error }) => {
      console.log('Profiles table test - Count:', count, 'Error:', error)
      if (error) {
        console.error('PROFILES TABLE IS NOT ACCESSIBLE:', error)
        console.error('This means either:')
        console.error('1. The table does not exist')
        console.error('2. RLS policies are blocking access')
        console.error('3. You need to run the setup_supabase.sql script')
      }
    })
  
  // Set a timeout to prevent infinite loading
  const timeoutId = setTimeout(() => {
    console.log('Auth timeout reached - setting loading to false')
    auth.update(state => ({ ...state, loading: false }))
  }, 3000)
  
  console.log('Getting Supabase session...')
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    console.log('=== SUPABASE GET SESSION RESPONSE ===')
    console.log('Session:', JSON.stringify(session, null, 2))
    console.log('Error:', JSON.stringify(error, null, 2))
    
    clearTimeout(timeoutId)
    
    if (error) {
      console.error('Session error:', error)
      auth.set({ user: null, profile: null, loading: false })
      return
    }
    
    if (session?.user) {
      console.log('User found in session, loading profile...')
      loadUserProfile(session.user)
    } else {
      console.log('No user found in session')
      auth.set({ user: null, profile: null, loading: false })
    }
  }).catch(error => {
    console.error('=== SUPABASE GET SESSION EXCEPTION ===')
    console.error('Exception:', error)
    clearTimeout(timeoutId)
    console.error('Session check failed:', error)
    auth.set({ user: null, profile: null, loading: false })
  })

  // Listen for auth changes
  console.log('Setting up auth state change listener...')
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('=== AUTH STATE CHANGE ===')
    console.log('Event:', event)
    console.log('Session:', JSON.stringify(session, null, 2))
    
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
  console.log('=== LOADING USER PROFILE ===')
  console.log('User ID:', user.id)
  console.log('User Email:', user.email)
  console.log('Full User Object:', JSON.stringify(user, null, 2))
  
  try {
    console.log('Querying profiles table...')
    
    // First, test if we can access the profiles table at all
    console.log('Testing table access...')
    const testQuery = supabase.from('profiles').select('count', { count: 'exact', head: true })
    const testTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Table access test timeout')), 3000)
    )
    
    try {
      const testResult = await Promise.race([testQuery, testTimeout])
      console.log('Table access test result:', testResult)
    } catch (testError) {
      console.error('Table access test failed:', testError)
    }
    
    // Now try the actual profile query with timeout
    const queryPromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile query timeout after 5 seconds')), 5000)
    )
    
    const result = await Promise.race([queryPromise, timeoutPromise]) as any
    const { data: profile, error } = result

    console.log('=== PROFILE QUERY RESULT ===')
    console.log('Profile Data:', JSON.stringify(profile, null, 2))
    console.log('Profile Error:', JSON.stringify(error, null, 2))

    if (error) {
      console.error('Error loading profile:', error)
      console.log('Error code:', error.code)
      console.log('Error message:', error.message)
      console.log('Error details:', error.details)
      
      // Don't try to create profile - this should be handled server-side
      if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
        console.log('Profile not found - this user needs a profile created by an admin')
        console.warn('⚠️ USER HAS NO PROFILE')
        console.warn('👉 An administrator needs to create a profile for this user')
        console.warn('👉 Or the user signup process needs to be fixed')
      }
      
      // Create a basic fallback profile for now (read-only, not saved to DB)
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
      console.log('Using temporary fallback profile (not saved to database):', fallbackProfile)
      auth.set({ user, profile: fallbackProfile, loading: false })
    } else {
      console.log('Profile loaded successfully:', profile)
      auth.set({ user, profile, loading: false })
    }
  } catch (error) {
    console.error('=== PROFILE LOADING EXCEPTION ===')
    console.error('Exception:', error)
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
  console.log('=== SIGN IN ATTEMPT ===')
  console.log('Email:', email)
  console.log('Password length:', password.length)
  console.log('Is Demo Mode:', isDemoMode)
  
  // Basic validation - NEVER skip this
  if (!email || !password) {
    console.error('❌ Email or password missing')
    return { data: null, error: { message: 'Email and password are required' } }
  }
  
  if (password.length < 3) {
    console.error('❌ Password too short')
    return { data: null, error: { message: 'Password is too short' } }
  }
  
  if (isDemoMode) {
    // Mock authentication for demo - still require proper credentials
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
  
  console.log('Attempting Supabase sign in...')
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    console.log('=== SUPABASE SIGN IN RESPONSE ===')
    console.log('Data:', JSON.stringify(data, null, 2))
    console.log('Error:', JSON.stringify(error, null, 2))
    console.log('User from data:', data?.user)
    console.log('Session from data:', data?.session)
    
    // Additional validation - ensure we actually got a user
    if (data?.user && !error) {
      console.log('✅ Authentication successful')
    } else {
      console.error('❌ Authentication failed:', error?.message || 'Unknown error')
    }
    
    return { data, error }
  } catch (exception) {
    console.error('=== SUPABASE SIGN IN EXCEPTION ===')
    console.error('Exception:', exception)
    return { data: null, error: { message: 'Sign in failed with exception' } }
  }
}

export const signOut = async () => {
  console.log('=== SIGN OUT ATTEMPT ===')
  console.log('Is Demo Mode:', isDemoMode)
  
  if (isDemoMode) {
    console.log('Demo mode sign out')
    auth.set({ user: null, profile: null, loading: false })
    return { error: null }
  }
  
  console.log('Attempting Supabase sign out...')
  try {
    const { error } = await supabase.auth.signOut()
    console.log('Sign out result:', error)
    
    if (!error) {
      console.log('✅ Sign out successful')
      auth.set({ user: null, profile: null, loading: false })
    } else {
      console.error('❌ Sign out failed:', error)
    }
    
    return { error }
  } catch (exception) {
    console.error('❌ Sign out exception:', exception)
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

// Temporary debug function - remove after fixing
export const debugSupabase = async () => {
  console.log('=== SUPABASE DEBUG TEST ===')
  
  try {
    // Test 1: Check if table exists
    console.log('Testing table existence...')
    const { data: tableTest, error: tableError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    console.log('Table existence test:', { tableTest, tableError })
    
    if (tableError) {
      console.log('=== TABLE ERROR ANALYSIS ===')
      console.log('Error code:', tableError.code)
      console.log('Error message:', tableError.message)
      console.log('Error details:', tableError.details)
      console.log('Error hint:', tableError.hint)
      
      if (tableError.message?.includes('relation') && tableError.message?.includes('does not exist')) {
        console.error('❌ PROFILES TABLE DOES NOT EXIST')
        console.error('👉 You need to create the table first!')
        return
      }
      
      if (tableError.code === '42501' || tableError.message?.includes('permission denied')) {
        console.error('❌ RLS IS BLOCKING ACCESS')
        console.error('👉 Row Level Security policies are preventing access')
        return
      }
      
      if (tableError.code === 'PGRST301') {
        console.error('❌ RLS ENABLED BUT NO POLICIES ALLOW ACCESS')
        console.error('👉 Table has RLS enabled but no policies allow your user to access it')
        return
      }
    }
    
    // Test 2: If table exists, try basic operations
    if (!tableError) {
      console.log('✅ Table exists! Testing operations...')
      
      // Test SELECT (users should be able to read their own profile)
      console.log('Testing SELECT permission...')
      const { data: selectTest, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      console.log('SELECT test:', { selectTest, selectError })
      
      if (selectError) {
        if (selectError.code === 'PGRST301') {
          console.warn('🔒 SELECT blocked by RLS - this might be normal if user has no profile')
        } else {
          console.error('❌ SELECT permission denied:', selectError)
        }
      } else if (selectTest.length === 0) {
        console.warn('⚠️ No profiles found - user may need profile created by admin')
      } else {
        console.log('✅ SELECT works - found profiles')
      }
    }
    
  } catch (error) {
    console.error('Debug test exception:', error)
  }
}

// Function to check RLS status
export const checkRLS = async () => {
  console.log('=== RLS CHECK ===')
  
  try {
    // This will tell us if RLS is the issue
    const { data, error } = await supabase.rpc('check_table_rls', {
      table_name: 'profiles'
    }).single()
    
    console.log('RLS check result:', { data, error })
  } catch (error) {
    console.log('RLS check not available (custom function not found)')
    
    // Alternative: Try to query the table and analyze the error
    const { data, error: queryError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (queryError) {
      console.log('=== QUERY ERROR ANALYSIS ===')
      console.log('Error code:', queryError.code)
      console.log('Error message:', queryError.message)
      
      // Common RLS error patterns
      if (queryError.code === 'PGRST301') {
        console.error('🔒 RLS is enabled but no policies allow access')
        console.error('👉 Either disable RLS or create proper policies')
      } else if (queryError.code === '42501') {
        console.error('🔒 Permission denied - likely RLS blocking access')
      } else if (queryError.message?.includes('relation') && queryError.message?.includes('does not exist')) {
        console.error('❌ Table does not exist')
      } else {
        console.error('❓ Unknown error:', queryError)
      }
    } else {
      console.log('✅ Table is accessible!')
    }
  }
}

// Force clear all auth data - for debugging
export const forceSignOut = async () => {
  console.log('=== FORCE SIGN OUT ===')
  
  try {
    // Clear Supabase session
    await supabase.auth.signOut()
    
    // Clear local storage
    localStorage.clear()
    
    // Clear auth store
    auth.set({ user: null, profile: null, loading: false })
    
    console.log('✅ Force sign out complete')
  } catch (error) {
    console.error('❌ Force sign out failed:', error)
  }
}