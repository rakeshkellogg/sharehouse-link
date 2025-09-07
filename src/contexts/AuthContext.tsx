import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSuspended: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);

  // Function to check if a user is suspended
  const checkUserSuspension = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('suspended_at')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error checking user suspension:', error);
        return false; // If we can't check, allow access
      }

      return data?.suspended_at !== null;
    } catch (error) {
      console.error('Error checking user suspension:', error);
      return false; // If we can't check, allow access
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Check if user is suspended
          const userSuspended = await checkUserSuspension(session.user.id);
          setIsSuspended(userSuspended);
          if (userSuspended) {
            // Don't sign out suspended users, just mark them as suspended
            // They can still see the sign in button but can't access content
            setSession(null);
            setUser(null);
            setLoading(false);
            return;
          }
        } else {
          setIsSuspended(false);
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Check if user is suspended
        const userSuspended = await checkUserSuspension(session.user.id);
        setIsSuspended(userSuspended);
        if (userSuspended) {
          // Don't sign out suspended users, just mark them as suspended
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
      } else {
        setIsSuspended(false);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    
    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data?.user) {
      // Check if user is suspended after successful login
      const userSuspended = await checkUserSuspension(data.user.id);
      if (userSuspended) {
        // Sign out suspended user and show error
        await supabase.auth.signOut();
        setIsSuspended(true);
        return { 
          error: { 
            message: "Your account is not available. Please contact support." 
          } 
        };
      }
    }
    
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    isSuspended,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};