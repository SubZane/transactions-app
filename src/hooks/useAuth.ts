import { useEffect, useState } from 'react'

import { Session } from '@supabase/supabase-js'

import { supabase } from '../lib/supabase'
import { userService } from '../services/user.service'

import type { AuthState, LoginCredentials, SignUpCredentials } from '../types/auth.types'

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const loadUserProfile = async (session: Session | null) => {
    if (!session?.user) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      return
    }

    try {
      // Get or create user in database using Supabase user ID
      const dbUser = await userService.getOrCreate(session.user.id, session.user.email || '', {
        firstname: '',
        surname: '',
      })

      setAuthState({
        user: {
          id: session.user.id,
          dbId: dbUser.id, // Add database ID
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
          avatar: session.user.user_metadata?.avatar_url,
          firstname: dbUser.firstname,
          surname: dbUser.surname,
        },
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Fallback to Supabase user only
      setAuthState({
        user: {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
          avatar: session.user.user_metadata?.avatar_url,
        },
        isAuthenticated: true,
        isLoading: false,
      })
    }
  }

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserProfile(session)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserProfile(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async ({ email, password }: LoginCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async ({ email, password, name }: SignUpCredentials) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const refreshUserProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    await loadUserProfile(session)
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    refreshUserProfile,
  }
}
