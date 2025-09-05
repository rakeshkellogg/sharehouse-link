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
        const { data, error } = await supabase
          .from('user_blocks' as any)
          .select('id')
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
          .or(`user_a.eq.${targetUserId},user_b.eq.${targetUserId}`)
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