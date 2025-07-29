import { writable } from 'svelte/store'
import { supabase } from '../supabase'
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

// Initialize auth state
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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const signUp = async (email: string, password: string, userData: {
  full_name: string
  role: Profile['role']
  department?: string
  phone?: string
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}