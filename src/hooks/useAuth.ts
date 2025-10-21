import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AuthState, LoginCredentials, SignUpCredentials } from '../types/auth.types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user
          ? {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name,
              avatar: session.user.user_metadata?.avatar_url,
            }
          : null,
        isAuthenticated: !!session,
        isLoading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user
          ? {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name,
              avatar: session.user.user_metadata?.avatar_url,
            }
          : null,
        isAuthenticated: !!session,
        isLoading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async ({ email, password }: LoginCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async ({ email, password, name }: SignUpCredentials) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
};
