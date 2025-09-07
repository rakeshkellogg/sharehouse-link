import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, MessageCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotificationListener = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Handle post-auth navigation for saved listings
    const pendingAction = sessionStorage.getItem('pendingListingSave');
    const returnTo = sessionStorage.getItem('returnTo');
    
    if (pendingAction && returnTo && returnTo.includes('/listing/')) {
      // Let the ListingDetail component handle the save action
      // Just navigate back to the listing
      sessionStorage.removeItem('returnTo');
      window.location.href = returnTo;
      return;
    }

    console.log('Setting up notification listener for user:', user.id);

    // Create a channel to listen for new messages
    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `owner_user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New message notification received:', payload);
          
          // Get the message details and listing info
          try {
            const { data: messageData, error: messageError } = await supabase
              .from('messages')
              .select(`
                id,
                body,
                sender_user_id,
                listing_id,
                created_at
              `)
              .eq('id', payload.new.id)
              .single();

            if (messageError) throw messageError;

            // Get listing title
            const { data: listingData, error: listingError } = await supabase
              .from('listings')
              .select('title')
              .eq('id', messageData.listing_id)
              .single();

            const listingTitle = listingData?.title || 'Your Property';

            // Show toast notification
            toast({
              title: "📩 New Message Received!",
              description: (
                <div className="space-y-2">
                  <p className="font-medium">About: {listingTitle}</p>
                  <p className="text-sm opacity-90">
                    {messageData.body.length > 60 
                      ? `${messageData.body.slice(0, 60)}...` 
                      : messageData.body
                    }
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6"
                      onClick={() => {
                        window.open(`/listing/${messageData.listing_id}`, '_blank');
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Listing
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="text-xs h-6"
                      onClick={() => {
                        window.location.href = '/inbox';
                      }}
                    >
                      <Bell className="w-3 h-3 mr-1" />
                      View Inbox
                    </Button>
                  </div>
                </div>
              ),
              duration: 8000, // Show for 8 seconds
            });

          } catch (error) {
            console.error('Error processing message notification:', error);
            
            // Fallback notification
            toast({
              title: "📩 New Message Received!",
              description: "You have a new message about one of your listings.",
              action: (
                <Button
                  size="sm"
                  onClick={() => {
                    window.location.href = '/inbox';
                  }}
                >
                  View Inbox
                </Button>
              ),
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Notification listener subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up notification listener');
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // This component doesn't render anything
  return null;
};

export default NotificationListener;