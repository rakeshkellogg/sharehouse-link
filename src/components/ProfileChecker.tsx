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
    const checkProfile = async () => {
      if (!user || loading) return;
      
      // Skip profile check for certain routes
      const skipRoutes = ['/auth', '/onboarding/username', '/reset-password'];
      if (skipRoutes.includes(location.pathname)) {
        setProfileChecked(true);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking profile:', error);
        }

        // If user doesn't have a username, redirect to onboarding
        if (!profile?.username) {
          navigate('/onboarding/username');
          return;
        }

        setProfileChecked(true);
      } catch (error) {
        console.error('Error checking profile:', error);
        setProfileChecked(true);
      }
    };

    checkProfile();
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