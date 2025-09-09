import { useEffect } from 'react';
import { readDrafts, removeDraft } from '@/lib/pwaCache';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useOfflineSync() {
  const { toast } = useToast();

  useEffect(() => {
    async function trySync() {
      try {
        const drafts = await readDrafts();
        
        for (const draft of drafts) {
          try {
            const { error } = await supabase.from('listings').insert([draft.payload]);
            
            if (!error) {
              await removeDraft(draft.key);
              toast({ 
                title: 'Draft published', 
                description: 'Your offline listing was posted successfully.' 
              });
            }
          } catch (err) {
            // Keep draft for next retry
            console.log('Failed to sync draft:', err);
          }
        }
      } catch (err) {
        console.log('Sync error:', err);
      }
    }

    const handleOnline = () => {
      console.log('Back online - attempting to sync drafts');
      trySync();
    };

    window.addEventListener('online', handleOnline);
    
    // Run once on mount if already online
    if (navigator.onLine) {
      trySync();
    }
    
    return () => window.removeEventListener('online', handleOnline);
  }, [toast]);
}
