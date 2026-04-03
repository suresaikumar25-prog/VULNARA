"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SupabaseService } from '@/lib/supabaseService';

export interface AppUser {
  uid: string;
  email: string | null;
  name: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ needsConfirmation: boolean }>;
  logout: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to save/update user in Supabase
async function syncUserToSupabase(supabaseUser: unknown, name?: string) {
  try {
    const userId = supabaseUser.id;
    const email = supabaseUser.email || '';
    const displayName = name || supabaseUser.user_metadata?.name || '';

    const existingProfile = await SupabaseService.getUserProfile(userId).catch(() => null);

    if (existingProfile) {
      await SupabaseService.updateUserProfile(userId, { name: displayName, email });
    } else {
      await SupabaseService.createUserProfile(userId, email, displayName);
    }
  } catch (error) {
    console.error('Error syncing user to Supabase:', error);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          uid: session.user.id,
          email: session.user.email ?? null,
          name: session.user.user_metadata?.name ?? null,
        });
        syncUserToSupabase(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          uid: session.user.id,
          email: session.user.email ?? null,
          name: session.user.user_metadata?.name ?? null,
        });
        if (event === 'SIGNED_IN') {
          await syncUserToSupabase(session.user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Map Supabase errors to user-friendly messages
      if (error.message === 'Email not confirmed') {
        throw new Error('EMAIL_NOT_CONFIRMED');
      }
      if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw new Error(error.message);
    }

    if (data.user) {
      await syncUserToSupabase(data.user);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ needsConfirmation: boolean }> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      throw new Error(error.message);
    }

    // Note: Email confirmation has been disabled. Please ensure that "Confirm email" is disabled in the Supabase dashboard (Authentication -> Providers -> Email -> Confirm email).
    const needsConfirmation = false;

    // Sync profile - we assume it's immediately confirmed
    if (data.user) {
      await syncUserToSupabase(data.user, name);
    }

    return { needsConfirmation };
  };

  const resendConfirmation = async (email: string) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    resendConfirmation,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
