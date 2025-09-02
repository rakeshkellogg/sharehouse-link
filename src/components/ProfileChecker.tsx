import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCheckerProps {
  children: React.ReactNode;
}

const ProfileChecker: React.FC<ProfileCheckerProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    const checkOrCreateProfile = async () => {
      if (!user || loading) return;

      // Skip profile check for certain routes
      const skipRoutes = ['/auth', '/onboarding/username', '/reset-password'];
      if (skipRoutes.includes(location.pathname)) {
        setProfileChecked(true);
        return;
      }

      try {
        // Try to get the user's profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, username, display_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
        }

        let finalProfile = profile;

        // If no profile exists (e.g., trigger didn't run), create one client-side
        if (!finalProfile) {
          const displayNameFallback = user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '');
          const { data: upserted, error: upsertError } = await supabase
            .from('profiles')
            .upsert({ user_id: user.id, display_name: displayNameFallback }, { onConflict: 'user_id' })
            .select('id, username, display_name')
            .maybeSingle();

          if (upsertError) {
            console.error('Error creating profile:', upsertError);
          } else {
            finalProfile = upserted || null;
          }
        }

        // If user doesn't have a username yet, redirect to onboarding
        if (!finalProfile?.username) {
          navigate('/onboarding/username');
          return;
        }

        setProfileChecked(true);
      } catch (err) {
        console.error('Error in profile check flow:', err);
        setProfileChecked(true);
      }
    };

    checkOrCreateProfile();
  }, [user, loading, location.pathname, navigate]);

  if (loading || (user && !profileChecked)) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProfileChecker;
