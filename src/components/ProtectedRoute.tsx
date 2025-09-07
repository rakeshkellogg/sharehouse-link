import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isSuspended, setIsSuspended] = useState(false);
  const [checkingSuspension, setCheckingSuspension] = useState(false);

  useEffect(() => {
    const checkSuspension = async () => {
      if (user?.id) {
        setCheckingSuspension(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('suspended_at')
            .eq('user_id', user.id)
            .single();

          if (!error && data?.suspended_at) {
            setIsSuspended(true);
          } else {
            setIsSuspended(false);
          }
        } catch (error) {
          console.error('Error checking suspension status:', error);
          setIsSuspended(false);
        } finally {
          setCheckingSuspension(false);
        }
      }
    };

    checkSuspension();
  }, [user?.id]);

  if (loading || checkingSuspension) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isSuspended) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Account Suspended</h1>
          <p className="text-lg mb-4">Your account has been suspended.</p>
          <p className="text-sm opacity-70">Please contact support for assistance.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;