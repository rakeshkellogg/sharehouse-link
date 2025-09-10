import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useBlockStatus = (targetUserId: string) => {
  const { user } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkBlockStatus = async () => {
      if (!user || user.id === targetUserId) {
        setIsLoading(false);
        return;
      }

      try {
        // Use normalized pair checking with the new schema
        const { data, error } = await supabase
          .from('user_blocks')
          .select('id')
          .eq('user_a', user.id < targetUserId ? user.id : targetUserId)
          .eq('user_b', user.id < targetUserId ? targetUserId : user.id)
          .is('removed_at', null)
          .maybeSingle();

        if (error) throw error;
        setIsBlocked(!!data);
      } catch (error) {
        console.error('Error checking block status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkBlockStatus();
  }, [user, targetUserId]);

  return { isBlocked, isLoading, refetch: () => {
    setIsLoading(true);
    // Re-run the effect by updating state
  }};
};